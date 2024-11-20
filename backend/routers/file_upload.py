import hashlib

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
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

    class Config:
        from_attributes = True

class UploadFileRequest(BaseModel):
    user_id: int
    file_name: str
    file: str  # Base64-encoded file
    uploaded_text: Optional[str]

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
        return existing_file

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
    return uploaded_file


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
@router.delete('/files/{file_id}', response_model=UploadedFileRead)
def delete_file(file_id: int, db: Session = Depends(get_db)):
    logger.info(f'Deleting file with given id {file_id}')
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        logger.error(f'File with id {file_id} not found.')
        raise HTTPException(status_code=404, detail='File not found.')

    db.delete(uploaded_file)
    db.commit()
    logger.info('File with given id {file_id} deleted successfully')
    return uploaded_file

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