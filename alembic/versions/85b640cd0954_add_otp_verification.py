"""add otp verification

Revision ID: 85b640cd0954
Revises: ce8e210397f5
Create Date: 2026-07-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85b640cd0954'
down_revision: Union[str, Sequence[str], None] = 'ce8e210397f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('otp_verifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('otp_hash', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=True),
        sa.Column('last_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_otp_verifications_email'), 'otp_verifications', ['email'], unique=False)
    op.create_index(op.f('ix_otp_verifications_id'), 'otp_verifications', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_otp_verifications_id'), table_name='otp_verifications')
    op.drop_index(op.f('ix_otp_verifications_email'), table_name='otp_verifications')
    op.drop_table('otp_verifications')
