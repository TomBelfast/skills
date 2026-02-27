import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Link(Base):
    __tablename__ = "links"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id: Mapped[str] = mapped_column(String, ForeignKey("devices.id"), nullable=False)
    target_id: Mapped[str] = mapped_column(String, ForeignKey("devices.id"), nullable=False)
    link_type: Mapped[str] = mapped_column(String(50), default="ethernet")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
