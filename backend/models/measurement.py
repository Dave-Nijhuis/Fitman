from datetime import datetime

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base, TZDateTime


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id:           Mapped[int]          = mapped_column(Integer, primary_key=True)
    recorded_at:  Mapped[datetime]     = mapped_column(TZDateTime, nullable=False)
    weight_kg:    Mapped[float | None] = mapped_column(Float)
    body_fat_pct: Mapped[float | None] = mapped_column(Float)
    height_cm:    Mapped[float | None] = mapped_column(Float)
    bone_mass_kg: Mapped[float | None] = mapped_column(Float)
    notes:        Mapped[str | None]   = mapped_column(String)
