from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models.measurement import BodyMeasurement

router = APIRouter(prefix="/api/measurements", tags=["measurements"])


class MeasurementIn(BaseModel):
    recorded_at: str | None = None
    weight_kg: float | None = None
    body_fat_pct: float | None = None
    height_cm: float | None = None
    bone_mass_kg: float | None = None
    notes: str | None = None


class MeasurementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recorded_at: str
    weight_kg: float | None
    body_fat_pct: float | None
    height_cm: float | None
    bone_mass_kg: float | None
    notes: str | None


@router.post("", response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
def log_measurement(
    body: MeasurementIn,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    recorded_at = body.recorded_at or datetime.now(timezone.utc).isoformat()
    measurement = BodyMeasurement(
        recorded_at=recorded_at,
        weight_kg=body.weight_kg,
        body_fat_pct=body.body_fat_pct,
        height_cm=body.height_cm,
        bone_mass_kg=body.bone_mass_kg,
        notes=body.notes,
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


@router.get("", response_model=list[MeasurementOut])
def list_measurements(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    return (
        db.query(BodyMeasurement)
        .order_by(BodyMeasurement.recorded_at.desc())
        .all()
    )


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    measurement = db.get(BodyMeasurement, measurement_id)
    if not measurement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")
    db.delete(measurement)
    db.commit()
