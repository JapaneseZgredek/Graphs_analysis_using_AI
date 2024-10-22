from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory='templates')

router = APIRouter()

@router.get('/')
async def read_home(request: Request):
    return templates.TemplateResponse('home.html', {'request': request})
