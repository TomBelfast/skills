import logging
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db

log = logging.getLogger(__name__)
from app.api.v1.devices import router as devices_router
from app.api.v1.links import router as links_router
from app.api.v1.discovery import router as discovery_router

app = FastAPI(title="Network Core API", version="0.1.0")


@app.get("/health/live")
async def health_live():
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        log.warning("DB health check failed: %s", exc)
        db_status = "error"
    if db_status == "error":
        return JSONResponse(status_code=503, content={"status": "ok", "db": "error"})
    return {"status": "ok", "db": db_status}


app.include_router(devices_router, prefix="/api/v1")
app.include_router(links_router, prefix="/api/v1")
app.include_router(discovery_router, prefix="/api/v1")
