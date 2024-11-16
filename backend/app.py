from fastapi import FastAPI
from backend.core.logging_config import logger
from backend.core.database import Base, engine
from backend.models import user, uploaded_file
app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup():
    logger.info('Start up called')

# app.include_router(routers.home.router)
