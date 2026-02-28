from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.device import DeviceCreate, DeviceRead, DevicePatch
from app.services import device_service

router = APIRouter(prefix="/devices", tags=["devices"])


import json
import os

@router.get("", response_model=list[DeviceRead])
async def list_devices(db: AsyncSession = Depends(get_db)):
    try:
        return await device_service.list_devices(db)
    except Exception as e:
        # Fallback to local devices.json if DB fails
        json_path = os.path.join(os.getcwd(), "devices.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                return json.load(f)
        return []


@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
async def create_device(data: DeviceCreate, db: AsyncSession = Depends(get_db)):
    return await device_service.create_device(db, data)


@router.get("/{device_id}", response_model=DeviceRead, status_code=status.HTTP_200_OK)
async def get_device(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}", response_model=DeviceRead)
async def patch_device(device_id: str, data: DevicePatch, db: AsyncSession = Depends(get_db)):
    try:
        device = await device_service.update_device(db, device_id, data)
        if device:
            return device
    except Exception as e:
        # Fallback to local devices.json if DB fails
        json_path = os.path.join(os.getcwd(), "devices.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                devices = json.load(f)
            
            for d in devices:
                if d["id"] == device_id:
                    update_data = data.model_dump(exclude_unset=True)
                    d.update(update_data)
                    with open(json_path, "w") as f:
                        json.dump(devices, f, indent=2)
                    return d
        
    raise HTTPException(status_code=404, detail="Device not found")


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: str, db: AsyncSession = Depends(get_db)):
    if not await device_service.delete_device(db, device_id):
        raise HTTPException(status_code=404, detail="Device not found")
