from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import crud, models, schemas, database, utils, dependencies

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_user), db: Session = Depends(database.get_db)):
    # Self-Healing: Recalculate totalSolved to ensure accuracy
    # This fixes any previous double-counting bugs
    solved_count = db.query(models.Submission.problem_id).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.status == "Accepted"
    ).distinct().count()
    
    stats = dict(current_user.stats) if current_user.stats else {}
    
    # Only update DB if there is a mismatch
    if stats.get("totalSolved") != solved_count:
        stats["totalSolved"] = solved_count
        current_user.stats = stats
        db.commit()
        db.refresh(current_user)
        
    return current_user

