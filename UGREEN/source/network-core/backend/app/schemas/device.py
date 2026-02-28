from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceCreate(BaseModel):
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    label: Optional[str] = None
    device_type: str = "unknown"
    image_url: Optional[str] = None


class DevicePatch(BaseModel):
    label: Optional[str] = None
    hostname: Optional[str] = None
    device_type: Optional[str] = None
    image_url: Optional[str] = None
    x_pos: Optional[float] = None
    y_pos: Optional[float] = None


class DeviceRead(BaseModel):
    id: str
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    label: Optional[str] = None
    device_type: str = "unknown"
    image_url: Optional[str] = None
    x_pos: Optional[float] = None
    y_pos: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
