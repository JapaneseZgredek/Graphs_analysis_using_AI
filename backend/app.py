from fastapi import FastAPI
from backend.core.logging_config import logger
from backend.core.database import Base, engine
from backend.models import user, uploaded_file
from backend.routers import file_upload, users, analysis
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(file_upload.router, prefix='/api', tags=['File Management'])
app.include_router(users.router, prefix='/api', tags=['User Management'])
app.include_router(analysis.router, prefix='/api', tags=['Analysis Management'])

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup():
    logger.info('Start up called')

# app.include_router(routers.home.router)
