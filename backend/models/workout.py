from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id:         Mapped[int]       = mapped_column(Integer, primary_key=True)
    session:    Mapped[str]       = mapped_column(String, nullable=False)
    started_at: Mapped[str]       = mapped_column(String, nullable=False)
    ended_at:   Mapped[str | None] = mapped_column(String)

    logs: Mapped[list["Log"]] = relationship("Log", back_populates="workout_session")


class Log(Base):
    __tablename__ = "logs"

    id:         Mapped[int]       = mapped_column(Integer, primary_key=True)
    exercise_id: Mapped[int]      = mapped_column(Integer, ForeignKey("exercises.id"), nullable=False)
    session_id:  Mapped[int]      = mapped_column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    weight:      Mapped[float]    = mapped_column(Float, nullable=False)
    reps:        Mapped[int]      = mapped_column(Integer, nullable=False)
    logged_at:   Mapped[str]      = mapped_column(String, nullable=False)

    workout_session: Mapped["WorkoutSession"] = relationship("WorkoutSession", back_populates="logs")
