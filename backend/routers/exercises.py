from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models.exercise import Exercise

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

SESSIONS = ["Push A", "Pull A", "Legs A"]


class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    muscles: str | None
    session: str
    position: int
    type: str
    equip: str


@router.get("/sessions")
def list_sessions(_: str = Depends(get_current_user)) -> list[str]:
    return SESSIONS


@router.get("")
def list_exercises(
    session: str,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
) -> list[ExerciseOut]:
    if session not in SESSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown session")
    exercises = (
        db.query(Exercise)
        .filter(Exercise.session == session)
        .order_by(Exercise.position)
        .all()
    )
    return exercises
