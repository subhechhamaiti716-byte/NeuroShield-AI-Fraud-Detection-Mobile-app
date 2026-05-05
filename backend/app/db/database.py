from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database file location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Save DB in the root backend folder
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(BASE_DIR), 'neuroshield.db')}"

# Create engine with thread safety for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
