import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from formulas import ImpedanceInputs, UserProfile, calculate_all
from models.measurement import BodyMeasurement

router = APIRouter(prefix="/api/measurements", tags=["measurements"])


class MeasurementIn(BaseModel):
    recorded_at: datetime | None = None

    # Basic
    weight_kg:   float | None = None
    height_cm:   float | None = None
    notes:       str | None = None

    # Whole-body composition
    body_fat_pct:         float | None = None
    bmi:                  float | None = None
    fat_mass_kg:          float | None = None
    lean_mass_kg:         float | None = None
    skeletal_muscle_kg:   float | None = None
    fat_free_weight_kg:   float | None = None
    body_water_pct:       float | None = None
    protein_kg:           float | None = None
    inorganic_salt_kg:    float | None = None
    bmr_kcal:             float | None = None
    visceral_fat_grade:   float | None = None
    subcutaneous_fat_pct: float | None = None
    body_age:             int | None = None
    whr_estimate:         float | None = None
    smi:                  float | None = None

    # Segmental fat (kg)
    ra_fat_kg:    float | None = None
    la_fat_kg:    float | None = None
    trunk_fat_kg: float | None = None
    rl_fat_kg:    float | None = None
    ll_fat_kg:    float | None = None

    # Segmental muscle (kg)
    ra_muscle_kg:    float | None = None
    la_muscle_kg:    float | None = None
    trunk_muscle_kg: float | None = None
    rl_muscle_kg:    float | None = None
    ll_muscle_kg:    float | None = None

    # Raw impedance 20 kHz (Ω)
    ra_z20:    float | None = None
    la_z20:    float | None = None
    rl_z20:    float | None = None
    ll_z20:    float | None = None
    trunk_z20: float | None = None

    # Raw impedance 100 kHz (Ω)
    ra_z100:    float | None = None
    la_z100:    float | None = None
    rl_z100:    float | None = None
    ll_z100:    float | None = None
    trunk_z100: float | None = None


class MeasurementOut(MeasurementIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recorded_at: datetime


def _apply_formulae(measurement: BodyMeasurement) -> None:
    """If all required inputs are present, calculate and fill derived fields."""
    age = int(os.getenv("SCALE_AGE", "0"))
    sex = int(os.getenv("SCALE_SEX", "1"))
    height = measurement.height_cm or float(os.getenv("SCALE_HEIGHT_CM", "0"))

    required = [age, height, measurement.weight_kg, measurement.body_fat_pct,
                measurement.ra_z20, measurement.la_z20, measurement.rl_z20,
                measurement.ll_z20, measurement.trunk_z20,
                measurement.ra_z100, measurement.la_z100, measurement.rl_z100,
                measurement.ll_z100, measurement.trunk_z100]
    if not all(required):
        return

    profile = UserProfile(age=age, height_cm=height, sex=sex, weight_kg=measurement.weight_kg)
    inputs = ImpedanceInputs(
        ra_z20=measurement.ra_z20, la_z20=measurement.la_z20,
        rl_z20=measurement.rl_z20, ll_z20=measurement.ll_z20,
        trunk_z20=measurement.trunk_z20,
        ra_z100=measurement.ra_z100, la_z100=measurement.la_z100,
        rl_z100=measurement.rl_z100, ll_z100=measurement.ll_z100,
        trunk_z100=measurement.trunk_z100,
        body_fat_pct=measurement.body_fat_pct,
    )
    derived = calculate_all(profile, inputs)
    for field, value in derived.items():
        setattr(measurement, field, value)


@router.post("", response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
def log_measurement(
    body: MeasurementIn,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user),
):
    data = body.model_dump()
    data["recorded_at"] = data["recorded_at"] or datetime.now(timezone.utc)
    measurement = BodyMeasurement(**data)
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    _apply_formulae(measurement)
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
