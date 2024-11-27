import hashlib

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from starlette.responses import FileResponse
import base64
from backend.models.uploaded_file import UploadedFile
from backend.models.user import User
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.core.database import get_db
from backend.core.logging_config import logger
from backend.core.jwt_auth import JWTError, get_current_user
import os
import requests

router = APIRouter()

# --- DTO MODELS ---
class UploadedFileCreate(BaseModel):
    user_id: int
    file_name: str
    file_data: bytes
    uploaded_text: Optional[str] = None

class UploadedFileUpdate(BaseModel):
    analysis_result: Optional[str] = None
    does_match: Optional[bool] = None

class UploadedFileRead(BaseModel):
    id: int
    file_name: str
    uploaded_at: datetime
    analysis_result: Optional[str]
    uploaded_text: Optional[str]
    file_preview: Optional[str]

    class Config:
        from_attributes = True

class UploadFileRequest(BaseModel):
    user_id: int
    file_name: str
    file: str  # Base64-encoded file
    uploaded_text: Optional[str]

class TwitterDataRequest(BaseModel):
    url: str  # Full URL of the Twitter post
    tweet_id: str  # Extracted tweet ID from the URL

@router.post("/twitter_data")
def fetch_twitter_data(request: TwitterDataRequest):
    """
    Fetch image and description from Twitter API.
    """
    BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")  # Your Bearer Token from the environment

    # Validate BEARER_TOKEN is present
    if not BEARER_TOKEN:
        raise HTTPException(
            status_code=500, detail="Twitter API integration is not configured properly."
        )

    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }

    # Extract the Tweet ID from the request
    tweet_id = request.tweet_id

    try:
        # Make request to Twitter API
        twitter_api_url = (
            f"https://api.twitter.com/2/tweets/{tweet_id}"
            f"?expansions=attachments.media_keys&media.fields=url&tweet.fields=text"
        )
        response = requests.get(twitter_api_url, headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch tweet details")

        tweet_data = response.json()

        # Extract the image URL and text
        tweet_text = tweet_data["data"]["text"]
        media = tweet_data.get("includes", {}).get("media", [])
        if not media or media[0]["type"] != "photo":
            raise HTTPException(status_code=404, detail="Image not found in the Twitter post.")

        image_url = media[0]["url"]

        return {
            "image_url": image_url,
            "tweet_text": tweet_text,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



@router.get("/user_files", response_model=list[UploadedFileRead])
def get_user_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching files for user: {current_user.email}")
    user_files = db.query(UploadedFile).filter(UploadedFile.owner_id == current_user.id).all()

    files_with_preview = []
    for file in user_files:
        file_preview = (
            f"data:image/png;base64,{base64.b64encode(file.file_data).decode('utf-8')}"
            if file.file_data else None
        )
        files_with_preview.append(
            UploadedFileRead(
                id=file.id,
                file_name=file.file_name,
                uploaded_at=file.uploaded_at,
                analysis_result=file.analysis_result,
                file_preview=file_preview,
                uploaded_text=file.uploaded_text
            )
        )
    return files_with_preview


@router.get("/user_files/{file_id}", response_model=UploadedFileRead)
def get_file_details(file_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Fetching details for file ID: {file_id}, user: {current_user.email}")

    file_record = db.query(UploadedFile).filter(
        UploadedFile.owner_id == current_user.id,
        UploadedFile.id == file_id,
    ).first()

    if not file_record:
        logger.error(f"File ID {file_id} not found for user {current_user.email}")
        raise HTTPException(status_code=404, detail="File not found or you do not have access to this file.")

    file_preview = base64.b64decode(file_record.file_data).decode('utf-8') if file_record.file_data else None

    return {
        "id": file_record.id,
        "file_name": file_record.file_name,
        "uploaded_at": file_record.uploaded_at,
        "analysis_result": file_record.analysis_result,
        "file_preview": f"data:image/png;base64,{file_preview}",
        "uploaded_text": file_record.uploaded_text
    }

# --- CRUD ENDPOINTS ---

# CREATE: Upload file
@router.post('/files', response_model=UploadedFileRead)
async def upload_image_to_database(request: UploadFileRequest, db: Session = Depends(get_db)):
    try:
        file_data = base64.b64decode(request.file)
    except Exception as e:
        logger.error(f"Failed to decode base64 file: {e}")
        raise HTTPException(status_code=400, detail="Invalid base64 file format")

    file_hash = hashlib.sha256(file_data).hexdigest()
    logger.info(f"File hash calculated: {file_hash}")

    existing_file = db.query(UploadedFile).filter(UploadedFile.file_hash == file_hash).first()
    if existing_file:
        logger.info(f"File with hash {file_hash} already exists in database: {existing_file}")
        return UploadedFileRead(
            id=existing_file.id,
            file_name=existing_file.file_name,
            uploaded_at=existing_file.uploaded_at,
            analysis_result=existing_file.analysis_result,
            file_preview=f"data:image/png;base64,{base64.b64encode(existing_file.file_data).decode('utf-8')}",
            uploaded_text=existing_file.uploaded_text
        )

    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        logger.error(f"User with ID {request.user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")

    uploaded_file = UploadedFile(
        file_name=request.file_name,
        file_data=file_data,
        file_hash=file_hash,
        uploaded_text=request.uploaded_text,
        owner_id=request.user_id,
        uploaded_at=datetime.now(),
    )
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    logger.info(f"File uploaded successfully: {uploaded_file.id}")
    return UploadedFileRead(
        id=uploaded_file.id,
        file_name=uploaded_file.file_name,
        uploaded_at=uploaded_file.uploaded_at,
        analysis_result=uploaded_file.analysis_result,
        file_preview=f"data:image/png;base64,{base64.b64encode(uploaded_file.file_data).decode('utf-8')}",
        uploaded_text=uploaded_file.uploaded_text
    )


# READ: Get file by ID
@router.get('/files/{file_id}', response_model=UploadedFileRead)
def get_file(file_id: int, db: Session = Depends(get_db)):
    logger.info(f'Reading file with given id {file_id}')
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        logger.error(f'File with id {file_id} not found')
        raise HTTPException(status_code=404, detail='File not found.')

    temp_file_path = f'./temp_file.png'
    with open(temp_file_path, "wb") as temp_file:
        temp_file.write(uploaded_file.file_data)

    return FileResponse(temp_file_path, media_type="image/png")


# UPDATE: Actualize analysis result for file
@router.put('/files/{file_id}', response_model=UploadedFileRead)
def update_file(file_id: int, updated_data: UploadedFileUpdate, db: Session = Depends(get_db)):
    logger.info(f'Updating file with given id {file_id}')
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        logger.error(f'File with id {file_id} not found')
        raise HTTPException(status_code=404, detail='File not found.')

    if updated_data.analysis_result is not None:
        uploaded_file.analysis_result = updated_data.analysis_result

    db.commit()
    db.refresh(uploaded_file)
    logger.info(f'File with given id {file_id} updated successfully')
    return uploaded_file


# DELETE: Delete file from database
@router.delete('/files/{file_id}', response_model=dict)
def delete_file(file_id: int, db: Session = Depends(get_db)):
    logger.info(f'Deleting file with given id {file_id}')
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        logger.error(f'File with id {file_id} not found.')
        raise HTTPException(status_code=404, detail='File not found.')

    db.delete(uploaded_file)
    db.commit()
    logger.info(f'File with given id {file_id} deleted successfully')
    return {"detail": "File deleted successfully"}

# READ ALL: Reads all file records
@router.get('/files', response_model=List[UploadedFileRead])
def read_all_files(db: Session = Depends(get_db)):
    logger.info('Reading all files')
    return db.query(UploadedFile).all()

# READ ALL USERS GRAPHS: Reads all User's graphs ordered by newest
@router.get('/graphs/user/{user_id}', response_model=List[UploadedFileRead])
def read_user_files(user_id: int, db: Session = Depends(get_db)):
    logger.info(f"Reading all user's files with id: {user_id}")
    return db.query(UploadedFile).filter(UploadedFile.owner_id == user_id).all()