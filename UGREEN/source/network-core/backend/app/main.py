from fastapi import FastAPI
from app.api.v1.devices import router as devices_router
from app.api.v1.links import router as links_router
from app.api.v1.discovery import router as discovery_router

app = FastAPI(title="Network Core API", version="0.1.0")


@app.get("/health/live")
async def health_live():
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready():
    return {"status": "ok"}


app.include_router(devices_router, prefix="/api/v1")
app.include_router(links_router, prefix="/api/v1")
app.include_router(discovery_router, prefix="/api/v1")
