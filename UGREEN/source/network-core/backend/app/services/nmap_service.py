"""
Nmap XML parser and device import service (Task 9).

Functions:
- parse_host_discovery(xml_path) -> list[dict]   — parses nmap-host-discovery.xml
- parse_top200(xml_path) -> list[dict]            — parses nmap-top200.xml (top 200 ports)
- import_from_files(db) -> int                   — seeds Device table from XML files
- _guess_device_type(vendor, ports) -> str       — heuristic device classification
"""
import os
from pathlib import Path
import xml.etree.ElementTree as ET
from sqlalchemy.ext.asyncio import AsyncSession

# Docker: /nmap-data (volume mount), dev: fallback via parents[5]
_docker_path = Path("/nmap-data")
if _docker_path.exists():
    NMAP_DIR = _docker_path
else:
    try:
        NMAP_DIR = Path(__file__).parents[5] / "network-diagnostics-output"
    except IndexError:
        NMAP_DIR = _docker_path  # fallback — will fail gracefully at import time


def parse_host_discovery(xml_path: Path) -> list[dict]:
    """
    Parse nmap host-discovery XML and return a list of host dicts.

    Each dict contains:
      - ip_address  (str)
      - mac_address (str | None)
      - vendor      (str | None)
      - hostname    (str | None)  — first PTR hostname if present
    """
    tree = ET.parse(xml_path)
    root = tree.getroot()
    hosts = []
    for host in root.findall("host"):
        status = host.find("status")
        if status is None or status.get("state") != "up":
            continue
        entry: dict = {
            "ip_address": None,
            "mac_address": None,
            "vendor": None,
            "hostname": None,
        }
        for addr in host.findall("address"):
            if addr.get("addrtype") == "ipv4":
                entry["ip_address"] = addr.get("addr")
            elif addr.get("addrtype") == "mac":
                entry["mac_address"] = addr.get("addr")
                entry["vendor"] = addr.get("vendor")  # may be None if unknown OUI
        hostnames_el = host.find("hostnames")
        if hostnames_el is not None:
            for hn in hostnames_el.findall("hostname"):
                entry["hostname"] = hn.get("name")
                break  # take only the first hostname
        if entry["ip_address"]:
            hosts.append(entry)
    return hosts


def parse_top200(xml_path: Path) -> list[dict]:
    """
    Parse nmap top-200-ports XML and return a list of host dicts.

    Each dict contains:
      - ip_address  (str)
      - open_ports  (list[int]) — portids with state == "open"

    Note: the top200 file uses both <hosthint> (pre-scan hints, no port data)
    and <host> (actual scan results with <ports>). Only <host> elements are
    processed here; <hosthint> elements are ignored.
    """
    tree = ET.parse(xml_path)
    root = tree.getroot()
    hosts = []
    for host in root.findall("host"):
        ip_entry = next(
            (
                a.get("addr")
                for a in host.findall("address")
                if a.get("addrtype") == "ipv4"
            ),
            None,
        )
        if not ip_entry:
            continue
        open_ports: list[int] = []
        ports_el = host.find("ports")
        if ports_el is not None:
            for port in ports_el.findall("port"):
                state_el = port.find("state")
                if state_el is not None and state_el.get("state") == "open":
                    open_ports.append(int(port.get("portid")))
        hosts.append({"ip_address": ip_entry, "open_ports": open_ports})
    return hosts


