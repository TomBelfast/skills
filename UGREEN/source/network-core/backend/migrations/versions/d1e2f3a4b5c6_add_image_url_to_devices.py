"""add_image_url_to_devices

Revision ID: d1e2f3a4b5c6
Revises: c8e9f0a1b2c3
Create Date: 2026-02-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = 'c8e9f0a1b2c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE devices ADD COLUMN IF NOT EXISTS image_url VARCHAR(512)")


def downgrade() -> None:
    op.drop_column('devices', 'image_url')
