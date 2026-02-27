# Centrum Zarządzania Infrastrukturą UGREEN

## Cel Projektu
Stworzenie centralnego miejsca do zarządzania całą infrastrukturą: serwerami, kontenerami, siecią, aplikacjami i autoryzacją — z poziomu Claude Code + MCP.

---

## Infrastruktura

### Serwery
| Nazwa | IP | Typ | Status |
|-------|----|-----|--------|
| Proxmox Node 1 | 192.168.0.50 | Proxmox VE (klaster PRODUKCJA) | ✅ aktywny |
| Proxmox Node 2 | TBD | Proxmox VE | ❓ do zmapowania |
| Proxmox Node 3 | TBD | Proxmox VE | ❓ do zmapowania |
| QNAP 1 | TBD | NAS | ❓ do zmapowania |
| QNAP 2 | TBD | NAS | ❓ do zmapowania |
| TrueNAS | TBD | NAS | ❓ do zmapowania |

### Sieć
| Urządzenie | IP | Typ |
|------------|-----|-----|
| MikroTik | TBD | Router (zarządzalny, RouterOS API) |
| Switche | - | Niezarządzalne |
| Nginx Proxy Manager | ngnix.aihub.ovh | Reverse proxy + SSL |

### Bazy Danych
| Baza | Adres | Uwagi |
|------|-------|-------|
| PostgreSQL | 192.168.0.4 | Wiele baz, login: root |
| MinIO (S3) | 192.168.0.18:9000 | Object storage |
| Supabase | cloud | Multi-login aplikacji |

### Zewnętrzne Usługi
| Usługa | URL | Do czego |
|--------|-----|----------|
| n8n | n8n.aihub.ovh | Automatyzacje workflow |
| Baserow | base-premium.aihub.ovh | Baza danych no-code |
| WordPress | blog.aiwbiznesie.tech | Blog |
| Hostinger | - | Hosting |

---

## MCP Serwery (Claude Code)

### Aktywne (globalnie `~/.claude/mcp.json`)
| Serwer | Pakiet | Do czego |
|--------|--------|----------|
| `comfyui` | fastmcp | ComfyUI image generation |
| `ssh-manager` | Python custom | SSH do serwerów |
| `n8n` | node lokalny | n8n workflow management |
| `chrome-devtools` | npx | Browser debugging |
| `baserow` | mcp-remote | Baserow database |
| `context7` | @context7/mcp-server | Dokumentacja bibliotek |
| `logger` | node lokalny | Logi |
| `minio` | aws-s3-mcp | MinIO/S3 storage |
| `wordpress-mcp` | @automattic/mcp-wordpress-remote | WordPress |
| `hostinger-mcp` | hostinger-api-mcp | Hosting Hostinger |

### Nowe (projekt UGREEN `.claude/mcp.json`)
| Serwer | Pakiet | Do czego |
|--------|--------|----------|
| `sequential-thinking` | @modelcontextprotocol/server-sequential-thinking | Złożona analiza |
| `playwright` | @playwright/mcp | Browser automation |
| `github` | @modelcontextprotocol/server-github | GitHub management |
| `fetch` | @modelcontextprotocol/server-fetch | HTTP requests |
| `filesystem` | @modelcontextprotocol/server-filesystem | Dostęp do dysków C/D/E/F |
| `sqlite` | @modelcontextprotocol/server-sqlite | SQLite databases |
| `postgres` | @modelcontextprotocol/server-postgres | PostgreSQL 192.168.0.4 |
| `memory` | @modelcontextprotocol/server-memory | Persistentna pamięć |
| `puppeteer` | @modelcontextprotocol/server-puppeteer | Web scraping |
| `supabase` | @supabase/mcp-server-supabase | Supabase management |
| `proxmox` | @puregrain/proxmox-emcp-node | Proxmox cluster |
| `docker` | @0xshariq/docker-mcp-server | Docker containers |
| `nginx-proxy-manager` | npm-mcp | NPM proxy + SSL |

---

## Aplikacje

### network-core (aktywny projekt)
System monitoringu i topologii sieci — **Sprint 1 ukończony (2026-02-27)**

