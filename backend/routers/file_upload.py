from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from backend.models.uploaded_file import UploadedFile
from backend.models.user import User
from datetime import datetime
from backend.core.database import get_db

router = APIRouter()


@router.post('/upload', response_model=dict)
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

    return {
        "message": "File uploaded successfully",
        "file_id": uploaded_file.id
    }
