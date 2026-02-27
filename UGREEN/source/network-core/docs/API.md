# Network Core — Dokumentacja REST API

Wersja API: **v1**
Bazowy URL (produkcja): `http://192.168.0.4:8000`
Interaktywna dokumentacja: `http://192.168.0.4:8000/docs` (Swagger UI)

---

## Spis tresci

- [Konwencje](#konwencje)
- [Autentykacja](#autentykacja)
- [Kody odpowiedzi HTTP](#kody-odpowiedzi-http)
- [Health Check](#health-check)
- [Urzadzenia](#urzadzenia)
- [Polaczenia](#polaczenia)
- [Discovery](#discovery)
- [Schematy danych](#schematy-danych)
- [Kody bledow](#kody-bledow)

---

## Konwencje

- Wszystkie endpointy zwracaja JSON (`Content-Type: application/json`)
- Ciala zapytan POST i PATCH sa w formacie JSON
- Identyfikatory (`id`) sa UUID v4 jako string
- Daty sa w formacie ISO 8601 (UTC): `2026-02-27T14:30:00`
- Wartosci `null` oznaczaja pole opcjonalne, ktore nie zostalo ustawione
- Prefiksy wersji: `/api/v1/`

---

## Autentykacja

Aktualna wersja (v0.1.0) nie wymaga autentykacji. CORS jest skonfigurowany z `allow_origins=["*"]` — wszystkie zrodla sa dozwolone.

---

## Kody odpowiedzi HTTP

| Kod | Znaczenie |
|-----|-----------|
| `200 OK` | Sukces — zasob zwrocony lub zaktualizowany |
| `201 Created` | Zasob zostal utworzony |
| `204 No Content` | Zasob zostal usuniety |
| `404 Not Found` | Zasob o podanym ID nie istnieje |
| `422 Unprocessable Entity` | Nieprawidlowe dane wejsciowe (blad walidacji Pydantic) |
| `503 Service Unavailable` | Baza danych niedostepna (tylko `/health/ready`) |

---

## Health Check

Endpointy sprawdzania stanu systemu. Uzywane przez Docker i orkiestratory do monitorowania zycia serwisu.

### GET /health/live

Sprawdza czy serwer aplikacji dziala (liveness probe).

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "status": "ok"
}
```

**Przyklad:**

```bash
curl http://192.168.0.4:8000/health/live
```

---

### GET /health/ready

Sprawdza gotowosci serwisu — weryfikuje polaczenie z baza danych (readiness probe).

**Odpowiedz (serwis gotowy):**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "status": "ok",
  "db": "ok"
}
```

**Odpowiedz (baza danych niedostepna):**

```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
```

```json
{
  "status": "ok",
  "db": "error"
}
```

**Przyklad:**

```bash
curl http://192.168.0.4:8000/health/ready
```

---

## Urzadzenia

Zasoby reprezentujace urzadzenia sieciowe wykryte w sieci lub dodane recznie.

### GET /api/v1/devices

Zwraca liste wszystkich urzadzen.

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "ip_address": "192.168.0.50",
    "mac_address": "BC:24:11:AB:CD:EF",
    "hostname": "prox50.local",
    "vendor": "Proxmox Server Solutions GmbH",
    "label": "prox50",
    "device_type": "server",
    "status": "alive",
    "created_at": "2026-02-27T13:40:00",
    "updated_at": "2026-02-27T14:30:00"
  }
]
```

**Przyklad:**

```bash
curl http://192.168.0.4:8000/api/v1/devices

# Zlicz urzadzenia
curl -s http://192.168.0.4:8000/api/v1/devices | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))"
```

---

### POST /api/v1/devices

Tworzy nowe urzadzenie.

**Cialo zapytania:**

```json
{
  "ip_address": "192.168.0.200",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "hostname": "mydevice.local",
  "vendor": "ACME Corp",
  "label": "Moje urzadzenie",
  "device_type": "server"
}
```

Wszystkie pola sa opcjonalne oprocz tego — mozna utworzyc urzadzenie bez adresu IP (np. switch manualny).

**Dostepne wartosci `device_type`:**

| Wartosc | Opis |
|---------|------|
| `server` | Serwer (Proxmox, HP) |
| `router` | Router (MikroTik, ASUS, TP-Link) |
| `nas` | Urzadzenie NAS (Ugreen) |
| `iot` | Urzadzenie IoT (Espressif, Tuya, Broadlink) |
| `network` | Urzadzenie sieciowe z portami HTTP/HTTPS |
| `switch` | Przelacznik (dodawany recznie) |
| `unknown` | Nieznane (domyslne) |

**Odpowiedz:**

```
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "ip_address": "192.168.0.200",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "hostname": "mydevice.local",
  "vendor": "ACME Corp",
  "label": "Moje urzadzenie",
  "device_type": "server",
  "status": "unknown",
  "created_at": "2026-02-27T15:00:00",
  "updated_at": "2026-02-27T15:00:00"
}
```

**Przyklad:**

```bash
curl -X POST http://192.168.0.4:8000/api/v1/devices \
  -H "Content-Type: application/json" \
  -d '{
    "ip_address": "192.168.0.200",
    "label": "Switch-salon",
    "device_type": "switch"
  }'
```

---

### GET /api/v1/devices/{id}

Zwraca pojedyncze urzadzenie po ID.

**Parametry sciezki:**

| Parametr | Typ | Opis |
|----------|-----|------|
| `id` | string (UUID) | Identyfikator urzadzenia |

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ip_address": "192.168.0.50",
  "mac_address": "BC:24:11:AB:CD:EF",
  "hostname": "prox50.local",
  "vendor": "Proxmox Server Solutions GmbH",
  "label": "prox50",
  "device_type": "server",
  "status": "alive",
  "created_at": "2026-02-27T13:40:00",
  "updated_at": "2026-02-27T14:30:00"
}
```

**Blad 404:**

```json
{
  "detail": "Device not found"
}
```

**Przyklad:**

```bash
DEVICE_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"
curl http://192.168.0.4:8000/api/v1/devices/${DEVICE_ID}
```

---

### PATCH /api/v1/devices/{id}

Aktualizuje wybrane pola urzadzenia. Mozna wyslac tylko te pola, ktore chcemy zmienic.

**Parametry sciezki:**

| Parametr | Typ | Opis |
|----------|-----|------|
| `id` | string (UUID) | Identyfikator urzadzenia |

**Cialo zapytania (wszystkie pola opcjonalne):**

```json
{
  "label": "Nowa etykieta",
  "hostname": "nowa-nazwa.local",
  "device_type": "router"
}
```

**Dostepne pola do edycji:**

| Pole | Typ | Opis |
|------|-----|------|
| `label` | string lub null | Niestandardowa etykieta uzytkownika |
| `hostname` | string lub null | Nazwa hosta |
| `device_type` | string | Typ urzadzenia (patrz tabela powyzej) |

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

Zwraca zaktualizowany obiekt `DeviceRead`.

**Przyklad:**

```bash
DEVICE_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"
curl -X PATCH http://192.168.0.4:8000/api/v1/devices/${DEVICE_ID} \
  -H "Content-Type: application/json" \
  -d '{"label": "Proxmox Glowny", "device_type": "server"}'
```

---

### DELETE /api/v1/devices/{id}

Usuwa urzadzenie. Jesli urzadzenie ma polaczenia (links), nalezy najpierw usunac te polaczenia.

**Parametry sciezki:**

| Parametr | Typ | Opis |
|----------|-----|------|
| `id` | string (UUID) | Identyfikator urzadzenia |

**Odpowiedz:**

```
HTTP/1.1 204 No Content
```

**Blad 404:**

```json
{
  "detail": "Device not found"
}
```

**Przyklad:**

```bash
DEVICE_ID="3fa85f64-5717-4562-b3fc-2c963f66afa6"
curl -X DELETE http://192.168.0.4:8000/api/v1/devices/${DEVICE_ID}
echo "Status: $?"
```

---

## Polaczenia

Zasoby reprezentujace polaczenia miedzy urzadzeniami (krawedzie grafu topologii).

### GET /api/v1/links

Zwraca liste wszystkich polaczen.

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
[
  {
    "id": "c0ffee00-1234-5678-abcd-000000000001",
    "source_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "target_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "link_type": "ethernet",
    "created_at": "2026-02-27T13:45:00"
  }
]
```

**Przyklad:**

```bash
curl http://192.168.0.4:8000/api/v1/links

# Zlicz polaczenia
curl -s http://192.168.0.4:8000/api/v1/links | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"
```

---

### POST /api/v1/links

Tworzy nowe polaczenie miedzy dwoma urzadzeniami.

**Cialo zapytania:**

```json
{
  "source_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "target_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "link_type": "ethernet"
}
```

**Pola:**

| Pole | Typ | Wymagane | Opis |
|------|-----|----------|------|
| `source_id` | string (UUID) | Tak | ID urzadzenia zrodlowego |
| `target_id` | string (UUID) | Tak | ID urzadzenia docelowego |
| `link_type` | string | Nie | Typ polaczenia: `ethernet` (domyslne) lub `wifi` |

**Odpowiedz:**

```
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "id": "d1e2f3a4-b5c6-7890-abcd-000000000002",
  "source_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "target_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "link_type": "ethernet",
  "created_at": "2026-02-27T16:00:00"
}
```

**Przyklad:**

```bash
# Pobierz ID dwoch urzadzen, a nastepnie polacz je
ROUTER_ID=$(curl -s http://192.168.0.4:8000/api/v1/devices | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(next(x['id'] for x in d if x['device_type']=='router'))")

DEVICE_ID=$(curl -s http://192.168.0.4:8000/api/v1/devices | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(next(x['id'] for x in d if x['device_type']=='nas'))")

curl -X POST http://192.168.0.4:8000/api/v1/links \
  -H "Content-Type: application/json" \
  -d "{\"source_id\": \"${ROUTER_ID}\", \"target_id\": \"${DEVICE_ID}\", \"link_type\": \"wifi\"}"
```

---

### PATCH /api/v1/links/{id}

Aktualizuje typ polaczenia.

**Parametry sciezki:**

| Parametr | Typ | Opis |
|----------|-----|------|
| `id` | string (UUID) | Identyfikator polaczenia |

**Cialo zapytania:**

```json
{
  "link_type": "wifi"
}
```

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

Zwraca zaktualizowany obiekt `LinkRead`.

**Przyklad:**

```bash
LINK_ID="c0ffee00-1234-5678-abcd-000000000001"
curl -X PATCH http://192.168.0.4:8000/api/v1/links/${LINK_ID} \
  -H "Content-Type: application/json" \
  -d '{"link_type": "wifi"}'
```

---

### DELETE /api/v1/links/{id}

Usuwa polaczenie.

**Parametry sciezki:**

| Parametr | Typ | Opis |
|----------|-----|------|
| `id` | string (UUID) | Identyfikator polaczenia |

**Odpowiedz:**

```
HTTP/1.1 204 No Content
```

**Przyklad:**

```bash
LINK_ID="c0ffee00-1234-5678-abcd-000000000001"
curl -X DELETE http://192.168.0.4:8000/api/v1/links/${LINK_ID}
```

---

## Discovery

Endpoint wyzwalajacy automatyczny import urzadzen z plikow Nmap XML.

### POST /api/v1/discovery/run

Uruchamia w tle import urzadzen z plikow Nmap XML. Zwraca natychmiast — import dziala asynchronicznie.

**Cialo zapytania:** brak

**Odpowiedz:**

```
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "status": "discovery started"
}
```

**Co robi discovery:**

1. Odczytuje `nmap-host-discovery.xml` — dane hostow (IP, MAC, vendor, hostname)
2. Odczytuje `nmap-top200.xml` — otwarte porty per host
3. Scala dane po adresie IP
4. Pomija adresy IP juz istniejace w bazie
5. Klasyfikuje typ urzadzenia na podstawie vendora i otwartych portow
6. Wstawia nowe rekordy `Device`
7. Automatycznie tworzy polaczenia `ethernet` od kazdego routera do wszystkich pozostalych urzadzen (pomija juz istniejace pary)

**Przyklad:**

```bash
# Wyzwol discovery
curl -X POST http://192.168.0.4:8000/api/v1/discovery/run

# Poczekaj chwile, a nastepnie sprawdz ile urzadzen jest w bazie
sleep 5
curl -s http://192.168.0.4:8000/api/v1/devices | python3 -c \
  "import json,sys; d=json.load(sys.stdin); types={}; [types.update({x['device_type']: types.get(x['device_type'],0)+1}) for x in d]; print(f'Lacznie: {len(d)}'); [print(f'  {k}: {v}') for k,v in sorted(types.items())]"
```

**Przyklad wyniku:**

```
Lacznie: 59
  iot: 5
  nas: 2
  network: 10
  router: 6
  server: 23
  unknown: 13
```

---

## Schematy danych

### DeviceRead

Pelny obiekt urzadzenia zwracany przez API:

```json
{
  "id": "string (UUID v4)",
  "ip_address": "string (IPv4) lub null",
  "mac_address": "string (format XX:XX:XX:XX:XX:XX) lub null",
  "hostname": "string lub null",
  "vendor": "string (nazwa producenta OUI) lub null",
  "label": "string (niestandardowa etykieta) lub null",
  "device_type": "server | router | nas | iot | network | switch | unknown",
  "status": "alive | unreachable | unknown",
  "created_at": "datetime ISO 8601 lub null",
  "updated_at": "datetime ISO 8601 lub null"
}
```

### DeviceCreate

Cialo zapytania przy tworzeniu urzadzenia:

```json
{
  "ip_address": "string lub null (opcjonalne)",
  "mac_address": "string lub null (opcjonalne)",
  "hostname": "string lub null (opcjonalne)",
  "vendor": "string lub null (opcjonalne)",
  "label": "string lub null (opcjonalne)",
  "device_type": "string (domyslnie: unknown)"
}
```

### DevicePatch

Cialo zapytania przy edycji urzadzenia — wszystkie pola opcjonalne:

```json
{
  "label": "string lub null",
  "hostname": "string lub null",
  "device_type": "string"
}
```

### LinkRead

Pelny obiekt polaczenia zwracany przez API:

```json
{
  "id": "string (UUID v4)",
  "source_id": "string (UUID v4 - ID urzadzenia zrodlowego)",
  "target_id": "string (UUID v4 - ID urzadzenia docelowego)",
  "link_type": "ethernet | wifi",
  "created_at": "datetime ISO 8601 lub null"
}
```

### LinkCreate

Cialo zapytania przy tworzeniu polaczenia:

```json
{
  "source_id": "string (UUID v4) - wymagane",
  "target_id": "string (UUID v4) - wymagane",
  "link_type": "string (domyslnie: ethernet)"
}
```

### LinkPatch

Cialo zapytania przy edycji polaczenia:

```json
{
  "link_type": "string lub null"
}
```

---

## Kody bledow

### 422 Unprocessable Entity — blad walidacji

Zwracany gdy dane wejsciowe nie sa zgodne ze schematem Pydantic:

```json
{
  "detail": [
    {
      "type": "string_type",
      "loc": ["body", "source_id"],
      "msg": "Input should be a valid string",
      "input": 12345,
      "url": "https://errors.pydantic.dev/2.9/v/string_type"
    }
  ]
}
```

### 404 Not Found

```json
{
  "detail": "Device not found"
}
```

lub

```json
{
  "detail": "Link not found"
}
```

---

## Przyklady sesji — typowe przeplywy pracy

### Peiny cykl: dodaj urzadzenie, polacz, edytuj, usun

```bash
BASE="http://192.168.0.4:8000/api/v1"

# 1. Dodaj router
ROUTER=$(curl -s -X POST $BASE/devices \
  -H "Content-Type: application/json" \
  -d '{"ip_address":"192.168.0.1","label":"Glowny router","device_type":"router"}')
ROUTER_ID=$(echo $ROUTER | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "Router ID: $ROUTER_ID"

# 2. Dodaj serwer
SERVER=$(curl -s -X POST $BASE/devices \
  -H "Content-Type: application/json" \
  -d '{"ip_address":"192.168.0.50","label":"Proxmox","device_type":"server"}')
SERVER_ID=$(echo $SERVER | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "Server ID: $SERVER_ID"

# 3. Polacz router z serwerem
LINK=$(curl -s -X POST $BASE/links \
  -H "Content-Type: application/json" \
  -d "{\"source_id\":\"$ROUTER_ID\",\"target_id\":\"$SERVER_ID\"}")
LINK_ID=$(echo $LINK | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "Link ID: $LINK_ID"

# 4. Zaktualizuj etykiete serwera
curl -s -X PATCH $BASE/devices/$SERVER_ID \
  -H "Content-Type: application/json" \
  -d '{"label":"prox50 - Glowny"}' | python3 -m json.tool

# 5. Usun polaczenie
curl -X DELETE $BASE/links/$LINK_ID
echo "Link usuniety: $?"

# 6. Usun urzadzenia
curl -X DELETE $BASE/devices/$SERVER_ID
curl -X DELETE $BASE/devices/$ROUTER_ID
echo "Urzadzenia usuniete"
```

### Pelny reset i ponowny import z Nmap

```bash
BASE="http://192.168.0.4:8000/api/v1"

# Usun wszystkie polaczenia
curl -s $BASE/links | python3 -c "
import json, sys, subprocess
links = json.load(sys.stdin)
for l in links:
    subprocess.run(['curl', '-s', '-X', 'DELETE', f'$BASE/links/{l[\"id\"]}'])
print(f'Usunieto {len(links)} polaczen')
"

# Usun wszystkie urzadzenia
curl -s $BASE/devices | python3 -c "
import json, sys, subprocess
devices = json.load(sys.stdin)
for d in devices:
    subprocess.run(['curl', '-s', '-X', 'DELETE', f'$BASE/devices/{d[\"id\"]}'])
print(f'Usunieto {len(devices)} urzadzen')
"

# Uruchom ponownie discovery
curl -X POST $BASE/discovery/run
echo "Discovery uruchomione — poczekaj kilka sekund"
sleep 10

# Sprawdz wyniki
curl -s $BASE/devices | python3 -c "import json,sys; print(f'Urzadzenia: {len(json.load(sys.stdin))}')"
curl -s $BASE/links | python3 -c "import json,sys; print(f'Polaczenia: {len(json.load(sys.stdin))}')"
```
