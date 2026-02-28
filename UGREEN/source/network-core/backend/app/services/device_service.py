from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, delete as sql_delete
from app.models.device import Device
from app.models.link import Link
from app.schemas.device import DeviceCreate, DevicePatch
import uuid


async def list_devices(db: AsyncSession) -> list[Device]:
    result = await db.execute(select(Device))
    return list(result.scalars().all())


async def get_device(db: AsyncSession, device_id: str) -> Device | None:
    return await db.get(Device, device_id)


async def create_device(db: AsyncSession, data: DeviceCreate) -> Device:
    device = Device(id=str(uuid.uuid4()), **data.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device


async def update_device(db: AsyncSession, device_id: str, data: DevicePatch) -> Device | None:
    device = await db.get(Device, device_id)
    if not device:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(device, field, value)
    await db.commit()
    await db.refresh(device)
    return device


async def delete_device(db: AsyncSession, device_id: str) -> bool:
    device = await db.get(Device, device_id)
    if not device:
        return False
    await db.execute(
        sql_delete(Link).where(
            or_(Link.source_id == device_id, Link.target_id == device_id)
        )
    )
    await db.delete(device)
    await db.commit()
    return True
