import seed_sql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

DATABASE_URL = "postgresql://neondb_owner:npg_wZQIkT3E8ixN@ep-twilight-forest-a1w8n351-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print("Connecting to Neon DB...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkeypatch the SessionLocal in seed_sql to use our Neon DB Session
seed_sql.SessionLocal = SessionLocal

print("Creating models in Neon DB if not exist...")
models.Base.metadata.create_all(bind=engine)

print("Running SQL Data Seeding...")
seed_sql.seed_sql_data()
print("Finished SQL Data Seeding in Neon DB.")
