"""Regression tests: health + auth login."""
import pytest


def test_root(api_client, base_url):
    r = api_client.get(f"{base_url}/api/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("message") == "Tohatsu Motors API"


def test_login_success(api_client, base_url):
    r = api_client.post(
        f"{base_url}/api/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data.get("access_token"), str) and len(data["access_token"]) > 20
    assert data.get("token_type") == "bearer"


def test_login_invalid_password(api_client, base_url):
    r = api_client.post(
        f"{base_url}/api/auth/login",
        json={"username": "admin", "password": "wrongpass"},
        timeout=15,
    )
    assert r.status_code == 401
