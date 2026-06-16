from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models.workout import WorkoutSession
from routers.exercises import SESSIONS

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


class StartSessionRequest(BaseModel):
    session: str


class WorkoutSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session: str
    started_at: str
    ended_at: str | None


@router.post("", response_model=WorkoutSessionOut, status_code=status.HTTP_201_CREATED)
def start_session(
    body: StartSessionRequest,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    if body.session not in SESSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown session")
    workout = WorkoutSession(
        session=body.session,
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.patch("/{session_id}/end", response_model=WorkoutSessionOut)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    workout = db.get(WorkoutSession, session_id)
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if workout.ended_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session already ended")
    workout.ended_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    db.refresh(workout)
    return workout
