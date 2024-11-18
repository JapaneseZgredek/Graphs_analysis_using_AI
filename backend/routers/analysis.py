from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.uploaded_file import UploadedFile
from backend.core.openai_client import OpenAIClient
import os
from dotenv import load_dotenv
# Inicjalizacja routera
router = APIRouter()

# Inicjalizacja klienta OpenAI
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAIClient(api_key=api_key)

@router.post("/analyze_file/{file_id}")
def analyze_file(file_id: int, prompt_text: str="Analyze this graph and provide insights as you would be the best Data Analyst in the world!", db: Session = Depends(get_db)):
    try:
        file_record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            return HTTPException(status_code=404, detail=f"File not found with given id {file_id}")

        analysis_result = client.analyze_image_with_base64(
            image_data=file_record.file_data,
            prompt=prompt_text,
            mime_type="image/png"
        )

        return {"file_name": file_record.file_name, "analysis_result": analysis_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
