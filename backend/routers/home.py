from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from backend.core.logging_config import logger
templates = Jinja2Templates(directory='templates')

router = APIRouter()

@router.get('/')
async def read_home(request: Request):
    logger.info('GET read_home()')
    return templates.TemplateResponse('home.html', {'request': request})
