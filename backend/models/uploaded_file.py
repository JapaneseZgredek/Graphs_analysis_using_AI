from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.core.database import Base
from datetime import datetime

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, nullable=False)
    analysis_result = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.now)

    # Relation with User table
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="uploads")
