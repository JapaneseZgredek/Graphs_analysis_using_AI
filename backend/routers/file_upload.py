from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
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

class UploadedFileUpdate(BaseModel):
    analysis_result: Optional[str] = None

class UploadedFileRead(BaseModel):
    id: int
    file_name: str
    uploaded_at: datetime
    analysis_result: Optional[str]

    class Config:
        from_attributes = True

# --- CRUD ENDPOINTS ---

# CREATE: Upload file
@router.post('/files', response_model=UploadedFileRead)
async def upload_image_to_database(
        user_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)):

    logger.info('Uploading image to database')
    #  File type validation
    if not file.content_type.startswith('image/'):
        logger.error('File type is not an image')
        raise HTTPException(status_code=400, detail='Invalid file type. Please upload an image.')

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f'Cannot create file record with user id that doesnt exist: {user_id}.')
    # Reading file binary data
    file_data = await file.read()

    uploaded_file = UploadedFile(
        file_name=file.filename,
        file_data=file_data,
        owner_id=user_id,
        uploaded_at=datetime.now()
    )
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)
    logger.info('Uploaded image to database successfully')
    return uploaded_file


# READ: Get file by ID
@router.get('/files/{file_id}', response_model=UploadedFileRead)
def get_file(file_id: int, db: Session = Depends(get_db)):
    logger.info(f'Reading file with given id {file_id}')
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        logger.error(f'File with id {file_id} not found')
        raise HTTPException(status_code=404, detail='File not found.')

    return uploaded_file


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
