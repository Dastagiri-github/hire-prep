from datetime import datetime, timedelta

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import crud
import database
import dependencies
import email_service
import models
import schemas
import utils
from config import settings

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # seconds


# ─────────────────────────────────────────────
# Helper: set / clear the httpOnly refresh cookie
# ─────────────────────────────────────────────
def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="none",
        path="/auth",
    )


# ─────────────────────────────────────────────
# POST /auth/register
# ─────────────────────────────────────────────
@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if crud.get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user, temp_password = crud.create_user(db=db, user=user)

    # Send welcome email with temp password (fire-and-forget — don't fail if SMTP fails)
    try:
        email_service.send_temp_password_email(
            to_email=db_user.email,
            name=db_user.name or db_user.username,
            username=db_user.username,
            temp_password=temp_password,
        )
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to send welcome email:")
        traceback.print_exc()

    return db_user


# ─────────────────────────────────────────────
# POST /auth/login
# ─────────────────────────────────────────────
@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue access token (short-lived)
    access_token = utils.create_access_token(data={"sub": user.username})

    # Issue refresh token and persist in DB
    refresh_token_str = utils.create_refresh_token(data={"sub": user.username})
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = models.RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        expires_at=expires_at,
    )
    db.add(db_refresh)
    db.commit()

    _set_refresh_cookie(response, refresh_token_str)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "reset_password": user.reset_password,
    }


# ─────────────────────────────────────────────
# POST /auth/refresh
# ─────────────────────────────────────────────
@router.post("/refresh", response_model=schemas.RefreshResponse)
def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: Session = Depends(database.get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not refresh_token:
        raise credentials_exception

    from jose import JWTError, jwt as jose_jwt
    try:
        payload = jose_jwt.decode(refresh_token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db_token = (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token == refresh_token)
        .first()
    )
    if not db_token or db_token.revoked or db_token.expires_at < datetime.utcnow():
        _clear_refresh_cookie(response)
        raise credentials_exception

    # Rotate: revoke old, issue new
    db_token.revoked = True
    new_access_token = utils.create_access_token(data={"sub": username})
    new_refresh_str = utils.create_refresh_token(data={"sub": username})
    new_expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = models.RefreshToken(
        token=new_refresh_str,
        user_id=db_token.user_id,
        expires_at=new_expires,
    )
    db.add(new_db_token)
    db.commit()

    _set_refresh_cookie(response, new_refresh_str)
    return {"access_token": new_access_token, "token_type": "bearer"}


# ─────────────────────────────────────────────
# POST /auth/logout
# ─────────────────────────────────────────────
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: Session = Depends(database.get_db),
):
    if refresh_token:
        db_token = (
            db.query(models.RefreshToken)
            .filter(models.RefreshToken.token == refresh_token)
            .first()
        )
        if db_token:
            db_token.revoked = True
            db.commit()

    _clear_refresh_cookie(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# POST /auth/change-password
# ─────────────────────────────────────────────
@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    body: schemas.ChangePasswordRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    # Validate new passwords match
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    # Verify the temp password (current password) is correct
    if not crud.verify_password(body.temp_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update password and clear reset flag
    current_user.hashed_password = crud.get_password_hash(body.new_password)
    current_user.reset_password = 0
    db.commit()

    return {"message": "Password changed successfully"}


# ─────────────────────────────────────────────
# GET /auth/me
# ─────────────────────────────────────────────
@router.get("/me", response_model=schemas.User)
async def read_users_me(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    solved_count = (
        db.query(models.Submission.problem_id)
        .filter(
            models.Submission.user_id == current_user.id,
            models.Submission.status == "Accepted",
        )
        .distinct()
        .count()
    )

    stats = dict(current_user.stats) if current_user.stats else {}
    if stats.get("totalSolved") != solved_count:
        stats["totalSolved"] = solved_count
        current_user.stats = stats
        db.commit()
        db.refresh(current_user)

    return current_user
