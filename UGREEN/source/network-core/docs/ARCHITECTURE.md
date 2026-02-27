# Network Core — Architektura systemu

---

## Spis tresci

- [Przeglad architektury](#przeglad-architektury)
- [Diagram komponentow](#diagram-komponentow)
- [Backend — FastAPI](#backend--fastapi)
- [Baza danych — PostgreSQL](#baza-danych--postgresql)
- [Frontend — React i Cytoscape.js](#frontend--react-i-cytoscapejs)
- [Worker — Ping Monitor](#worker--ping-monitor)
- [Przeplyw danych](#przeplyw-danych)
- [Schematy bazy danych](#schematy-bazy-danych)
- [Klasyfikacja typow urzadzen](#klasyfikacja-typow-urzadzen)
- [Migracje bazy danych](#migracje-bazy-danych)
- [Zaleznoci i wersje](#zaleznosci-i-wersje)

---

## Przeglad architektury

Network Core to system o architekturze wielowarstwowej (tiered architecture) zbudowany z czterech niezaleznych procesow komunikujacych sie przez siec Docker:

```
+--------------------------------------------------+
|                  Docker Network                  |
|                                                  |
|  +----------+    +----------+    +----------+    |
|  |          |    |          |    |          |    |
|  | Frontend |    |   API    |    |  Worker  |    |
|  | :5173    +--->| :8000    |    | (no port)|    |
|  | React    |    | FastAPI  |    |  ping    |    |
|  | Vite     |    | asyncpg  |    |  asyncio |    |
|  |          |    |          |    |          |    |
|  +----------+    +----+-----+    +----+-----+    |
|                       |               |           |
|                  +----v---------------v-----+     |
|                  |                          |     |
|                  |   PostgreSQL 16          |     |
|                  |   :5432                  |     |
|                  |   netcore DB             |     |
|                  |                          |     |
|                  +--------------------------+     |
|                                                  |
|  +-----------------------------------+           |
|  | /nmap-data (read-only volume)     |           |
|  | nmap-host-discovery.xml           |           |
|  | nmap-top200.xml                   |           |
|  +-----------------------------------+           |
+--------------------------------------------------+
```

**Zasada separacji odpowiedzialnosci:**
- API odpowiada wylacznie za logike biznesowa i CRUD
- Frontend odpowiada wylacznie za wizualizacje — nie zawiera logiki biznesowej
- Worker odpowiada wylacznie za monitoring — pisze bezposrednio do bazy omijajac API
- Baza danych jest jedynym miejscem prawdy (source of truth)

---

## Diagram komponentow

```
source/network-core/
│
├── backend/app/
│   ├── main.py                  [Punkt wejscia aplikacji]
│   │     CORS middleware
│   │     health/live, health/ready
│   │     montowanie routerow v1
│   │
│   ├── config.py                [Konfiguracja przez pydantic-settings]
│   │     DATABASE_URL (wymagany)
│   │     DEBUG (opcjonalny, domyslnie false)
│   │
│   ├── db/session.py            [Fabryka sesji async SQLAlchemy]
│   │     create_async_engine
│   │     async_sessionmaker
│   │     get_db() — generator dla Depends()
│   │
│   ├── models/                  [Modele ORM SQLAlchemy 2.0]
│   │   ├── base.py              DeclarativeBase
│   │   ├── device.py            Tabela devices (8 pol)
│   │   └── link.py              Tabela links (5 pol)
│   │
│   ├── schemas/                 [Schematy Pydantic v2]
│   │   ├── device.py            DeviceCreate, DeviceRead, DevicePatch
│   │   └── link.py              LinkCreate, LinkRead, LinkPatch
│   │
│   ├── services/                [Warstwa logiki biznesowej]
│   │   ├── device_service.py    list, get, create, update, delete
│   │   ├── link_service.py      list, get, create, update, delete
│   │   └── nmap_service.py      parse_host_discovery, parse_top200,
│   │                            _guess_device_type, _auto_link_routers,
│   │                            import_from_files
│   │
│   └── api/v1/                  [Warstawa HTTP — routery FastAPI]
│       ├── devices.py           GET/POST /devices, GET/PATCH/DELETE /devices/{id}
│       ├── links.py             GET/POST /links, PATCH/DELETE /links/{id}
│       └── discovery.py        POST /discovery/run
│
├── frontend/src/
│   ├── App.jsx                  [Glowny komponent React]
│   │     fetchDevices() + fetchLinks() przy starcie
│   │     Legenda typow urzadzen z licznikami
│   │     Przyciski: Dodaj Switch, Polacz, Odswiez
│   │     Przekazuje devices + links do TopologyMap
│   │
│   ├── api/devices.js           [Warstwa komunikacji z API]
│   │     fetchDevices() — GET /api/v1/devices
│   │     fetchLinks()   — GET /api/v1/links
│   │     createDevice() — POST /api/v1/devices
│   │     createLink()   — POST /api/v1/links
│   │
│   └── components/
│       └── TopologyMap.jsx      [Platno Cytoscape.js]
│             Wezly grup (compound nodes)
│             Wezly urzadzen z ikonami SVG
│             Krawedzie polaczen
│             Uklad COSE (force-directed)
│             Tooltip na mouseover
│             Czerwona ramka dla status=down
│
├── worker/
│   └── ping_worker.py           [Asynchroniczny monitor ICMP]
│         ping_host(ip) — subprocess ping -c 1 -W 2
│         classify_result() — alive / unreachable
│         run_round() — pinguj wszystkie, zapisz status
│         main() — petla co INTERVAL sekund
│
└── deploy/docker-compose.yml    [Orchestracja Docker]
      postgres  — baza danych z healthcheck
      api       — backend z volume /nmap-data
      frontend  — Node 20 z Vite dev server
      worker    — Python ping monitor
```

---

## Backend — FastAPI

### Punkt wejscia (`main.py`)

Aplikacja FastAPI z middleware CORS i czterema zestawami tras:

```
FastAPI app
 ├── CORSMiddleware (allow_origins=["*"])
 ├── GET  /health/live          → {"status": "ok"}
 ├── GET  /health/ready         → {"status": "ok", "db": "ok"|"error"}
 ├── /api/v1/devices            → devices router
 ├── /api/v1/links              → links router
 └── /api/v1/discovery          → discovery router
```

### Warstwa sesji bazy danych

Silnik asynchroniczny SQLAlchemy z asyncpg:

```
DATABASE_URL (env var)
        |
create_async_engine()
        |
async_sessionmaker()
        |
get_db() generator
        |
FastAPI Depends() injection
        |
endpoint handler(db: AsyncSession)
```

Kazdy request dostaje nowa sesje. Sesja jest zamykana automatycznie po zakonczeniu requestu przez context manager.

### Warstwa serwisow

Serwisy sa czystymi funkcjami async przyjmujacymi `AsyncSession`. Nie maja zadnych zaleznosci do FastAPI — mozna je testowac bezposrednio z kazdym dostawca sesji (SQLite in-memory w testach).

**device_service.py:**

| Funkcja | Opis |
|---------|------|
| `list_devices(db)` | SELECT * FROM devices |
| `get_device(db, id)` | SELECT WHERE id = ? |
| `create_device(db, data)` | INSERT + commit + refresh |
| `update_device(db, id, data)` | UPDATE (tylko pola z exclude_unset) |
| `delete_device(db, id)` | DELETE + commit |

**link_service.py:**

| Funkcja | Opis |
|---------|------|
| `list_links(db)` | SELECT * FROM links |
| `get_link(db, id)` | SELECT WHERE id = ? |
| `create_link(db, data)` | INSERT + commit + refresh |
| `update_link(db, id, data)` | UPDATE link_type |
| `delete_link(db, id)` | DELETE + commit |

### Parser Nmap (`nmap_service.py`)

Parser uzywajacy standardowej biblioteki `xml.etree.ElementTree`:

```
import_from_files(db)
        |
        +-- parse_host_discovery(xml_path)
        |         Czyta <host state="up">
        |         Wyciaga: ip_address, mac_address, vendor, hostname
        |
        +-- parse_top200(xml_path)
        |         Czyta <port state="open">
        |         Zwraca: {ip: [port1, port2, ...]}
        |
        +-- Scala dane po IP
        |
        +-- Filtruje istniejace IP (SELECT Device.ip_address)
        |
        +-- _guess_device_type(vendor, ports)
        |         Heurystyka na podstawie vendora i portow
        |
        +-- device_service.create_device() dla nowych
        |
        +-- _auto_link_routers(db)
                  Wszystkie routery x wszystkie nie-routery
                  Pomija juz istniejace pary (bidirectional check)
```

**Sciezki do plikow Nmap:**

```python
# Priorytet 1: Docker volume (produkcja)
_docker_path = Path("/nmap-data")

# Priorytet 2: Sciezka developerska (wzgledna od pliku serwisu)
_dev_path = Path(__file__).parents[5] / "network-diagnostics-output"

NMAP_DIR = _docker_path if _docker_path.exists() else _dev_path
```

---

## Baza danych — PostgreSQL

### Schemat tabel

#### Tabela `devices`

```sql
CREATE TABLE devices (
    id          VARCHAR     PRIMARY KEY,        -- UUID v4 jako string
    ip_address  VARCHAR(45) UNIQUE NULL,        -- IPv4 (45 znakow = IPv6 ready)
    mac_address VARCHAR(17) NULL,               -- Format: XX:XX:XX:XX:XX:XX
    hostname    VARCHAR(255) NULL,              -- Nazwa PTR z DNS
    vendor      VARCHAR(255) NULL,              -- Nazwa producenta z OUI
    label       VARCHAR(255) NULL,              -- Niestandardowa etykieta uzytkownika
    device_type VARCHAR(50)  NOT NULL DEFAULT 'unknown',
    status      VARCHAR(32)  NOT NULL DEFAULT 'unknown',
    created_at  DATETIME    NOT NULL DEFAULT now(),
    updated_at  DATETIME    NOT NULL DEFAULT now()
);
```

#### Tabela `links`

```sql
CREATE TABLE links (
    id          VARCHAR    PRIMARY KEY,         -- UUID v4 jako string
    source_id   VARCHAR    NOT NULL REFERENCES devices(id),
    target_id   VARCHAR    NOT NULL REFERENCES devices(id),
    link_type   VARCHAR(50) NOT NULL DEFAULT 'ethernet',
    created_at  DATETIME   NOT NULL DEFAULT now()
);
```

### Relacje

```
devices (1) ----< links.source_id
devices (1) ----< links.target_id
```

Jeden device moze byc zrodlem lub celem wielu polaczen. Polaczenia nie sa automatycznie usuwane gdy usuwa sie urzadzenie — nalezy najpierw usunac polaczenia.

### Wartosci enum — `device_type`

| Wartosc | Opis | Kolor w UI |
|---------|------|-----------|
| `server` | Serwer (Proxmox, HP) | Zielony `#27ae60` |
| `router` | Router (MikroTik, ASUS, TP-Link) | Pomaranczowy `#e67e22` |
| `nas` | NAS (Ugreen) | Fioletowy `#8e44ad` |
| `iot` | IoT (Espressif, Tuya, Broadlink) | Turkusowy `#1abc9c` |
| `network` | Urzadzenie sieciowe (porty 80/443) | Niebieski `#2980b9` |
| `switch` | Przelacznik (dodawany recznie) | Ciemnoszary `#34495e` |
| `unknown` | Nieznane | Szary `#546e7a` |

### Wartosci enum — `status`

| Wartosc | Opis | Wizualizacja |
|---------|------|-------------|
| `alive` | Odpowiada na ping ICMP | Normalna ramka |
| `unreachable` | Nie odpowiada na ping | Czerwona ramka (`#e74c3c`) |
| `unknown` | Nie sprawdzany jeszcze | Normalna ramka |

---

## Frontend — React i Cytoscape.js

### Architektura komponentow

```
App.jsx (stan glowny)
  |
  +-- Stan: devices[], links[], loading, error
  |
  +-- useEffect → fetchDevices() + fetchLinks() przy montowaniu
  |
  +-- handleAddSwitch() → createDevice({device_type: 'switch'})
  +-- handleAddLink()   → createLink({source_id, target_id})
  +-- refreshData()     → ponowne pobranie danych
  |
  +-- [render] Header z przyciskami
  +-- [render] Legenda z licznikami per typ
  +-- [render] TopologyMap (devices, links)

TopologyMap.jsx (platno Cytoscape)
  |
  +-- containerRef → div montowany przez Cytoscape
  +-- cyRef → instancja Cytoscape
  |
  +-- useEffect (dependencies: [devices, links])
        |
        +-- Tworzy groupNodes (compound parent nodes)
        +-- Tworzy nodes (device nodes z parent: grp-{type})
        +-- Tworzy edges (link edges)
        +-- Inicjalizuje cytoscape({container, elements, style, layout})
        +-- Rejestruje handlers: mouseover (tooltip), mouseout
        +-- Cleanup: cy.destroy() przy unmount
```

### System etykiet (`smartLabel`)

Hierarchia priorytetow dla etykiety wezla:

```
1. device.label           (niestandardowa etykieta uzytkownika)
   |
2. KNOWN_IPS[ip_address]  (mapowanie znanych IP na nazwy)
   |
3. device.hostname (bez domeny)
   |
4. VENDOR_PREFIX + ostatni oktet IP  (np. "Prox-50", "ESP-123")
   |
5. "." + ostatni oktet IP  (fallback: ".200")
```

**Znane mapowania IP:**

| Adres IP | Etykieta |
|----------|---------|
| 192.168.0.1 | Prox-GW |
| 192.168.0.2 | Pi.hole |
| 192.168.0.3 | NAS-UGREEN1 |
| 192.168.0.4 | NAS-UGREEN2 |
| 192.168.0.10 | prox10 |
| 192.168.0.15 | PegaProx |
| 192.168.0.18 | MinIO-S3 |
| 192.168.0.50 | prox50 |
| 192.168.0.71 | MikroTik |
| 192.168.0.100 | prox100 |
| 192.168.0.129 | TP-Link-1 |
| 192.168.0.22 | TP-Link-2 |
| 192.168.0.30 | TP-Link-3 |
| 192.168.0.253 | TP-Link-4 |
| 192.168.0.254 | ASUS-Router |

### Uklad grafu (COSE)

Cytoscape.js uzywa algorytmu COSE (Compound Spring Embedder) — opartego na fizycznej symulacji sil:

```javascript
layout: {
  name: 'cose',
  animate: false,          // Bez animacji poczatkowej (szybsze dla 59+ wezlow)
  nodeRepulsion: 8000,     // Sila odpychania miedzy wezlami
  idealEdgeLength: 100,    // Pozadana dlugosc krawedzi
  edgeElasticity: 250,     // Sprezystosc krawedzi
  gravity: 0.3,            // Sila grawitacji do centrum
  numIter: 500,            // Liczba iteracji symulacji
  initialTemp: 200,        // Temperatura poczatkowa
  coolingFactor: 0.95,     // Wspolczynnik chlodzenia
  minTemp: 1,              // Temperatura minimalna
}
```

### Grupy urzadzen (Compound Nodes)

Kazdy typ urzadzenia ma swoj wezel-grupe, ktory agreguje wezly-dzieci:

```
grp-server  → "SERWERY"
grp-router  → "ROUTERY"
grp-nas     → "NAS"
grp-iot     → "IoT"
grp-network → "SIEC / MEDIA"
grp-switch  → "PRZELACZNIKI"
grp-unknown → "INNE"
```

Wezly-dzieci automatycznie naleza do grupy przez `parent: grp-{device_type}`.

### Style Cytoscape

```
Wezly grup:
  - Przezroczyste tlo (opacity 0.06)
  - Przerywana ramka
  - Etykieta na gorze (font-weight: 700)

Wezly urzadzen:
  - Kolor tla = TYPE_COLORS[device_type]
  - Ikona SVG jako background-image
  - Rozmiar = TYPE_SIZES[device_type] (36-62px)
  - Etykieta pod wezlem (font-size: 10px)
  - Zaznaczony: zolta ramka (#f1c40f)
  - Status=down: czerwona ramka (#e74c3c) + przyciemnienie

Krawedzie:
  - Kolor: #546e7a, opacity 0.35
  - Szerokosc: 1.2px
  - Styl: bezier
  - Strzalka: triangle na docelowym wezle
  - Zaznaczona: zolta, szerokosc 2.5px
```

---

## Worker — Ping Monitor

Worker dziala jako niezalezny proces Pythona w petli nieskoncznonej.

### Przeplyw jednej rundy

```
run_round(session)
        |
        +-- SELECT id, ip_address FROM devices
        |         (wszystkie urzadzenia z IP)
        |
        +-- asyncio.gather(*[ping_host(ip) for _, ip in tasks])
        |         Rownolegle pingowanie wszystkich urzadzen
        |
        +-- For each (device_id, ip), alive in zip(tasks, results):
        |     status = "alive" if alive else "unreachable"
        |     UPDATE devices SET status = :status WHERE id = :id
        |
        +-- session.commit()
```

### Funkcja ping_host

```python
async def ping_host(ip: str) -> bool:
    proc = await asyncio.create_subprocess_exec(
        "ping", "-c", "1", "-W", "2", ip,  # 1 pakiet, timeout 2s
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.DEVNULL,
    )
    rc = await proc.wait()
    return rc == 0  # exit code 0 = host odpowiada
```

Worker pisze bezposrednio do bazy przez SQL — nie korzysta z API. Pozwala to uniknac niepotrzebnej warstwy HTTP i serializacji JSON przy masowej aktualizacji.

### Polaczenie z baza

Worker tworzy wlasny silnik SQLAlchemy niezaleznie od backendu:

```python
engine = create_async_engine(DATABASE_URL, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False)

while True:
    async with session_factory() as session:
        await run_round(session)
    await asyncio.sleep(INTERVAL)
```

---

## Przeplyw danych

### Przeplyw importu Nmap

```
Pliki XML na dysku
       |
       | (Docker volume /nmap-data)
       v
POST /api/v1/discovery/run
       |
       | (BackgroundTasks)
       v
nmap_service.import_from_files(db)
       |
       +-- parse_host_discovery("nmap-host-discovery.xml")
       |     [{ip, mac, vendor, hostname}, ...]
       |
       +-- parse_top200("nmap-top200.xml")
       |     {ip: [port, port, ...], ...}
       |
       +-- Scalenie danych po IP
       |
       +-- Filtrowanie IP juz w bazie
       |
       +-- _guess_device_type(vendor, ports) → "server"|"router"|...
       |
       +-- device_service.create_device() per nowy host
       |
       +-- _auto_link_routers()
             Find: wszystkie routery
             Find: wszystkie nie-routery
             For: router x kazdy nie-router
               Skip: juz istniejaca para (bidirectional)
               Create: Link(router.id, device.id, "ethernet")
```

### Przeplyw monitoringu statusu

```
Worker startup (INTERVAL=30s w produkcji)
       |
       v
asyncio event loop
       |
       +-- run_round() co 30 sekund
       |     |
       |     +-- SELECT devices
       |     +-- asyncio.gather (rownolegle ping)
       |     +-- UPDATE status per device
       |     +-- commit()
       |
Frontend (useEffect przy montowaniu lub recznym odswieza)
       |
       +-- fetchDevices() → GET /api/v1/devices
       |     Zwraca devices ze statusem: alive/unreachable/unknown
       |
       +-- TopologyMap renderuje wezly
             node[status="down"] → czerwona ramka
```

### Przeplyw requestu HTTP

```
HTTP Request
     |
     v
FastAPI router (devices.py)
     |
     v
get_db() → AsyncSession (Depends injection)
     |
     v
device_service.*(db, data)
     |
     v
SQLAlchemy ORM → asyncpg → PostgreSQL
     |
     v
Pydantic DeviceRead (from_attributes=True)
     |
     v
JSON Response
```

---

## Klasyfikacja typow urzadzen

Funkcja `_guess_device_type(vendor, ports)` stosuje heurystyke opartym na vendorze OUI i otwartych portach:

```
vendor_lower = vendor.lower()

1. "proxmox"   in vendor → "server"
2. "ugreen"    in vendor → "nas"
3. "hewlett"   in vendor → "server"
4. "hp"        in vendor → "server"
5. "routerboard" in vendor → "router"
6. "mikrotik"  in vendor → "router"
7. "asus"      in vendor → "router"
8. "tp-link"   in vendor → "router"
9. "espressif" in vendor → "iot"
10. "tuya"     in vendor → "iot"
11. "broadlink" in vendor → "iot"
12. 80 in ports OR 443 in ports
    OR 8080 in ports OR 8443 in ports → "network"
13. (fallback) → "unknown"
```

Reguly sa sprawdzane od gory do dolu — pierwsza pasujaca wygrywa.

---

## Migracje bazy danych

Migracje zarzadzane przez Alembic. Plik konfiguracyjny: `backend/alembic.ini`.

### Historia migracji

| Rewizja | Opis | Data |
|---------|------|------|
| `de9e88329489` | Poczatkowe tabele devices i links | 2026-02-27 |
| `a1b2c3d4e5f6` | Dodano kolumne status do devices | 2026-02-27 |
| `12a7d8a0def0` | ip_address nullable, wsparcie dla switch | 2026-02-27 |

### Uruchamianie migracji

```bash
cd backend

# Sprawdz aktualny stan
alembic current

# Zastosuj wszystkie migracje
alembic upgrade head

# Cofnij ostatnia migracje
alembic downgrade -1

# Wygeneruj nowa migracje (po zmianach modeli)
alembic revision --autogenerate -m "opis_zmiany"
```

### Migracje przy uruchomieniu Docker

W aktualnej konfiguracji Docker Compose migracje nie sa uruchamiane automatycznie przy starcie kontenera API. Nalezy uruchomic je recznie przy pierwszym deploymencie:

```bash
docker compose exec api alembic upgrade head
```

---

## Zaleznosci i wersje

### Backend

| Pakiet | Wersja | Rola |
|--------|--------|------|
| `fastapi` | 0.115+ | Framework HTTP |
| `uvicorn[standard]` | 0.30+ | ASGI server |
| `sqlalchemy` | 2.0+ | ORM (async) |
| `alembic` | 1.13+ | Migracje bazy danych |
| `asyncpg` | 0.30+ | Sterownik PostgreSQL async |
| `pydantic-settings` | 2.0+ | Konfiguracja z env vars |
| `httpx` | 0.27+ | Klient HTTP (testy) |

**Dev-only:**

| Pakiet | Wersja | Rola |
|--------|--------|------|
| `pytest` | 8+ | Runner testow |
| `pytest-asyncio` | 0.24+ | Wsparcie async w testach |
| `pytest-cov` | 5+ | Raport pokrycia kodu |
| `aiosqlite` | 0.20+ | SQLite async (testy integracyjne) |

### Frontend

| Pakiet | Wersja | Rola |
|--------|--------|------|
| `react` | 18+ | Framework UI |
| `vite` | 6+ | Bundler / dev server |
| `cytoscape` | 3.30+ | Wizualizacja grafu |
| `axios` | najnowszy | Klient HTTP |

### Infrastruktura

| Komponent | Wersja | Rola |
|-----------|--------|------|
| Python | 3.11+ | Srodowisko backendu i workera |
| PostgreSQL | 16 | Baza danych |
| Node.js | 20 | Srodowisko frontendu |
| Docker Engine | 24+ | Konteneryzacja |
| Docker Compose | v2 | Orchestracja |

### Konfiguracja Docker Compose

```
services:
  postgres    image: postgres:16-alpine
                ports: 5432:5432
                volume: pg_data (named, persistent)
                healthcheck: pg_isready co 5s

  api         build: backend/Dockerfile
                ports: 8000:8000
                volume: /nmap-data (read-only)
                depends_on: postgres (healthy)

  frontend    image: node:20-alpine
                command: npm install && npm run dev -- --host 0.0.0.0
                ports: 5173:5173
                volume: ../frontend:/app (bind mount)
                depends_on: api

  worker      build: worker/Dockerfile
                env: INTERVAL=30
                depends_on: postgres (healthy)
```

Wolumen `pg_data` jest named volume — dane bazy przetrwaja restart kontenerow.
