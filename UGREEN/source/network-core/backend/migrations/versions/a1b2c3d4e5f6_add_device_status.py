"""add device status

Revision ID: a1b2c3d4e5f6
Revises: de9e88329489
Create Date: 2026-02-27 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'de9e88329489'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'devices',
        sa.Column('status', sa.String(length=32), nullable=False, server_default='unknown')
    )


def downgrade() -> None:
    op.drop_column('devices', 'status')
