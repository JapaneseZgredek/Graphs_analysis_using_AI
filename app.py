from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import routers.home
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    print("Start up called")

app.include_router(routers.home.router)