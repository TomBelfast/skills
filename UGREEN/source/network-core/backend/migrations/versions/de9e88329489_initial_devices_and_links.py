"""initial devices and links

Revision ID: de9e88329489
Revises:
Create Date: 2026-02-27 13:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de9e88329489'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'devices',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('mac_address', sa.String(length=17), nullable=True),
        sa.Column('hostname', sa.String(length=255), nullable=True),
        sa.Column('vendor', sa.String(length=255), nullable=True),
        sa.Column('label', sa.String(length=255), nullable=True),
        sa.Column('device_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ip_address')
    )
    op.create_table(
        'links',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('source_id', sa.String(), nullable=False),
        sa.Column('target_id', sa.String(), nullable=False),
        sa.Column('link_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['source_id'], ['devices.id'], ),
        sa.ForeignKeyConstraint(['target_id'], ['devices.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('links')
    op.drop_table('devices')
