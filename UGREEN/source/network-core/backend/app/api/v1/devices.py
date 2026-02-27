from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.device import DeviceCreate, DeviceRead, DevicePatch
from app.services import device_service

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("", response_model=list[DeviceRead])
async def list_devices(db: AsyncSession = Depends(get_db)):
    return await device_service.list_devices(db)


@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
async def create_device(data: DeviceCreate, db: AsyncSession = Depends(get_db)):
    return await device_service.create_device(db, data)


@router.patch("/{device_id}", response_model=DeviceRead)
async def patch_device(device_id: str, data: DevicePatch, db: AsyncSession = Depends(get_db)):
    device = await device_service.update_device(db, device_id, data)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: str, db: AsyncSession = Depends(get_db)):
    if not await device_service.delete_device(db, device_id):
        raise HTTPException(status_code=404, detail="Device not found")
