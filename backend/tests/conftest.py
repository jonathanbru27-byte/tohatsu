"""Shared pytest fixtures for Tohatsu backend tests."""
import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load frontend .env to read public backend URL exposed to clients
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

# System prompt says EXPO_BACKEND_URL, but frontend exposes EXPO_PUBLIC_BACKEND_URL.
BASE_URL = (
    os.environ.get("EXPO_BACKEND_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
).rstrip("/")

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
