import pytest


@pytest.mark.asyncio
async def test_list_links_empty(client):
    resp = await client.get("/api/v1/links")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_link(client):
    dev1 = (await client.post("/api/v1/devices", json={"ip_address": "10.1.0.1"})).json()
    dev2 = (await client.post("/api/v1/devices", json={"ip_address": "10.1.0.2"})).json()
    resp = await client.post("/api/v1/links", json={
        "source_id": dev1["id"], "target_id": dev2["id"]
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["source_id"] == dev1["id"]
    assert data["link_type"] == "ethernet"


@pytest.mark.asyncio
async def test_delete_link(client):
    dev1 = (await client.post("/api/v1/devices", json={"ip_address": "10.2.0.1"})).json()
    dev2 = (await client.post("/api/v1/devices", json={"ip_address": "10.2.0.2"})).json()
    link = (await client.post("/api/v1/links", json={
        "source_id": dev1["id"], "target_id": dev2["id"]
    })).json()
    resp = await client.delete(f"/api/v1/links/{link['id']}")
    assert resp.status_code == 204
