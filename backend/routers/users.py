from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from backend.core.database import get_db
from backend.models.user import User
from passlib.context import CryptContext
from backend.core.logging_config import logger

router = APIRouter()

# Configuration of hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- DTO MODELS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# --- AUXILIARY FUNCTIONS ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# --- CRUD ENDPOINTS ---

# CREATE: Creating User
@router.post('/users', response_model=UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating user: {user}")
    # Checking if email is not used already
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        logger.error(f"User with email {user.email} already exists")
        raise HTTPException(status_code=400, detail='Email already registered.')

    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        created_at=datetime.now()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# READ: Get User by id
@router.get('/users/{user_id}', response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    logger.info(f'Getting User with id: {user_id}')
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f'User with id {user_id} not found.')
        raise HTTPException(status_code=404, detail='User not found.')

    return user

# UPDATE: Update User's data
@router.put('/users/{user_id}', response_model=UserRead)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    logger.info(f'Updating user with given user id: {user_id}')
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f'User with id {user_id} not found.')
        raise HTTPException(status_code=404, detail='User not found.')

    if user_data.email:
        user.email = user_data.email
    if user_data.password:
        user.hashed_password = hash_password(user_data.password)

    db.commit()
    db.refresh(user)
    logger.info(f'User with id {user_id} updated successfully')

    return user


# DELETE: Delete User
@router.delete('/users/{user_id}', response_model=UserRead)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    logger.info(f'Deleting User with given user id: {user_id}')
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f'User with id {user_id} not found.')
        raise HTTPException(status_code=404, detail='User not found.')

    db.delete(user)
    db.commit()
    logger.info(f'User with id {user_id} deleted successfully')
    return user


# READ ALL: Read all users
@router.get('/users', response_model=List[UserRead])
def get_all_users(db: Session = Depends(get_db)):
    logger.info('Getting all users')
    return db.query(User).all()
