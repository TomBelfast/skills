"""add_position_to_devices

Revision ID: c8e9f0a1b2c3
Revises: 12a7d8a0def0
Create Date: 2026-02-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8e9f0a1b2c3'
down_revision: Union[str, Sequence[str], None] = '12a7d8a0def0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('devices', sa.Column('x_pos', sa.Float(), nullable=True))
    op.add_column('devices', sa.Column('y_pos', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('devices', 'y_pos')
    op.drop_column('devices', 'x_pos')
