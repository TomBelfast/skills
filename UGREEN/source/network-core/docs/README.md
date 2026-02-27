# Network Core

System monitorowania i wizualizacji topologii sieci domowej. Skanuje siec przez Nmap, importuje urzadzenia do PostgreSQL i wyswietla interaktywna mape topologii w przegladarce.

## Spis tresci

- [Przeglad systemu](#przeglad-systemu)
- [Wymagania](#wymagania)
- [Szybki start](#szybki-start)
- [Struktura projektu](#struktura-projektu)
- [Konfiguracja](#konfiguracja)
- [Import urzadzen z Nmap](#import-urzadzen-z-nmap)
- [Testy](#testy)
- [Dokumentacja szczegolowa](#dokumentacja-szczegolowa)

---

## Przeglad systemu

Network Core sklada sie z czterech wspolpracujacych komponentow:

```
Nmap XML files
     |
     v
[API - FastAPI]  <-->  [PostgreSQL]
     |
     v
[Frontend - React/Cytoscape]     [Worker - Ping Monitor]
```

| Komponent | Technologia | Rola |
|-----------|-------------|------|
| API | Python 3.11 + FastAPI | CRUD urzadzen i polaczen, import Nmap |
| Baza danych | PostgreSQL 16 | Trwale przechowywanie topologii |
| Frontend | React 18 + Cytoscape.js | Interaktywna mapa topologii |
| Worker | Python asyncio | Monitoring dostepnosci ICMP |

**Adresy produkcyjne (TrueNAS SCALE `192.168.0.4`):**

| Usluga | URL |
|--------|-----|
| REST API | http://192.168.0.4:8000 |
| Frontend (mapa) | http://192.168.0.4:5173 |
| Swagger UI | http://192.168.0.4:8000/docs |
| ReDoc | http://192.168.0.4:8000/redoc |

---

## Wymagania

**Produkcja (TrueNAS / Linux):**
- Docker Engine 24+
- Docker Compose v2
- Pliki XML z wynikami skanowania Nmap (sciezka `/nmap-data/`)

**Programowanie lokalne:**
- Python 3.11+
- Node.js 20+
- PostgreSQL 16 (lub Docker)

---

## Szybki start

### Uruchomienie przez Docker Compose (zalecane)

```bash
# 1. Sklonuj lub przejdz do katalogu projektu
cd source/network-core

# 2. Uruchom wszystkie serwisy
cd deploy
docker compose up --build

# 3. Sprawdz stan serwisow
docker compose ps
```

Po uruchomieniu:
- API jest dostepne pod adresem http://localhost:8000
- Frontend jest dostepny pod adresem http://localhost:5173
- Swagger UI: http://localhost:8000/docs

### Import urzadzen z Nmap

Po uruchomieniu serwisow wywolaj endpoint discovery, aby wypelnic baze danych:

```bash
curl -X POST http://localhost:8000/api/v1/discovery/run
```

Sprawdz zaimportowane urzadzenia:

```bash
curl http://localhost:8000/api/v1/devices | python3 -m json.tool
```

### Uruchomienie lokalne (tryb deweloperski)

```bash
# Backend
cd backend
pip install -e ".[dev]"
cp .env.example .env        # ustaw DATABASE_URL
alembic upgrade head        # uruchom migracje bazy danych
uvicorn app.main:app --reload

# Frontend (nowe okno terminala)
cd frontend
npm install
npm run dev
```

---

## Struktura projektu

```
network-core/
├── backend/
│   ├── app/
│   │   ├── main.py              # Aplikacja FastAPI, CORS, endpointy health
│   │   ├── config.py            # Ustawienia (DATABASE_URL, DEBUG)
│   │   ├── api/v1/
│   │   │   ├── devices.py       # CRUD /api/v1/devices
│   │   │   ├── links.py         # CRUD /api/v1/links
│   │   │   └── discovery.py     # POST /api/v1/discovery/run
│   │   ├── models/
│   │   │   ├── device.py        # Model SQLAlchemy: Device
│   │   │   └── link.py          # Model SQLAlchemy: Link
│   │   ├── schemas/
│   │   │   ├── device.py        # Schematy Pydantic: DeviceCreate/Read/Patch
│   │   │   └── link.py          # Schematy Pydantic: LinkCreate/Read/Patch
│   │   ├── services/
│   │   │   ├── device_service.py  # Operacje CRUD na urzadzeniach
│   │   │   ├── link_service.py    # Operacje CRUD na polaczeniach
│   │   │   └── nmap_service.py    # Parser XML Nmap + import + auto-linkowanie
│   │   └── db/
│   │       └── session.py       # Fabryka AsyncSession
│   ├── migrations/              # Migracje Alembic
│   │   └── versions/
│   │       ├── de9e88329489_initial_devices_and_links.py
│   │       ├── a1b2c3d4e5f6_add_device_status.py
│   │       └── 12a7d8a0def0_make_ip_nullable_and_add_switch_support.py
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Glowny komponent: pobiera dane, renderuje legende i mape
│   │   ├── api/devices.js       # Wywolania axios: fetchDevices(), fetchLinks()
│   │   └── components/
│   │       └── TopologyMap.jsx  # Platno topologii Cytoscape.js
│   ├── package.json
│   └── vite.config.js
├── worker/
│   ├── ping_worker.py           # Asynchroniczny monitor ICMP, aktualizuje device.status
│   ├── Dockerfile
│   └── requirements.txt
├── deploy/
│   └── docker-compose.yml       # Produkcja: postgres, api, frontend, worker
├── tests/
│   ├── unit/                    # Testy jednostkowe pytest (offline)
│   ├── integration/             # Testy integracyjne pytest (SQLite in-memory)
│   └── e2e/
│       └── test_e2e.py          # Testy E2E Playwright na zywy deployment
└── docs/
    ├── README.md                # Ten plik
    ├── API.md                   # Pelna dokumentacja REST API
    ├── ARCHITECTURE.md          # Architektura i komponenty
    ├── DEPLOYMENT.md            # Wdrozenie na TrueNAS SCALE
    └── plans/
        └── 2026-02-27-sprint2.md
```

---

## Konfiguracja

### Zmienne srodowiskowe — API

| Zmienna | Opis | Przyklad |
|---------|------|---------|
| `DATABASE_URL` | Adres polaczenia PostgreSQL (wymagany) | `postgresql+asyncpg://netcore:netcore@postgres:5432/netcore` |
| `DEBUG` | Tryb debugowania SQL (opcjonalny) | `false` |

### Zmienne srodowiskowe — Frontend

| Zmienna | Opis | Przyklad |
|---------|------|---------|
| `VITE_API_URL` | Bazowy URL backendu | `http://192.168.0.4:8000` |

### Zmienne srodowiskowe — Worker

| Zmienna | Opis | Przyklad |
|---------|------|---------|
| `DATABASE_URL` | Adres polaczenia PostgreSQL (wymagany) | `postgresql+asyncpg://netcore:netcore@postgres:5432/netcore` |
| `INTERVAL` | Czas miedzy rundami pingowania (sekundy) | `30` |

### Plik `.env` (tryb deweloperski)

Skopiuj szablon i uzupelnij:

```bash
cp backend/.env.example backend/.env
```

Zawartosc pliku `.env`:

```env
DATABASE_URL=postgresql+asyncpg://netcore:netcore@localhost:5432/netcore
DEBUG=false
```

---

## Import urzadzen z Nmap

System oczekuje dwoch plikow XML w katalogu `/nmap-data/` (produkcja) lub `../../network-diagnostics-output/` (deweloperski):

| Plik | Opis |
|------|------|
| `nmap-host-discovery.xml` | Wyniki skanowania wykrywania hostow |
| `nmap-top200.xml` | Wyniki skanowania 200 najpopularniejszych portow |

**Jak wygenerowac pliki Nmap:**

```bash
# Skanowanie wykrywania hostow w sieci 192.168.0.0/24
nmap -sn 192.168.0.0/24 -oX nmap-host-discovery.xml

# Skanowanie 200 portow
nmap -sV --top-ports 200 192.168.0.0/24 -oX nmap-top200.xml
```

**Uruchomienie importu:**

```bash
curl -X POST http://192.168.0.4:8000/api/v1/discovery/run
```

Import dziala w tle. Pomija IP juz istniejace w bazie. Po imporcie automatycznie tworzy polaczenia ethernet od kazdego routera do pozostalych urzadzen.

**Stan po ostatnim skanowaniu:**
- 59 urzadzen zaimportowanych
- 333 polaczen wygenerowanych automatycznie (6 routerow x ~55 urzadzen)
- Podzial: 23 serwery, 10 siec, 6 routery, 13 nieznane, 5 IoT, 2 NAS

---

## Testy

### Testy jednostkowe i integracyjne

```bash
cd backend
python -m pytest ../tests/unit ../tests/integration -v
```

Oczekiwany wynik: **29 testow passing**

Testy integracyjne uzywaja SQLite in-memory — nie wymagaja uruchomionej bazy PostgreSQL.

### Testy E2E

Testy E2E wymagaja dzialajacego deploymentu na TrueNAS:

```bash
cd backend
python -m pytest ../tests/e2e/test_e2e.py -v
```

Oczekiwany wynik: **19 testow passing** (Health x2, Devices CRUD x6, Links CRUD x3, Discovery x1, Frontend Playwright x5)

### Pokrycie kodu

```bash
cd backend
python -m pytest ../tests/unit ../tests/integration --cov=app --cov-report=html
```

Raport HTML zostanie zapisany do `backend/htmlcov/`.

---

## Dokumentacja szczegolowa

| Dokument | Zawartosc |
|----------|-----------|
| [API.md](API.md) | Pelna dokumentacja REST API z przykladami curl |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architektura systemu, schemat bazy danych, opis komponentow |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Instrukcja wdrozenia na TrueNAS SCALE krok po kroku |

---

## Stan aktualny — Sprint 2 (2026-02-27)

| Funkcjonalnosc | Status |
|----------------|--------|
| CRUD urzadzen (`/api/v1/devices`) | Wdrozone |
| CRUD polaczen (`/api/v1/links`) | Wdrozone |
| Health check z weryfikacja DB | Wdrozone |
| Import z plikow Nmap XML | Wdrozone |
| Auto-linkowanie routerow | Wdrozone |
| Mapa topologii (Cytoscape.js) | Wdrozone |
| Grupy urzadzen (compound nodes) | Wdrozone |
| Ikony SVG per typ urzadzenia | Wdrozone |
| Tooltip po najechaniu | Wdrozone |
| Worker pingowania ICMP | Wdrozone |
| Wizualizacja statusu (czerwona ramka) | Wdrozone |
| Docker Compose (4 serwisy) | Wdrozone |
| Testy unit + integracyjne | 29 testow |
| Testy E2E Playwright | 19 testow |