| Element | Szczegóły |
|---------|-----------|
| Lokalizacja | `source/network-core/` |
| Backend | FastAPI + SQLAlchemy + Alembic + PostgreSQL |
| Deploy | Docker Compose (`source/network-core/deploy/`) |
| Testy | 22/22 passed |
| Dokumentacja | `claudedocs/network-core-sprint1.md` |

**Sprint 1**: backend, CRUD devices/links, parser Nmap, docker-compose ✅
**Sprint 2**: Frontend React+Cytoscape, worker ping, SNMP, WebSocket, auth JWT 📋

### Stack (dashboard)
- **Frontend:** Next.js / React
- **Auth:** Supabase (email + Gmail login)
- **SSO planowane:** Authentik
- **Deploy:** Vercel / własny serwer

### Planowane Funkcje
- [ ] Multi-login przez Supabase (email + Gmail)
- [ ] Centralne SSO przez Authentik
- [ ] Dashboard zarządzania infrastrukturą
- [x] Monitoring sieci — network-core Sprint 1 (backend)
- [ ] Zarządzanie VM/LXC na Proxmox
- [ ] Zarządzanie kontenerami Docker
- [x] Mapowanie sieci — import z Nmap (57 hostów)

---

## Plan Wdrożenia

### Faza 1 — Fundament (aktualny stan)
- [x] MCP serwery skonfigurowane lokalnie
- [x] Proxmox API token wygenerowany (`root@pam!mcp-token`)
- [x] Połączenie z PostgreSQL
- [x] Supabase skonfigurowany
- [ ] Weryfikacja działania MCP serwerów po restarcie

### Faza 2 — Mapowanie Infrastruktury
- [ ] Zmapować wszystkie 3 nody Proxmox (IP, zasoby, VM/LXC)
- [ ] Zmapować QNAP 1 i QNAP 2 (IP, zasoby, shares)
- [ ] Zmapować TrueNAS (IP, pule, datasets)
- [ ] Zmapować MikroTik (interfejsy, reguły, routing)
- [ ] Stworzyć rejestr wszystkich usług i ich adresów

### Faza 3 — Authentik SSO
- [ ] Zainstalować Authentik na Proxmox (LXC lub VM)
- [ ] Skonfigurować integrację z aplikacjami Next.js
- [ ] Podłączyć do Nginx Proxy Manager
- [ ] Skonfigurować Google OAuth provider
- [ ] Migracja z Supabase auth do Authentik (lub integracja)

### Faza 4 — Dashboard Zarządzania
- [ ] Zaprojektować UI dashboard (Next.js)
- [ ] Widok statusu wszystkich serwerów
- [ ] Widok VM/kontenerów na Proxmox
- [ ] Widok storage (QNAP, TrueNAS)
- [ ] Widok sieci (MikroTik, NPM)
- [ ] Widok aplikacji i ich statusów

### Faza 5 — Monitoring i Alerting
- [ ] Integracja z n8n dla alertów
- [ ] Monitoring zasobów (CPU/RAM/disk)
- [ ] Monitoring sieci (dostępność, latency)
- [ ] Powiadomienia (email/webhook)

---

## Dostępy i Kredencjały

> Plik referencyjny — trzymać bezpiecznie

| System | Adres | Login | Uwagi |
|--------|-------|-------|-------|
| Proxmox | 192.168.0.50:8006 | root@pam | API token: root@pam!mcp-token |
| PostgreSQL | 192.168.0.4:5432 | root | Wiele baz |
| MinIO | 192.168.0.18:9000 | l620OO9z06UoMBx3FGr2 | S3 compatible |
| NPM | ngnix.aihub.ovh | tomaszpasiekauk@gmail.com | Port admin: 81 |
| n8n | n8n.aihub.ovh | - | JWT API key |
| SSH serwer 1 | 192.168.0.1 | root | Nginx Proxy Manager host |

---

## Następne Kroki (najbliższe)

1. **Zrestartować Claude Code** i potwierdzić że MCP serwery działają
2. **Zmapować pozostałe nody Proxmox** — podać IP Node 2 i Node 3
3. **Podać IP QNAP i TrueNAS** — dodać do rejestru
4. **Zainstalować Authentik** — wybrać serwer docelowy

---

*Dokument aktualizowany na bieżąco podczas prac.*
