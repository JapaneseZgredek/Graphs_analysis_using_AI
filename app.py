from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import routers.home
from core.logging_config import logger
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    logger.info('Start up called')

app.include_router(routers.home.router)
