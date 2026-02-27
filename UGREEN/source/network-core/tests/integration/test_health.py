import pytest
from unittest.mock import patch
from sqlalchemy.exc import OperationalError


@pytest.mark.asyncio
async def test_health_live(client):
    resp = await client.get("/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_health_ready_ok(client):
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["db"] == "ok"


@pytest.mark.asyncio
async def test_health_ready_db_error(client):
    with patch("app.main.text", side_effect=OperationalError("conn", {}, Exception("refused"))):
        resp = await client.get("/health/ready")
    assert resp.status_code == 503
    data = resp.json()
    assert data["db"] == "error"
