import pytest


@pytest.mark.asyncio
async def test_list_devices_empty(client):
    resp = await client.get("/api/v1/devices")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_device(client):
    resp = await client.post("/api/v1/devices", json={"ip_address": "10.0.0.1"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["ip_address"] == "10.0.0.1"
    assert "id" in data


@pytest.mark.asyncio
async def test_patch_device(client):
    create = await client.post("/api/v1/devices", json={"ip_address": "10.0.0.2"})
    device_id = create.json()["id"]
    resp = await client.patch(f"/api/v1/devices/{device_id}", json={"label": "My Router"})
    assert resp.status_code == 200
    assert resp.json()["label"] == "My Router"


@pytest.mark.asyncio
async def test_delete_device(client):
    create = await client.post("/api/v1/devices", json={"ip_address": "10.0.0.3"})
    device_id = create.json()["id"]
    resp = await client.delete(f"/api/v1/devices/{device_id}")
    assert resp.status_code == 204
    # sprawdz ze zniknal z listy
    list_resp = await client.get("/api/v1/devices")
    ips = [d["ip_address"] for d in list_resp.json()]
    assert "10.0.0.3" not in ips


@pytest.mark.asyncio
async def test_delete_device_not_found(client):
    resp = await client.delete("/api/v1/devices/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_device_by_id(client):
    create = await client.post("/api/v1/devices", json={"ip_address": "10.9.0.1"})
    device_id = create.json()["id"]
    resp = await client.get(f"/api/v1/devices/{device_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == device_id
    assert data["ip_address"] == "10.9.0.1"


@pytest.mark.asyncio
async def test_get_device_by_id_not_found(client):
    resp = await client.get("/api/v1/devices/nonexistent-id")
    assert resp.status_code == 404
