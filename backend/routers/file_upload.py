from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from backend.models.uploaded_file import UploadedFile
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.core.database import get_db

router = APIRouter()

# DTO classes
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

# CREATE: Upload file
@router.post('/files/upload', response_model=UploadedFileRead)
async def upload_image_to_database(
        user_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)):
    #  File type validation
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Invalid file type. Please upload an image.')

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

    return uploaded_file


# READ: Get file by ID
@router.get('/files/{file_id}', response_model=UploadedFileRead)
def get_file(file_id: int, db: Session = Depends(get_db)):
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        raise HTTPException(status_code=404, detail='File not found.')

    return uploaded_file
