"""
Unit tests for Nmap XML parser (Task 9 — TDD).

Test file location: source/network-core/tests/unit/test_nmap_parser.py
pytest runs from:   source/network-core/backend/
parents[3] from this file = UGREEN root (C:/APLIKACJE/UGREEN)
"""
import pytest
from pathlib import Path
from app.services.nmap_service import parse_host_discovery, parse_top200

# Absolute path resolution: test file is at source/network-core/tests/unit/
# parents[0] = unit/, parents[1] = tests/, parents[2] = network-core/, parents[3] = source/, parents[4] = UGREEN/
NMAP_DIR = Path(__file__).parents[4] / "network-diagnostics-output"
DISCOVERY_XML = NMAP_DIR / "nmap-host-discovery.xml"
TOP200_XML = NMAP_DIR / "nmap-top200.xml"


def test_parse_host_discovery_returns_list():
    hosts = parse_host_discovery(DISCOVERY_XML)
    assert isinstance(hosts, list)
    assert len(hosts) > 0


def test_parse_host_discovery_has_required_fields():
    hosts = parse_host_discovery(DISCOVERY_XML)
    first = hosts[0]
    assert "ip_address" in first
    assert "mac_address" in first
    assert "vendor" in first
    assert "hostname" in first


def test_parse_host_discovery_known_ip():
    hosts = parse_host_discovery(DISCOVERY_XML)
    ips = {h["ip_address"] for h in hosts}
    assert "192.168.0.2" in ips


def test_parse_host_discovery_pi_hole_hostname():
    hosts = parse_host_discovery(DISCOVERY_XML)
    pi_hole = next((h for h in hosts if h["ip_address"] == "192.168.0.2"), None)
    assert pi_hole is not None
    assert pi_hole["hostname"] == "pi.hole"


def test_parse_top200_returns_ports():
    hosts = parse_top200(TOP200_XML)
    assert isinstance(hosts, list)
    # Each host must have ip_address and open_ports (list of ints)
    for h in hosts:
        assert "ip_address" in h
        assert "open_ports" in h
        assert isinstance(h["open_ports"], list)
