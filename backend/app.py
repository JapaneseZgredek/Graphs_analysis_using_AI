from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from core.logging_config import logger
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    logger.info('Start up called')

app.include_router(backend.routers.home.router)
