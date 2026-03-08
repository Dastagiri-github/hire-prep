"""Populate default values for existing users

Revision ID: 0527644d9469
Revises: 5cdb292c6cf5
Create Date: 2026-03-08 23:51:13.035254

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0527644d9469'
down_revision: Union[str, Sequence[str], None] = '5cdb292c6cf5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Populate missing defaults to fix Pydantic validation errors
    op.execute("UPDATE users SET target_companies = '[]' WHERE target_companies IS NULL")
    op.execute("UPDATE users SET stats = '{}' WHERE stats IS NULL")
    op.execute("UPDATE users SET reputation = 0 WHERE reputation IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    pass
