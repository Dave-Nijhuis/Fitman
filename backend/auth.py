from datetime import datetime, timedelta, timezone
from typing import Annotated
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

ALGORITHM = "HS256"

bearer = HTTPBearer()


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=int(os.getenv("JWT_EXPIRE_DAYS", "7")))
    return jwt.encode({"sub": username, "exp": expire}, os.getenv("SECRET_KEY"), algorithm=ALGORITHM)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
) -> str:
    try:
        payload = jwt.decode(credentials.credentials, os.getenv("SECRET_KEY"), algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return username
