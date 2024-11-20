from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, LargeBinary, Boolean
from sqlalchemy.orm import relationship
from backend.core.database import Base
from datetime import datetime

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    file_hash = Column(String(255), nullable=False, unique=True)
    analysis_result = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.now)
    does_match = Column(Boolean, nullable=True)
    uploaded_text = Column(String(255), nullable=True)

    # Relation with User table
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="uploads")
