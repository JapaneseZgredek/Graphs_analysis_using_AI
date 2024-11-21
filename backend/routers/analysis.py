from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.uploaded_file import UploadedFile
from backend.core.openai_client import OpenAIClient
import os
from dotenv import load_dotenv
from backend.routers.file_upload import update_file, UploadedFileUpdate

router = APIRouter()

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set. Please configure it in your environment")
client = OpenAIClient(api_key=api_key)


class AnalyzeImageDescriptionRequest(BaseModel):
    description: str
    prompt_text: str = """
        Tell me if provided description match with graph shown in image. If description does not match graph shown in image inform me about it,
        and provide me with description what is really shown in image. Keep in mind that in description might be some giberish words such as
        'BBB' or something like that, ignore them and if after ignoring them description still does not match graph shown in image just say 
        'The description provided does not match and image' and also provide me with proper description. Keep in mind that uploaded image might not be graph image in that case just answer 
        'The provided image does not show any graph data'.
    """


@router.post("/analyze_file/{file_id}")
def analyze_file(file_id: int,
                 prompt_text: str = """
                 Analyze this graph and provide insights as you would be the best Data Analyst in the world!
                 Keep in mind that uploaded image might not be graph image in that case just asnwer 'The provided image does not show any graph data'.""",
                 db: Session = Depends(get_db)):
    try:
        file_record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            return HTTPException(status_code=404, detail=f"File not found with given id {file_id}")

        analysis_result = client.analyze_image_with_base64(
            image_data=file_record.file_data,
            prompt=prompt_text,
            mime_type="image/png"
        )
        updated_data = UploadedFileUpdate()
        updated_data.analysis_result = analysis_result
        update_file(db=db, file_id=file_id, updated_data=updated_data)
        return {"file_name": file_record.file_name, "analysis_result": analysis_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/analyze_image_with_description/{file_id}")
def analyze_image_with_description(file_id: int, request: AnalyzeImageDescriptionRequest,
                                   db: Session = Depends(get_db)):
    try:
        file_record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            return HTTPException(status_code=404, detail=f"File not found with given id {file_id}")

        analysis_result = client.analyze_image_with_description_base64(
            image_data=file_record.file_data,
            description=request.description,
            prompt=request.prompt_text,
            mime_type="image/png"
        )

        does_match = "True" in analysis_result

        file_record.analysis_result = analysis_result
        file_record.does_match = does_match
        db.commit()

        return {"file_name": file_record.file_name, "description": request.description,
                "analysis_result": analysis_result, "does_match": does_match}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
