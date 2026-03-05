import seed_aptitude
import database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

DATABASE_URL = "postgresql://neondb_owner:npg_wZQIkT3E8ixN@ep-twilight-forest-a1w8n351-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print("Connecting to Neon DB...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkeypatch the SessionLocal in database module
database.SessionLocal = SessionLocal

print("Creating models in Neon DB if not exist...")
models.Base.metadata.create_all(bind=engine)

print("Clearing existing aptitude data...")
db = SessionLocal()
try:
    db.query(models.AptitudeProblem).delete()
    db.query(models.AptitudeChapter).delete()
    db.commit()
    print("Old aptitude data successfully cleared.")
except Exception as e:
    print(f"Error clearing aptitude data: {e}")
    db.rollback()
finally:
    db.close()

print("Running Aptitude Data Seeding...")
seed_aptitude.seed_aptitude_data()
print("Finished Aptitude Data Seeding in Neon DB.")
