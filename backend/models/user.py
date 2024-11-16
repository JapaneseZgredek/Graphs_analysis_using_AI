from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from backend.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    # Relationship with table UploadedFile
    uploads = relationship('UploadedFile', back_populates='owner')
