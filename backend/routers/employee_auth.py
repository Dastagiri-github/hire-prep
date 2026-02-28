from datetime import datetime, timedelta

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import crud
import database
import email_service
import models
import schemas
import utils
from config import settings

router = APIRouter(
    prefix="/employee/auth",
    tags=["employee_auth"],
)

EMPLOYEE_REFRESH_COOKIE_NAME = "employee_refresh_token"
REFRESH_TOKEN_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # seconds


# ─────────────────────────────────────────────
# Helper: set / clear the httpOnly refresh cookie
# ─────────────────────────────────────────────
def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=EMPLOYEE_REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/employee/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=EMPLOYEE_REFRESH_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="none",
        path="/employee/auth",
    )


# ─────────────────────────────────────────────
# POST /employee/auth/register
# ─────────────────────────────────────────────
@router.post("/register", response_model=schemas.Employee)
def register(employee: schemas.EmployeeCreate, db: Session = Depends(database.get_db)):
    if crud.get_employee_by_username(db, username=employee.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    db_employee_by_email = db.query(models.Employee).filter(models.Employee.email == employee.email).first()
    if db_employee_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_employee, temp_password = crud.create_employee(db=db, employee=employee)

    # Send welcome email using the existing email service
    try:
        email_service.send_temp_password_email(
            to_email=db_employee.email,
            name=db_employee.name or db_employee.username,
            username=db_employee.username,
            temp_password=temp_password,
        )
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to send employee welcome email:")
        traceback.print_exc()

    return db_employee


# ─────────────────────────────────────────────
# POST /employee/auth/google
# ─────────────────────────────────────────────
@router.post("/google", response_model=schemas.Token)
def google_auth(
    response: Response,
    body: schemas.GoogleAuthRequest,
    db: Session = Depends(database.get_db),
):
    try:
        idinfo = id_token.verify_oauth2_token(
            body.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Auth Error: {str(e)}")

    email = idinfo.get("email")
    name = idinfo.get("name")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    employee = db.query(models.Employee).filter(models.Employee.email == email).first()

    if not employee:
        # Create employee via OAuth
        username = email.split("@")[0]
        base_username = username
        counter = 1
        while db.query(models.Employee).filter(models.Employee.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
            
        employee_in = schemas.EmployeeCreate(
            username=username,
            email=email,
            name=name or ""
        )
        employee = crud.create_oauth_employee(db=db, employee=employee_in)

    access_token = utils.create_access_token(data={"sub": employee.username})
    refresh_token_str = utils.create_refresh_token(data={"sub": employee.username})
    
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = models.EmployeeRefreshToken(
        token=refresh_token_str,
        employee_id=employee.id,
        expires_at=expires_at,
    )
    db.add(db_refresh)
    db.commit()

    _set_refresh_cookie(response, refresh_token_str)

    # Employees don't have a reset_password column yet, so send 0
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "reset_password": 0, 
    }


# ─────────────────────────────────────────────
# POST /employee/auth/login
# ─────────────────────────────────────────────
@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    employee = crud.get_employee_by_username(db, username=form_data.username)
    if not employee or not crud.verify_password(form_data.password, employee.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = utils.create_access_token(data={"sub": employee.username})
    refresh_token_str = utils.create_refresh_token(data={"sub": employee.username})
    
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = models.EmployeeRefreshToken(
        token=refresh_token_str,
        employee_id=employee.id,
        expires_at=expires_at,
    )
    db.add(db_refresh)
    db.commit()

    _set_refresh_cookie(response, refresh_token_str)

    # Employees don't have a reset_password column yet, so send 0
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "reset_password": 0, 
    }


# ─────────────────────────────────────────────
# POST /employee/auth/refresh
# ─────────────────────────────────────────────
@router.post("/refresh", response_model=schemas.RefreshResponse)
def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=EMPLOYEE_REFRESH_COOKIE_NAME),
    db: Session = Depends(database.get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired employee refresh token",
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
        db.query(models.EmployeeRefreshToken)
        .filter(models.EmployeeRefreshToken.token == refresh_token)
        .first()
    )
    if not db_token or db_token.revoked or db_token.expires_at < datetime.utcnow():
        _clear_refresh_cookie(response)
        raise credentials_exception

    # Rotate
    db_token.revoked = True
    new_access_token = utils.create_access_token(data={"sub": username})
    new_refresh_str = utils.create_refresh_token(data={"sub": username})
    new_expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_db_token = models.EmployeeRefreshToken(
        token=new_refresh_str,
        employee_id=db_token.employee_id,
        expires_at=new_expires,
    )
    db.add(new_db_token)
    db.commit()

    _set_refresh_cookie(response, new_refresh_str)
    return {"access_token": new_access_token, "token_type": "bearer"}


# ─────────────────────────────────────────────
# POST /employee/auth/logout
# ─────────────────────────────────────────────
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=EMPLOYEE_REFRESH_COOKIE_NAME),
    db: Session = Depends(database.get_db),
):
    if refresh_token:
        db_token = (
            db.query(models.EmployeeRefreshToken)
            .filter(models.EmployeeRefreshToken.token == refresh_token)
            .first()
        )
        if db_token:
            db_token.revoked = True
            db.commit()

    _clear_refresh_cookie(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
