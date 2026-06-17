from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models.exercise import Exercise
from models.workout import Log

router = APIRouter(prefix="/api/progress", tags=["progress"])


def epley_1rm(weight: float, reps: int) -> float:
    if reps == 1:
        return weight
    return weight * (1 + reps / 30)


class StrengthPoint(BaseModel):
    date: str
    estimated_1rm: float


class StrengthData(BaseModel):
    exercise_id: int
    exercise_name: str
    data: list[StrengthPoint]


@router.get("/strength", response_model=StrengthData)
def strength_progression(
    exercise_id: int = Query(...),
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    logs = (
        db.query(Log)
        .filter(Log.exercise_id == exercise_id)
        .order_by(Log.logged_at)
        .all()
    )

    daily_best: dict[str, float] = defaultdict(float)
    for log in logs:
        date = log.logged_at[:10]
        daily_best[date] = max(daily_best[date], epley_1rm(log.weight, log.reps))

    data = [
        StrengthPoint(date=d, estimated_1rm=round(v, 2))
        for d, v in sorted(daily_best.items())
    ]
    return StrengthData(exercise_id=exercise_id, exercise_name=exercise.name, data=data)
