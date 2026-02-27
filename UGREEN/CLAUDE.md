# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Repozytorium zarządzania infrastrukturą UGREEN NAS. Zawiera:
- **ProxmoxMCP-Plus** — Python MCP server do zarządzania Proxmox przez Claude/AI
- Dokumentację TrueNAS (ZFS, L2ARC, ZIL, backup, security)
- Skrypty administracyjne i diagnostyczne sieci

## ProxmoxMCP-Plus — Komendy

Wszystkie komendy uruchamiać z katalogu `ProxmoxMCP-Plus/`:

```bash
# Setup środowiska (jednorazowo)
uv venv
source .venv/bin/activate       # Linux/macOS
.\.venv\Scripts\Activate.ps1    # Windows
uv pip install -e ".[dev]"

# Testy jednostkowe
pytest

# Testy integracyjne (wymagają żywego Proxmox)
cd test_scripts && python test_vm_power.py
cd test_scripts && python test_openapi.py

# Uruchomienie serwera MCP (tryb STDIO dla Claude)
PROXMOX_MCP_CONFIG="proxmox-config/config.json" python -m proxmox_mcp.server

# Uruchomienie jako OpenAPI REST (port 8811)
./start_openapi.sh

# Lintowanie i formatowanie
ruff .
black .
mypy .
```

## Architektura ProxmoxMCP-Plus

```
src/proxmox_mcp/
├── server.py          ← punkt wejścia MCP, rejestracja narzędzi
├── config/            ← ładowanie proxmox-config/config.json
├── core/              ← połączenie z Proxmox API (proxmoxer)
├── tools/
│   ├── vm.py          ← create/delete/start/stop/reset VM
│   ├── container.py   ← LXC lifecycle management
│   └── console/       ← execute_vm_command przez QEMU Guest Agent
├── formatting/        ← rich output, themes
└── utils/             ← auth, logging
```

**Konfiguracja** (`proxmox-config/config.json`):
- Proxmox: `192.168.0.50:8006`, user `root@pam`, token `mcp-token`
- Transport: STDIO (domyślny dla MCP), SSE lub STREAMABLE dla REST
- Logi: `proxmox_mcp.log` w root projektu

**Tryby uruchomienia**:
- `STDIO` — dla Claude Desktop / Cline (domyślny)
- OpenAPI via `mcpo` na porcie `8811` — dla Open WebUI i integracji REST

## PegaProx — Zarządzanie Klastrem Proxmox

**Preferowane narzędzie do operacji na Proxmox** — zarządza wszystkimi 3 nodami naraz.

```bash
# Wzorzec wywołania (używaj tego zamiast bezpośredniego Proxmox API)
PEGAPROX="https://pega.aihub.ovh/api"
TOKEN="pgx_f4c6_eaqF-nUOucC28TVPe_M85OXh8TYtKHZUmZ5KMLwDIDQ"
CLUSTER="ccff7565"   # HomeLab

curl -sk "$PEGAPROX/clusters" -H "Authorization: Bearer $TOKEN"
```

**Kluczowe endpointy:**
| Cel | Endpoint |
|-----|----------|
| Status klastra i nodów | `GET /api/clusters` |
| Status CPU/RAM nodów | `GET /api/clusters/ccff7565/nodes-status` |
| Lista wszystkich VM | `GET /api/clusters/ccff7565/vms` |
| Akcja na VM (start/stop/restart) | `POST /api/clusters/ccff7565/vms/{node}/{qemu\|lxc}/{vmid}/{action}` |
| Snapshot VM | `GET/POST /api/clusters/ccff7565/vms/{node}/{type}/{vmid}/snapshots` |
| Backup VM | `POST /api/clusters/ccff7565/vms/{node}/{type}/{vmid}/backups/create` |
| Migracja VM | `POST /api/clusters/ccff7565/vms/{node}/{type}/{vmid}/migrate` |
| Dyski noda | `GET /api/clusters/ccff7565/nodes/{node}/disks` |
| Storage klastra | `GET /api/clusters/ccff7565/datacenter/storage` |
| Zaplanowane zadania | `GET /api/scheduled-tasks` |
| Alerty | `GET /api/alerts` |
| Raport top VM | `GET /api/clusters/ccff7565/reports/top-vms` |

**Nody klastra HomeLab:**
- `prox10` → 192.168.0.10 (94 GB RAM)
- `prox50` → 192.168.0.50 (28 GB RAM)
- `prox100` → 192.168.0.100 (15 GB RAM)

**Dostęp SSH do serwera PegaProx:** `ssh root@192.168.0.15` (klucz skonfigurowany)

## Infrastruktura

| System | Adres | Uwagi |
|--------|-------|-------|
| PegaProx | pega.aihub.ovh | Multi-cluster Proxmox mgmt, SSH: 192.168.0.15 |
| Proxmox direct | 192.168.0.50:8006 | token: `root@pam!mcp-token` |
| PostgreSQL | 192.168.0.4:5432 | user: root |
| MinIO (S3) | 192.168.0.18:9000 | Object storage |
| Nginx Proxy Manager | ngnix.aihub.ovh | port admin: 81 |
| n8n | n8n.aihub.ovh | Workflow automation |
| Supabase AiHubAuth | sazwtmafiiqjmpwarrrk | Centralna autoryzacja |

## MCP Serwery (projekt)

Skonfigurowane w `.claude/mcp.json` — aktywne lokalnie dla tego projektu:
`sequential-thinking`, `playwright`, `github`, `fetch`, `filesystem` (C/D/E/F), `sqlite`, `postgres`, `memory`, `puppeteer`, `supabase`, `proxmox`, `docker`, `nginx-proxy-manager`

## GCC — Pamięć Sesji

Projekt ma aktywny GCC (Git Context Controller) w `.GCC/`. Przy starcie sesji hook automatycznie ładuje kontekst. Używaj:
- `/gcc commit "opis"` — po zakończeniu istotnej pracy
- `/gcc branch nazwa` — przed ryzykownym eksperymentem
- `/gcc context --full` — po przerwie, żeby odświeżyć kontekst

## Dokumentacja TrueNAS

Pliki `.md` w root to opracowane przewodniki (nie kod):
- `TRUENAS-*.md` — backup, disaster recovery, security hardening
- `ZIL-*.md` — konfiguracja ZFS Intent Log (SSD cache dla zapisu)
- `L2ARC-*.md` — konfiguracja L2ARC (SSD cache dla odczytu)
- `truenas-storage-pula-*.md` — zarządzanie pulami ZFS

## Supabase Auth — Skill

Dla nowych aplikacji Next.js używaj skilu `supabase-auth-installer`. Podaj nazwę aplikacji i URL — skill przeprowadzi pełną instalację autoryzacji zintegrowanej z projektem `AiHubAuth`.
