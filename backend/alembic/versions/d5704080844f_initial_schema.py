"""initial_schema

Revision ID: d5704080844f
Revises: 
Create Date: 2026-02-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d5704080844f"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("username", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("target_companies", sa.JSON(), nullable=True),
        sa.Column("stats", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "problems",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), index=True, nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("companies", sa.JSON(), nullable=True),
        sa.Column("sample_test_cases", sa.JSON(), nullable=True),
        sa.Column("hidden_test_cases", sa.JSON(), nullable=True),
    )

    op.create_table(
        "submissions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("problems.id"), nullable=True),
        sa.Column("code", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("execution_time", sa.Integer(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "sql_chapters",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), index=True, nullable=False),
        sa.Column("content", sa.String(), nullable=True),
        sa.Column("order", sa.Integer(), unique=True, nullable=True),
    )

    op.create_table(
        "sql_problems",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("chapter_id", sa.Integer(), sa.ForeignKey("sql_chapters.id"), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=True),
        sa.Column("setup_sql", sa.String(), nullable=True),
        sa.Column("solution_sql", sa.String(), nullable=True),
    )

    op.create_table(
        "sql_submissions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("sql_problems.id"), nullable=True),
        sa.Column("query", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("sql_submissions")
    op.drop_table("sql_problems")
    op.drop_table("sql_chapters")
    op.drop_table("submissions")
    op.drop_table("problems")
    op.drop_table("users")
