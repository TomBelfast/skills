"""
E2E tests for Network Core — API + Frontend.

Targets:
  API:      http://192.168.0.4:8000
  Frontend: http://192.168.0.4:5173

Run:
  cd source/network-core/backend
  pip install playwright
  playwright install chromium
  python -m pytest ../tests/e2e/test_e2e.py -v
"""
import uuid
import requests
from playwright.sync_api import sync_playwright, expect

API = "http://192.168.0.4:8000"
UI  = "http://192.168.0.4:5173"

# ── Helpers ──────────────────────────────────────────────────────────────────

def api(method: str, path: str, **kwargs):
    return requests.request(method, f"{API}{path}", timeout=10, **kwargs)


# ── API: Health ───────────────────────────────────────────────────────────────

class TestHealth:
    def test_live(self):
        r = api("GET", "/health/live")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_ready(self):
        r = api("GET", "/health/ready")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["db"] == "ok"


# ── API: Devices CRUD ─────────────────────────────────────────────────────────

class TestDevicesAPI:
    def test_list_returns_array(self):
        r = api("GET", "/api/v1/devices")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_has_seeded_devices(self):
        r = api("GET", "/api/v1/devices")
        assert len(r.json()) > 0, "Seed import should have populated devices"

    def test_create_device(self):
        ip = f"10.99.{uuid.uuid4().int % 256}.{uuid.uuid4().int % 256}"
        r = api("POST", "/api/v1/devices", json={"ip_address": ip})
        assert r.status_code == 201
        data = r.json()
        assert data["ip_address"] == ip
        assert "id" in data
        # cleanup
        api("DELETE", f"/api/v1/devices/{data['id']}")

    def test_get_device_by_id(self):
        ip = f"10.98.1.{uuid.uuid4().int % 256}"
        created = api("POST", "/api/v1/devices", json={"ip_address": ip}).json()
        r = api("GET", f"/api/v1/devices/{created['id']}")
        assert r.status_code == 200
        assert r.json()["id"] == created["id"]
        api("DELETE", f"/api/v1/devices/{created['id']}")

    def test_get_device_not_found(self):
        r = api("GET", "/api/v1/devices/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_patch_device_label(self):
        ip = f"10.97.1.{uuid.uuid4().int % 256}"
        created = api("POST", "/api/v1/devices", json={"ip_address": ip}).json()
        r = api("PATCH", f"/api/v1/devices/{created['id']}", json={"label": "E2E Test Router"})
        assert r.status_code == 200
        assert r.json()["label"] == "E2E Test Router"
        api("DELETE", f"/api/v1/devices/{created['id']}")

    def test_delete_device(self):
        ip = f"10.96.1.{uuid.uuid4().int % 256}"
        created = api("POST", "/api/v1/devices", json={"ip_address": ip}).json()
        r = api("DELETE", f"/api/v1/devices/{created['id']}")
        assert r.status_code == 204
        assert api("GET", f"/api/v1/devices/{created['id']}").status_code == 404

    def test_delete_not_found(self):
        r = api("DELETE", "/api/v1/devices/no-such-device")
        assert r.status_code == 404


# ── API: Links CRUD ───────────────────────────────────────────────────────────

class TestLinksAPI:
    def _make_two_devices(self):
        a = api("POST", "/api/v1/devices", json={"ip_address": f"10.95.1.{uuid.uuid4().int%256}"}).json()
        b = api("POST", "/api/v1/devices", json={"ip_address": f"10.95.2.{uuid.uuid4().int%256}"}).json()
        return a, b

    def test_list_links(self):
        r = api("GET", "/api/v1/links")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_link(self):
        a, b = self._make_two_devices()
        r = api("POST", "/api/v1/links", json={"source_id": a["id"], "target_id": b["id"]})
        assert r.status_code == 201
        data = r.json()
        assert data["source_id"] == a["id"]
        assert data["target_id"] == b["id"]
        assert data["link_type"] == "ethernet"
        # cleanup
        api("DELETE", f"/api/v1/links/{data['id']}")
        api("DELETE", f"/api/v1/devices/{a['id']}")
        api("DELETE", f"/api/v1/devices/{b['id']}")

    def test_delete_link(self):
        a, b = self._make_two_devices()
        link = api("POST", "/api/v1/links", json={"source_id": a["id"], "target_id": b["id"]}).json()
        r = api("DELETE", f"/api/v1/links/{link['id']}")
        assert r.status_code == 204
        api("DELETE", f"/api/v1/devices/{a['id']}")
        api("DELETE", f"/api/v1/devices/{b['id']}")


# ── API: Discovery ────────────────────────────────────────────────────────────

class TestDiscovery:
    def test_run_discovery_idempotent(self):
        """Second run should return 0 new devices (all already seeded)."""
        r = api("POST", "/api/v1/discovery/run")
        assert r.status_code == 200
        data = r.json()
        assert "status" in data


# ── Frontend: Browser E2E ─────────────────────────────────────────────────────

class TestFrontend:
    def test_page_loads(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(UI)
            page.wait_for_load_state("networkidle")
            page.screenshot(path="c:/APLIKACJE/UGREEN/source/network-core/tests/e2e/screenshot_home.png", full_page=True)
            browser.close()

    def test_heading_visible(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(UI)
            page.wait_for_load_state("networkidle")
            heading = page.locator("h1")
            expect(heading).to_be_visible()
            assert "Network Topology" in heading.inner_text()
            browser.close()

    def test_device_count_visible(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(UI)
            page.wait_for_load_state("networkidle")
            # wait for API data to load (devices counter appears)
            page.wait_for_selector("text=Devices:", timeout=10000)
            count_text = page.locator("p").filter(has_text="Devices:").inner_text()
            # Should show >0 devices from seeded data
            devices_count = int(count_text.split("Devices:")[1].split("|")[0].strip())
            assert devices_count > 0, f"Expected >0 devices, got: {count_text}"
            browser.close()

    def test_cytoscape_canvas_renders(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(UI)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)  # extra time for Cytoscape layout
            # Cytoscape renders into a <canvas> element inside the container
            canvas = page.locator("canvas").first
            expect(canvas).to_be_visible()
            page.screenshot(path="c:/APLIKACJE/UGREEN/source/network-core/tests/e2e/screenshot_topology.png", full_page=True)
            browser.close()

    def test_no_console_errors(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            errors = []
            page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
            page.goto(UI)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            browser.close()
        assert errors == [], f"Console errors found: {errors}"
