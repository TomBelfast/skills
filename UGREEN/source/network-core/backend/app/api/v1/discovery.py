from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter(prefix="/discovery", tags=["discovery"])


@router.post("/run")
async def run_discovery(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # Lazy import — nmap_service is created in Task 9.
    # Importing inside the function body prevents ImportError at startup
    # when the module does not yet exist.
    from app.services import nmap_service
    background_tasks.add_task(nmap_service.import_from_files, db)
    return {"status": "discovery started"}
