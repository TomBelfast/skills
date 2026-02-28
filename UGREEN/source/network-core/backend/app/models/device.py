import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_address: Mapped[str | None] = mapped_column(String(45), unique=True, nullable=True)
    mac_address: Mapped[str | None] = mapped_column(String(17))
    hostname: Mapped[str | None] = mapped_column(String(255))
    vendor: Mapped[str | None] = mapped_column(String(255))
    label: Mapped[str | None] = mapped_column(String(255))
    device_type: Mapped[str] = mapped_column(String(50), default="unknown")
    status: Mapped[str] = mapped_column(String(32), nullable=False, server_default="unknown")
    x_pos: Mapped[float | None] = mapped_column(Float, nullable=True)
    y_pos: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
