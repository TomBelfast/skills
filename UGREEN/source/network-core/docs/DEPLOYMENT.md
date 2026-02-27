# Network Core — Instrukcja wdrozenia na TrueNAS SCALE

---

## Spis tresci

- [Wymagania wstepne](#wymagania-wstepne)
- [Przygotowanie srodowiska TrueNAS](#przygotowanie-srodowiska-truenas)
- [Konfiguracja plikow Nmap](#konfiguracja-plikow-nmap)
- [Wdrozenie przez Docker Compose](#wdrozenie-przez-docker-compose)
- [Weryfikacja deploymentu](#weryfikacja-deploymentu)
- [Import urzadzen z Nmap](#import-urzadzen-z-nmap)
- [Konfiguracja Nginx Proxy Manager](#konfiguracja-nginx-proxy-manager)
- [Zarzadzanie serwisem](#zarzadzanie-serwisem)
- [Aktualizacja deploymentu](#aktualizacja-deploymentu)
- [Tworzenie kopii zapasowych](#tworzenie-kopii-zapasowych)
- [Rozwiazywanie problemow](#rozwiazywanie-problemow)
- [Migracje bazy danych](#migracje-bazy-danych)

---

## Wymagania wstepne

| Wymaganie | Wersja | Uwagi |
|-----------|--------|-------|
| TrueNAS SCALE | 22.12+ | Debian-based Linux |
| Docker Engine | 24+ | Dostepny przez Apps lub SSH |
| Docker Compose | v2 | `docker compose` (bez myslnika) |
| Dostep SSH | - | root lub uzytkownik z uprawnieniami Docker |
| Pliki Nmap XML | - | Wygenerowane wczesniej ze skanowania sieci |

**Adresy serwera (konfiguracja aktualna):**
- TrueNAS SCALE: `192.168.0.4`
- SSH: `ssh root@192.168.0.4`

---

## Przygotowanie srodowiska TrueNAS

### Krok 1: Polaczenie z serwerem przez SSH

```bash
ssh root@192.168.0.4
```

### Krok 2: Sprawdzenie dostepnosci Docker

```bash
docker --version
docker compose version
```

Oczekiwany wynik:

```
Docker version 24.x.x, build ...
Docker Compose version v2.x.x
```

Jesli Docker nie jest dostepny, wlacz go w TrueNAS SCALE:
`System Settings → Advanced → Docker → Enable Docker`

### Krok 3: Utworzenie katalogu dla projektu

```bash
mkdir -p /mnt/data/apps/network-core
cd /mnt/data/apps/network-core
```

Katalog `/mnt/data/` to montowany pool ZFS — dane przetrwaja restarty systemu.

### Krok 4: Skopiowanie projektu na serwer

Z komputera lokalnego (Windows — Git Bash lub WSL):

```bash
# Skopiuj caly projekt przez scp
scp -r /c/APLIKACJE/UGREEN/source/network-core/ root@192.168.0.4:/mnt/data/apps/

# Lub przez rsync (szybsze przy aktualizacjach)
rsync -avz --exclude='node_modules' --exclude='__pycache__' --exclude='.venv' \
  /c/APLIKACJE/UGREEN/source/network-core/ \
  root@192.168.0.4:/mnt/data/apps/network-core/
```

### Krok 5: Weryfikacja struktury na serwerze

```bash
ls -la /mnt/data/apps/network-core/
```

Oczekiwana struktura:

```
backend/
deploy/
  docker-compose.yml
docs/
frontend/
tests/
worker/
```

---

## Konfiguracja plikow Nmap

Pliki XML z wynikami skanowania Nmap musza byc dostepne w katalogu montowanym do kontenera API.

### Krok 1: Skanowanie sieci na komputerze z Nmap

Skanowanie wymaga uprawnien roota lub sudo:

```bash
# Skanowanie wykrywania hostow (szybkie, ~30 sekund)
sudo nmap -sn 192.168.0.0/24 -oX nmap-host-discovery.xml

# Skanowanie 200 portow (wolniejsze, ~5-15 minut)
sudo nmap -sV --top-ports 200 192.168.0.0/24 -oX nmap-top200.xml
```

### Krok 2: Skopiowanie plikow na serwer

```bash
# Utwoz katalog dla danych Nmap
ssh root@192.168.0.4 "mkdir -p /mnt/data/network-diagnostics-output"

# Skopiuj pliki
scp nmap-host-discovery.xml nmap-top200.xml \
  root@192.168.0.4:/mnt/data/network-diagnostics-output/
```

### Krok 3: Weryfikacja plikow na serwerze

```bash
ssh root@192.168.0.4 "ls -lh /mnt/data/network-diagnostics-output/"
```

Oczekiwany wynik:

```
-rw-r--r-- 1 root root 45K Feb 27 14:00 nmap-host-discovery.xml
-rw-r--r-- 1 root root 890K Feb 27 14:05 nmap-top200.xml
```

### Aktualizacja docker-compose.yml — sciezka do plikow Nmap

Sprawdz i dostosuj sciezke do wolumenu w `deploy/docker-compose.yml`:

```yaml
  api:
    volumes:
      - /mnt/data/network-diagnostics-output:/nmap-data:ro
```

Zamiast sciezki wzglednej `../../network-diagnostics-output` uzyj bezwzglednej sciezki do katalogu na TrueNAS.

---

## Wdrozenie przez Docker Compose

### Krok 1: Przejscie do katalogu deploy

```bash
cd /mnt/data/apps/network-core/deploy
```

### Krok 2: Dostosowanie docker-compose.yml dla produkcji

Sprawdz zawartosc pliku:

```bash
cat docker-compose.yml
```

Dostosuj zmienna srodowiskowa frontendu — zmien `localhost` na IP serwera:

```yaml
services:
  frontend:
    environment:
      VITE_API_URL: http://192.168.0.4:8000
```

Pelna zawartosc pliku `docker-compose.yml` dla produkcji:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: netcore
      POSTGRES_PASSWORD: netcore
      POSTGRES_DB: netcore
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U netcore"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  api:
    build:
      context: ../backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://netcore:netcore@postgres:5432/netcore
      DEBUG: "false"
    ports:
      - "8000:8000"
    volumes:
      - /mnt/data/network-diagnostics-output:/nmap-data:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
    volumes:
      - ../frontend:/app
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://192.168.0.4:8000
    depends_on:
      - api
    restart: unless-stopped

  worker:
    build:
      context: ../worker
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://netcore:netcore@postgres:5432/netcore
      INTERVAL: "30"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pg_data:
```

### Krok 3: Budowanie i uruchomienie

```bash
# Pierwsze uruchomienie — buduje obrazy Docker
docker compose up --build -d

# Sprawdz logi podczas uruchamiania
docker compose logs -f
```

Oczekiwany wynik po ~60 sekundach:

```
network-core-postgres-1  | PostgreSQL init process complete
network-core-api-1       | INFO:     Application startup complete.
network-core-api-1       | INFO:     Uvicorn running on http://0.0.0.0:8000
network-core-frontend-1  | > network-core-frontend@0.0.0 dev
network-core-frontend-1  | Local:   http://localhost:5173/
network-core-worker-1    | INFO ping_worker started. Interval: 30s
```

### Krok 4: Uruchomienie migracji bazy danych

Migracje nalezy uruchomic po pierwszym uruchomieniu lub po aktualizacji schematu:

```bash
docker compose exec api alembic upgrade head
```

Oczekiwany wynik:

```
INFO  [alembic.runtime.migration] Running upgrade  -> de9e88329489, initial devices and links
INFO  [alembic.runtime.migration] Running upgrade de9e88329489 -> a1b2c3d4e5f6, add device status
INFO  [alembic.runtime.migration] Running upgrade a1b2c3d4e5f6 -> 12a7d8a0def0, make ip nullable and add switch support
```

---

## Weryfikacja deploymentu

### Sprawdzenie stanu serwisow

```bash
docker compose ps
```

Oczekiwany wynik (wszystkie `running`):

```
NAME                       STATUS         PORTS
network-core-api-1         Up             0.0.0.0:8000->8000/tcp
network-core-frontend-1    Up             0.0.0.0:5173->5173/tcp
network-core-postgres-1    Up (healthy)   0.0.0.0:5432->5432/tcp
network-core-worker-1      Up
```

### Sprawdzenie health endpointow

```bash
# Liveness
curl http://192.168.0.4:8000/health/live

# Readiness (weryfikacja polaczenia DB)
curl http://192.168.0.4:8000/health/ready
```

Oczekiwane odpowiedzi:

```json
{"status": "ok"}
{"status": "ok", "db": "ok"}
```

### Sprawdzenie frontendu

Otworz przegldarke:

```
http://192.168.0.4:5173
```

Strona powinna wyswietlic ciemne tlo z naglowkiem "Network Topology" i pusta mape (0 urzadzen przed pierwszym importem).

### Sprawdzenie Swagger UI

```
http://192.168.0.4:8000/docs
```

Powinna sie otworzyc interaktywna dokumentacja API.

---

## Import urzadzen z Nmap

Po pomyslnym wdrozeniu nalezy wykonac pierwszy import urzadzen:

### Krok 1: Wyzwolenie discovery

```bash
curl -X POST http://192.168.0.4:8000/api/v1/discovery/run
```

Odpowiedz:

```json
{"status": "discovery started"}
```

### Krok 2: Oczekiwanie na zakonczenie importu

Import dziala w tle. Dla ~60 hostow zajmuje okolo 5-30 sekund w zaleznosci od rozmiaru plikow XML:

```bash
# Monitoruj logi API
docker compose logs api -f
```

### Krok 3: Weryfikacja wynikow

```bash
# Liczba urzadzen
curl -s http://192.168.0.4:8000/api/v1/devices | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Urzadzenia: {len(d)}')"

# Liczba polaczen
curl -s http://192.168.0.4:8000/api/v1/links | \
  python3 -c "import json,sys; print(f'Polaczenia: {len(json.load(sys.stdin))}')"

# Podzial wedlug typow
curl -s http://192.168.0.4:8000/api/v1/devices | python3 -c "
import json, sys
devices = json.load(sys.stdin)
types = {}
for d in devices:
    t = d['device_type']
    types[t] = types.get(t, 0) + 1
print('Typy urzadzen:')
for t, count in sorted(types.items()):
    print(f'  {t}: {count}')
"
```

Oczekiwany wynik po imporcie (zalezy od skanowania sieci):

```
Urzadzenia: 59
Polaczenia: 333
Typy urzadzen:
  iot: 5
  nas: 2
  network: 10
  router: 6
  server: 23
  unknown: 13
```

---

## Konfiguracja Nginx Proxy Manager

Jesli chcesz ustawic domeny zamiast adresow IP, skonfiguruj proxy hosts w Nginx Proxy Manager (dostepny pod adresem `https://ngnix.aihub.ovh`).

### Konfiguracja proxy dla API

| Pole | Wartosc |
|------|---------|
| Domain Names | `network-api.aihub.ovh` |
| Scheme | `http` |
| Forward Hostname/IP | `192.168.0.4` |
| Forward Port | `8000` |
| SSL Certificate | Letsencrypt (rekomendowane) |

### Konfiguracja proxy dla Frontend

| Pole | Wartosc |
|------|---------|
| Domain Names | `network.aihub.ovh` |
| Scheme | `http` |
| Forward Hostname/IP | `192.168.0.4` |
| Forward Port | `5173` |
| SSL Certificate | Letsencrypt (rekomendowane) |

Po skonfigurowaniu domen, zaktualizuj `VITE_API_URL` we frontencu:

```yaml
environment:
  VITE_API_URL: https://network-api.aihub.ovh
```

---

## Zarzadzanie serwisem

### Standardowe komendy Docker Compose

Wszystkie komendy uruchamiaj z katalogu `deploy/`:

```bash
cd /mnt/data/apps/network-core/deploy

# Sprawdz stan serwisow
docker compose ps

# Uruchom wszystkie serwisy
docker compose up -d

# Zatrzymaj wszystkie serwisy (dane w wolumenie przetrwaja)
docker compose stop

# Zatrzymaj i usun kontenery (dane przetrwaja w wolumenie pg_data)
docker compose down

# UWAGA: Usun kontenery I wolumeny (utrata danych bazy!)
docker compose down -v

# Zrestartuj konkretny serwis
docker compose restart api
docker compose restart worker
```

### Podglad logow

```bash
# Wszystkie serwisy
docker compose logs -f

# Konkretny serwis
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f postgres
docker compose logs -f frontend

# Ostatnie 100 linii
docker compose logs --tail=100 api
```

### Wejscie do kontenera

```bash
# Shell w kontenerze API
docker compose exec api bash

# Shell w kontenerze bazy danych
docker compose exec postgres psql -U netcore netcore

# Uruchom komende w kontenerze
docker compose exec api alembic current
docker compose exec api alembic history
```

### Bezposrednie zapytania do bazy

```bash
# Wejscie do psql
docker compose exec postgres psql -U netcore netcore

# Lub z zewnatrz (port 5432 jest wystawiony)
psql -h 192.168.0.4 -U netcore -d netcore
```

Przydatne zapytania SQL:

```sql
-- Liczba urzadzen per typ
SELECT device_type, COUNT(*) FROM devices GROUP BY device_type ORDER BY count DESC;

-- Urzadzenia niedostepne (status = unreachable)
SELECT label, ip_address, status, updated_at FROM devices
WHERE status = 'unreachable' ORDER BY updated_at DESC;

-- Liczba polaczen
SELECT COUNT(*) FROM links;

-- Ostatnio zaktualizowane urzadzenia
SELECT ip_address, status, updated_at FROM devices
ORDER BY updated_at DESC LIMIT 20;
```

---

## Aktualizacja deploymentu

### Aktualizacja kodu (bez zmian schematu DB)

```bash
# 1. Skopiuj nowy kod na serwer
rsync -avz --exclude='node_modules' --exclude='__pycache__' --exclude='.venv' \
  /c/APLIKACJE/UGREEN/source/network-core/ \
  root@192.168.0.4:/mnt/data/apps/network-core/

# 2. Przebuduj i zrestartuj
cd /mnt/data/apps/network-core/deploy
docker compose up --build -d

# 3. Sprawdz logi
docker compose logs -f api
```

### Aktualizacja ze zmiana schematu bazy danych

Jesli nowa wersja zawiera nowe migracje Alembic:

```bash
# 1. Skopiuj kod
rsync -avz ... root@192.168.0.4:/mnt/data/apps/network-core/

# 2. Zrestartuj z nowym buildem
cd /mnt/data/apps/network-core/deploy
docker compose up --build -d

# 3. Uruchom migracje
docker compose exec api alembic upgrade head

# 4. Sprawdz czy migracja przebiegla pomyslnie
docker compose exec api alembic current

# 5. Sprawdz API
curl http://192.168.0.4:8000/health/ready
```

### Rollback do poprzedniej wersji

```bash
# Cofnij migracje (jesli potrzebne)
docker compose exec api alembic downgrade -1

# Skopiuj poprzednia wersje kodu
# Przebuduj
docker compose up --build -d
```

---

## Tworzenie kopii zapasowych

### Kopia zapasowa bazy danych

```bash
# Utwoz dump PostgreSQL
docker compose exec postgres pg_dump -U netcore netcore > \
  /mnt/data/backups/network-core-$(date +%Y%m%d-%H%M%S).sql

# Sprawdz rozmiar backupu
ls -lh /mnt/data/backups/network-core-*.sql | tail -5
```

### Przywrocenie bazy danych z kopii

```bash
# Zatrzymaj serwisy korzystajace z bazy
docker compose stop api worker

# Przywroc dump
docker compose exec -T postgres psql -U netcore netcore < \
  /mnt/data/backups/network-core-YYYYMMDD-HHMMSS.sql

# Uruchom ponownie
docker compose start api worker
```

### Automatyczna kopia (cron na TrueNAS)

Dodaj do crontab (`crontab -e`):

```cron
# Kopia zapasowa Network Core co noc o 3:00
0 3 * * * cd /mnt/data/apps/network-core/deploy && \
  docker compose exec -T postgres pg_dump -U netcore netcore > \
  /mnt/data/backups/network-core-$(date +\%Y\%m\%d).sql && \
  find /mnt/data/backups -name "network-core-*.sql" -mtime +30 -delete
```

---

## Rozwiazywanie problemow

### Problem: API nie uruchamia sie — blad polaczenia z baza

**Objawy:** Kontener API restartuje sie w petli, logi pokazuja `connection refused` do postgres.

**Diagnoza:**

```bash
docker compose ps postgres
docker compose logs postgres
```

**Rozwiazanie:** Sprawdz czy postgres jest healthy:

```bash
docker compose exec postgres pg_isready -U netcore
```

Jesli postgres nie startuje:

```bash
# Sprawdz logi postgres
docker compose logs postgres --tail=50

# Sprawdz zajtosc portu
ss -tlnp | grep 5432
```

---

### Problem: Frontend pokazuje blad CORS

**Objawy:** Mapa topologii nie laduje danych, konsola przegladarki pokazuje `CORS error`.

**Diagnoza:** Sprawdz czy `VITE_API_URL` wskazuje na wlasciwy adres:

```bash
docker compose exec frontend printenv VITE_API_URL
```

**Rozwiazanie:** Zaktualizuj `VITE_API_URL` w docker-compose.yml:

```yaml
environment:
  VITE_API_URL: http://192.168.0.4:8000
```

A nastepnie zrestartuj frontend:

```bash
docker compose restart frontend
```

---

### Problem: Discovery nie importuje urzadzen

**Objawy:** `POST /api/v1/discovery/run` zwraca `{"status": "discovery started"}` ale liczba urzadzen sie nie zmienia.

**Diagnoza:**

```bash
# Sprawdz logi API po wywolaniu discovery
docker compose logs api --tail=50

# Sprawdz czy pliki Nmap sa dostepne w kontenerze
docker compose exec api ls -la /nmap-data/
```

**Mozliwe przyczyny i rozwiazania:**

1. Pliki Nmap nie sa zamontowane:

```bash
# Sprawdz volume w docker-compose.yml
grep -A2 "volumes:" deploy/docker-compose.yml | grep nmap

# Popraw sciezke do katalogu z plikami
# Np.: /mnt/data/network-diagnostics-output:/nmap-data:ro
```

2. Pliki maja nieprawidlowe nazwy:

```bash
docker compose exec api ls /nmap-data/
# Oczekiwane: nmap-host-discovery.xml, nmap-top200.xml
```

3. IP juz istnieja w bazie (discovery pomija duplikaty):

```bash
# Sprawdz liczbe urzadzen
curl http://192.168.0.4:8000/api/v1/devices | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"
```

---

### Problem: Worker ping nie aktualizuje statusow

**Objawy:** Urzadzenia maja status `unknown` nawet po dluzszym czasie.

**Diagnoza:**

```bash
docker compose logs worker --tail=50
```

**Sprawdz:**

```bash
# Czy worker ma dostep do bazy
docker compose exec worker env | grep DATABASE_URL

# Czy ping dziala w kontenerze workera
docker compose exec worker ping -c 1 192.168.0.50
```

**Jesli ping nie dziala** (kontener bez uprawnien NET_RAW):

Dodaj uprawnienia do serwisu worker w docker-compose.yml:

```yaml
  worker:
    cap_add:
      - NET_RAW
```

Nastepnie zrestartuj:

```bash
docker compose up -d --force-recreate worker
```

---

### Problem: Frontend zajmuje zbyt duzo czasu przy starcie

**Objawy:** Strona laduje sie powoli (>30 sekund) za pierwszym razem.

**Przyczyna:** Vite dev server instaluje zalenoeci npm przy kazdym starcie kontenera.

**Rozwiazanie krotkoterminowe:** Poczekaj ~60 sekund przy pierwszym starcie.

**Rozwiazanie dlugoterminowe:** Zbuduj statyczne pliki frontendu i serwuj przez nginx:

```dockerfile
# frontend/Dockerfile.prod (przyklad)
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

### Podglad stanu calego systemu — jednolinijkowy skrypt diagnostyczny

```bash
echo "=== Network Core Status ===" && \
echo "Health:" && curl -s http://192.168.0.4:8000/health/ready && \
echo "" && echo "Devices:" && \
curl -s http://192.168.0.4:8000/api/v1/devices | python3 -c "
import json, sys
d = json.load(sys.stdin)
t = {}
[t.update({x['device_type']: t.get(x['device_type'],0)+1}) for x in d]
s = {}
[s.update({x['status']: s.get(x['status'],0)+1}) for x in d]
print(f'  Total: {len(d)}')
print(f'  Types: {dict(sorted(t.items()))}')
print(f'  Status: {dict(sorted(s.items()))}')
" && \
echo "Links:" && \
curl -s http://192.168.0.4:8000/api/v1/links | python3 -c "import json,sys; print(f'  Total: {len(json.load(sys.stdin))}')" && \
echo "=== Docker Compose ===" && \
cd /mnt/data/apps/network-core/deploy && docker compose ps
```

---

## Migracje bazy danych

Migracje sa zarzadzane przez Alembic i musza byc uruchamiane recznie.

### Sprawdzenie stanu migracji

```bash
docker compose exec api alembic current
docker compose exec api alembic history --verbose
```

### Zastosowanie migracji

```bash
# Zastosuj wszystkie oczekujace migracje
docker compose exec api alembic upgrade head

# Zastosuj konkretna migracje
docker compose exec api alembic upgrade a1b2c3d4e5f6

# Cofnij ostatnia migracje
docker compose exec api alembic downgrade -1

# Cofnij do poczatku (UWAGA: usuwa wszystkie tabele)
docker compose exec api alembic downgrade base
```

### Historia migracji projektu

| Rewizja | Opis | Operacja |
|---------|------|----------|
| `de9e88329489` | Poczatkowe tabele devices i links | CREATE TABLE |
| `a1b2c3d4e5f6` | Dodano kolumne status do devices | ALTER TABLE |
| `12a7d8a0def0` | ip_address nullable, wsparcie switch | ALTER TABLE |

### Tworzenie nowej migracji (przy rozwoju)

Po zmodyfikowaniu modeli SQLAlchemy w `backend/app/models/`:

```bash
# Wygeneruj migracje automatycznie
docker compose exec api alembic revision --autogenerate -m "opis_zmiany"

# Sprawdz wygenerowany plik
docker compose exec api cat migrations/versions/XXXX_opis_zmiany.py

# Zastosuj
docker compose exec api alembic upgrade head
```

---

## Podsumowanie — listy kontrolne

### Lista kontrolna pierwszego wdrozenia

```
[ ] Serwer TrueNAS dostepny przez SSH (192.168.0.4)
[ ] Docker Engine i Docker Compose dostepne
[ ] Katalog projektu utworzony (/mnt/data/apps/network-core)
[ ] Kod projektu skopiowany na serwer
[ ] Pliki Nmap XML skopiowane (/mnt/data/network-diagnostics-output/)
[ ] docker-compose.yml zaktualizowany (sciezka nmap, VITE_API_URL)
[ ] docker compose up --build -d uruchomiony
[ ] docker compose ps: wszystkie serwisy Running
[ ] alembic upgrade head wykonany
[ ] curl /health/ready zwraca {"db": "ok"}
[ ] http://192.168.0.4:5173 dostepny w przegladarce
[ ] POST /api/v1/discovery/run wykonany
[ ] Urzadzenia widoczne w mapie topologii
```

### Lista kontrolna kazdej aktualizacji

```
[ ] Kopia zapasowa bazy danych przed aktualizacja
[ ] Kod skopiowany na serwer (rsync)
[ ] docker compose up --build -d
[ ] alembic upgrade head (jesli sa nowe migracje)
[ ] curl /health/ready zwraca {"db": "ok"}
[ ] Sprawdzenie logow: docker compose logs --tail=50 api
[ ] Weryfikacja mapy topologii w przegladarce
```
