# Network Core — Quickstart

## Wymagania
- Python 3.11+
- Docker + Docker Compose v2
- PostgreSQL (lub użyj docker-compose)

## Uruchomienie przez Docker (zalecane)

```bash
cd source/network-core/deploy
docker compose up --build
```

API dostępne na: http://localhost:8000
Dokumentacja: http://localhost:8000/docs

## Uruchomienie lokalne (development)

```bash
cd source/network-core/backend
pip install -e ".[dev]"
cp .env.example .env
# Edytuj .env — ustaw DATABASE_URL

# Uruchom migracje
alembic upgrade head

# Uruchom serwer
uvicorn app.main:app --reload
```

## Testy

```bash
cd source/network-core/backend
pytest ../tests/ -v --cov=app
```

## Seed — import z Nmap

```bash
curl -X POST http://localhost:8000/api/v1/discovery/run
curl http://localhost:8000/api/v1/devices
```

## Dostępne endpointy

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
