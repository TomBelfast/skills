from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LinkCreate(BaseModel):
    source_id: str
    target_id: str
    link_type: str = "ethernet"


class LinkPatch(BaseModel):
    link_type: Optional[str] = None


class LinkRead(BaseModel):
    id: str
    source_id: str
    target_id: str
    link_type: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