def _guess_device_type(vendor: str, ports: list[int]) -> str:
    """
    Heuristic device type classification based on vendor string and open ports.

    Returns one of: "server", "nas", "router", "switch", "media", "console", "printer", "iot", "network", "unknown".
    """
    vendor_lower = (vendor or "").lower()
    ports_set = set(ports)

    # 1. High Priority Keywords
    if "proxmox" in vendor_lower:
        return "server"
    if "ugreen" in vendor_lower:
        return "nas"
    if "qnap" in vendor_lower or "synology" in vendor_lower:
        return "nas"
    if "routerboard" in vendor_lower or "mikrotik" in vendor_lower:
        return "router"
    if "asustek" in vendor_lower or "asus" in vendor_lower:
        return "router"
    if "tp-link" in vendor_lower:
        # TP-Link is often a switch or AP
        if any(p in ports_set for p in [80, 443]):
            return "switch"
        return "router"
    if "hewlett" in vendor_lower or " hp " in vendor_lower:
        if any(p in ports_set for p in [9100, 515, 631]): # JetDirect / LPD / IPP
            return "printer"
        return "server"
    if "sony" in vendor_lower or "nvidia" in vendor_lower or "google" in vendor_lower or "amazon" in vendor_lower:
        return "media"
    if "interactive entertainment" in vendor_lower or "nintendo" in vendor_lower or "microsoft" in vendor_lower:
        if "xbox" in vendor_lower or "playstation" in vendor_lower:
            return "console"
        if "interactive entertainment" in vendor_lower: # Sony PlayStation
            return "console"
    if "espressif" in vendor_lower or "tuya" in vendor_lower or "broadlink" in vendor_lower or "shenzhen" in vendor_lower:
        return "iot"

    # 2. Port-based Fallbacks
    if any(p in ports_set for p in [9100, 631]):
        return "printer"
    if any(p in ports_set for p in [32400, 8096, 5000]): # Plex, Emby, Synology
        return "nas"
    if any(p in ports_set for p in [8006, 22]):
        return "server"
    if any(p in ports_set for p in [80, 443, 8080, 8443]):
        return "network"

    return "unknown"


async def _auto_link_routers(db: AsyncSession) -> int:
    """
    Create ethernet links from every router to every non-router device.

    Skips pairs that already have a link in either direction.
    Returns the count of newly created links.
    """
    from sqlalchemy import select
    from app.models.device import Device
    from app.models.link import Link
    from app.schemas.link import LinkCreate
    from app.services import link_service

    result = await db.execute(select(Device))
    all_devices = list(result.scalars().all())

    routers = [d for d in all_devices if d.device_type == "router"]
    if not routers:
        return 0

    link_result = await db.execute(select(Link.source_id, Link.target_id))
    existing = {(r[0], r[1]) for r in link_result.all()}

    count = 0
    for router in routers:
        for device in all_devices:
            if device.id == router.id:
                continue
            if (router.id, device.id) in existing or (device.id, router.id) in existing:
                continue
            await link_service.create_link(db, LinkCreate(source_id=router.id, target_id=device.id))
            existing.add((router.id, device.id))
            count += 1
    return count


async def import_from_files(db: AsyncSession) -> int:
    """
    Import hosts from Nmap XML files into the Device table.

    Reads nmap-host-discovery.xml and nmap-top200.xml from NMAP_DIR,
    merges data by IP address, skips existing IPs to avoid duplicates,
    bulk-creates Device records, then auto-links routers to all devices.

    Returns the count of newly inserted devices.
    """
    from sqlalchemy import select
    from app.models.device import Device
    from app.schemas.device import DeviceCreate
    from app.services import device_service

    discovery_path = NMAP_DIR / "nmap-host-discovery.xml"
    top200_path = NMAP_DIR / "nmap-top200.xml"

    hosts = parse_host_discovery(discovery_path)
    ports_map: dict[str, list[int]] = {
        h["ip_address"]: h["open_ports"] for h in parse_top200(top200_path)
    }

    result = await db.execute(select(Device.ip_address))
    existing_ips = {row[0] for row in result.all()}

    count = 0
    for host in hosts:
        ip = host["ip_address"]
        if ip in existing_ips:
            continue
        open_ports = ports_map.get(ip, [])
        device_type = _guess_device_type(host.get("vendor") or "", open_ports)
        data = DeviceCreate(
            ip_address=ip,
            mac_address=host.get("mac_address"),
            hostname=host.get("hostname"),
            vendor=host.get("vendor"),
            device_type=device_type,
        )
        await device_service.create_device(db, data)
        count += 1

    await _auto_link_routers(db)
    return count
