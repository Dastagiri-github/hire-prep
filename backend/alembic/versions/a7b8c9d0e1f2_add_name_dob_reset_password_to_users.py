"""a7b8c9d0e1f2_add_name_dob_reset_password_to_users

Revision ID: a7b8c9d0e1f2
Revises: a1b2c3d4e5f6
Create Date: 2026-02-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("name", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("dob", sa.Date(), nullable=True))
        batch_op.add_column(
            sa.Column("reset_password", sa.Integer(), nullable=False, server_default="1")
        )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("reset_password")
        batch_op.drop_column("dob")
        batch_op.drop_column("name")
