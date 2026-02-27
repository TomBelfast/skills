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

    Returns one of: "server", "nas", "router", "network", "iot", "unknown".
    """
    vendor_lower = (vendor or "").lower()
    if "proxmox" in vendor_lower:
        return "server"
    if "ugreen" in vendor_lower:
        return "nas"
    if "hewlett" in vendor_lower or "hp" in vendor_lower:
        return "server"
    if "routerboard" in vendor_lower or "mikrotik" in vendor_lower:
        return "router"
    if "asus" in vendor_lower or "tp-link" in vendor_lower:
        return "router"
    if "espressif" in vendor_lower or "tuya" in vendor_lower or "broadlink" in vendor_lower:
        return "iot"
    if 80 in ports or 443 in ports or 8080 in ports or 8443 in ports:
        return "network"
    return "unknown"


async def import_from_files(db: AsyncSession) -> int:
    """
    Import hosts from Nmap XML files into the Device table.

    Reads nmap-host-discovery.xml and nmap-top200.xml from NMAP_DIR,
    merges data by IP address, skips existing IPs to avoid duplicates,
    and bulk-creates Device records.

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
    return count
