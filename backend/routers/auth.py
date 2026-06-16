import os
import secrets

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    valid_username = os.getenv("ADMIN_USERNAME", "")
    valid_password = os.getenv("ADMIN_PASSWORD", "")
    username_ok = secrets.compare_digest(body.username, valid_username)
    password_ok = secrets.compare_digest(body.password, valid_password)
    if not (username_ok and password_ok):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(body.username))
