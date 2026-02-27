# Projekt: network-core (Sprint 1)

## Cel
Autorski system monitoringu sieci — mapa topologii, CRUD urządzeń/linków, import z Nmap, docker-compose gotowy do deploy.

## Aktualny Status
**Sprint 1 UKOŃCZONY i opublikowany** (push → github.com/TomBelfast/skills, branch: main)

## Stack (zamrożony)
- Frontend: React + Cytoscape (Sprint 2)
- Backend: FastAPI + SQLAlchemy 2 + Alembic
- DB: PostgreSQL 16
- Worker: Python async (Sprint 2)
- Deploy: Docker Compose

## Lokalizacja kodu
`C:/APLIKACJE/UGREEN/source/network-core/`

## Zmiany Sprint 1

- [x] Scaffold katalogów (backend/frontend/worker/deploy/docs/tests)
- [x] pyproject.toml + .env.example + .gitignore
- [x] app/config.py (pydantic-settings) + app/db/session.py (async SQLAlchemy)
- [x] Modele SQLAlchemy: Device (9 kolumn) + Link (5 kolumn + FK)
- [x] Migracje Alembic — `de9e88329489_initial_devices_and_links.py`
- [x] Schematy Pydantic: DeviceCreate/Read/Patch + LinkCreate/Read/Patch
- [x] CRUD services: device_service.py + link_service.py
- [x] API routers: /api/v1/devices, /api/v1/links, /api/v1/discovery/run
- [x] app/main.py z health endpoints (/health/live, /health/ready)
- [x] Parser Nmap XML: parse_host_discovery() + parse_top200() + import_from_files()
- [x] 22 testy (unit + integracyjne) — wszystkie zielone
- [x] Dockerfile + docker-compose.yml (api + postgres)
- [x] docs/QUICKSTART.md

## Testy
```
22 passed, 1 warning
unit/test_config.py      — 2
unit/test_models.py      — 2
unit/test_schemas.py     — 3
unit/test_nmap_parser.py — 5
integration/test_devices — 5
integration/test_links   — 3
integration/test_health  — 2
```

## Komendy

```bash
# Docker (zalecane)
cd source/network-core/deploy && docker compose up --build

# Lokalnie
cd source/network-core/backend
pip install -e ".[dev]"
cp .env.example .env  # ustaw DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload

# Testy
cd source/network-core/backend && python -m pytest ../tests/ -v

# Seed Nmap
curl -X POST http://localhost:8000/api/v1/discovery/run
```

## API (Sprint 1)
| Metoda | URL | Opis |
|--------|-----|------|
| GET | /api/v1/devices | Lista urządzeń |
| POST | /api/v1/devices | Dodaj urządzenie |
| PATCH | /api/v1/devices/{id} | Edytuj urządzenie |
| DELETE | /api/v1/devices/{id} | Usuń urządzenie |
| GET | /api/v1/links | Lista linków |
| POST | /api/v1/links | Dodaj link |
| PATCH | /api/v1/links/{id} | Edytuj link |
| DELETE | /api/v1/links/{id} | Usuń link |
| POST | /api/v1/discovery/run | Import Nmap seed |
| GET | /health/live | Liveness check |
| GET | /health/ready | Readiness check |

## Dane źródłowe Nmap
Parser czyta z `network-diagnostics-output/`:
- `nmap-host-discovery.xml` → IP, MAC, vendor, hostname
- `nmap-top200.xml` → otwarte porty (do wnioskowania device_type)
- 57 hostów w sieci 192.168.0.0/24, vendor: Proxmox/Ugreen/HP/etc.

## Znane ryzyka
- `settings = Settings()` wymaga lokalnego `.env` (gitignored)
- Migracja ręczna (brak lokalnego PG przy generowaniu) — przetestuj przy `docker compose up`
- Warning: `class Config` w Pydantic v2 (nie blokuje działania)

## Następne Kroki (Sprint 2)
- [ ] Frontend React + Cytoscape — mapa topologii urządzeń
- [ ] Worker monitoring — cykliczny ping (co 60s), zapis status/last_seen
- [ ] SNMP polling — podstawowe OID przez pysnmp
- [ ] WebSocket alerty — push gdy device DOWN
- [ ] Auth JWT — role admin/operator/viewer
