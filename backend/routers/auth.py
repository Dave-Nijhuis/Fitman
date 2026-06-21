import os
import secrets

import bcrypt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _verify_password(plain: str, stored: str) -> bool:
    """Verify password against either a bcrypt hash or plaintext (legacy)."""
    if stored.startswith("$2b$") or stored.startswith("$2a$"):
        return bcrypt.checkpw(plain.encode(), stored.encode())
    # Legacy plaintext — timing-safe comparison; startup warning is emitted by main.py
    return secrets.compare_digest(plain, stored)


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
    password_ok = _verify_password(body.password, valid_password)
    if not (username_ok and password_ok):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(body.username))
