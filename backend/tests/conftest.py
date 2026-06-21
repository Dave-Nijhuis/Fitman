import os

import pytest
from fastapi.testclient import TestClient

# Must be set before the app is imported so main.py startup checks pass
os.environ.setdefault("SECRET_KEY", "test-secret-key-ci-only")
os.environ.setdefault("ADMIN_USERNAME", "testuser")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("DATA_DIR", "/tmp/fitman_test")

from database import Base, engine  # noqa: E402
from main import app  # noqa: E402

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c
