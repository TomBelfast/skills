from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceCreate(BaseModel):
    ip_address: str
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    label: Optional[str] = None
    device_type: str = "unknown"


class DevicePatch(BaseModel):
    label: Optional[str] = None
    hostname: Optional[str] = None
    device_type: Optional[str] = None


class DeviceRead(BaseModel):
    id: str
    ip_address: str
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    label: Optional[str] = None
    device_type: str = "unknown"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
