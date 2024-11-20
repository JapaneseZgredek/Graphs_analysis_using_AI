from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from typing import Optional
from sqlalchemy.orm import Session
from backend.core.database import get_db
from fastapi.security import OAuth2PasswordBearer
from backend.core.logging_config import logger
from dotenv import load_dotenv
import os
from backend.models import User

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in environment variable")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    logger.info("Creating access token")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    try:
        if "sub" in to_encode and not isinstance(to_encode["sub"], str):
            to_encode["sub"] = str(to_encode["sub"])
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info("Access token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    logger.info("Verifying access token")
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token is missing 'sub' claim")
            raise credentials_exception

        user_id = int(user_id)
    except JWTError as e:
        logger.error(f"JWTError during token verification: {str(e)}")
        raise credentials_exception

    logger.info(f"Token decoded successfully, user_id: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.warning(f"User not found with id: {user_id}")
        raise credentials_exception

    logger.info(f"User authenticated successfully, {user.email}")
    return user
