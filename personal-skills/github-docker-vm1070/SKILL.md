---
name: github-docker-vm1070
description: Automatyczny deploy projektów z GitHuba do środowiska Docker na Proxmox VM 1070 (test-lab-vm)
---

# Zastosowanie

## Auto-Correction Rules

When you use this skill and find an error, outdated command, missing step,
or pitfall — FIX IT IMMEDIATELY. Do not wait or ask permission.

1. Read the current SKILL.md using your `view_file` tool (e.g., `view_file {AbsolutePath: "/root/.agents/skills/<skill-name>/SKILL.md"}`).
2. Edit it with your file editing tools (`replace_file_content` or `multi_replace_file_content`) to correct the mistake.
3. Add any discovered pitfalls to the `## Pitfalls` section.
4. Report what you fixed to the user.

If a command doesn't work, a path is wrong, or a step is missing — 
update the skill before finishing your current task.

## Pitfalls

- **yaml vs yml**: Be aware of `.yml` vs `.yaml` extensions in configuration files. If a file operation fails, always check both extensions.

Używaj tego skilla ZAWSZE, gdy użytkownik poda link do GitHuba i poprosi o zainstalowanie, uruchomienie lub "zrobienie tego" na wirtualnej maszynie 1070 (VM 1070).

# Środowisko Docelowe (VM 1070)
* **IP:** `192.168.0.105`
* **Użytkownik:** `root`
* **Hasło:** `Swiat1976`
* **Metoda łączenia:** `sshpass -p 'Swiat1976' ssh -o StrictHostKeyChecking=no root@192.168.0.105`
* **Infrastruktura na maszynie:** Zainstalowany Docker oraz Docker Compose.

# Workflow Instalacji

1. **Analiza repozytorium GitHub**
   Przeanalizuj podany adres URL repozytorium (np. używając `read_url_content` dla `README.md` oraz plików `package.json`, `go.mod`, `requirements.txt` lub `Dockerfile`). 
   Rozpoznaj jakich technologii wymaga projekt (Node.js, Go, Python itp.).

2. **Generowanie konfiguracji (lokalnie)**
   Utwórz katalog w `/tmp/deploy-XXX/` na maszynie hosta i wygeneruj tam pliki niezbędne do konteneryzacji projektu:
   * **`Dockerfile`**: Jeśli projekt nie ma własnego, napisz taki, który spełnia wszystkie jego zależności. Wykorzystuj oficjalne obrazy bazowe (np. `golang:latest`, `node:22-alpine`, `python:3.12-slim`).
   * **`docker-compose.yml`**: Skonfiguruj serwis, zmapuj odpowiednie porty, oraz utwórz wolumeny (persistent volumes) na dane aplikacji. Jeśli aplikacja potrzebuje bazy danych, dodaj ją jako serwis w compose.
   * **Wrappery/Skrypty**: Jeśli to CLI, wygeneruj skrypt `.sh` uruchamiający kontener interaktywnie (`docker run -it --rm`).

3. **Transfer plików na VM 1070**
   Stwórz katalog instalacyjny na VM:
   `sshpass -p 'Swiat1976' ssh -o StrictHostKeyChecking=no root@192.168.0.105 "mkdir -p /opt/<nazwa-projektu>"`
   Prześlij wygenerowane pliki przez `scp`:
   `sshpass -p 'Swiat1976' scp -o StrictHostKeyChecking=no /tmp/deploy-XXX/* root@192.168.0.105:/opt/<nazwa-projektu>/`

4. **Kompilacja i Uruchomienie (w tle)**
   Uruchom proces kompilacji i budowania obrazów w tle na VM 1070, używając polecenia `nohup` lub odpalając komendę w tle z przekierowaniem logów:
   ```bash
   sshpass -p 'Swiat1976' ssh -o StrictHostKeyChecking=no root@192.168.0.105 \
     "cd /opt/<nazwa-projektu> && docker compose build 2>&1 > build.log && docker compose up -d" &
   ```
   *Upewnij się, że informujesz użytkownika o rozpoczęciu budowy.*

5. **Weryfikacja**
   Skonfiguruj timer (używając narzędzia `schedule`), by sprawdzić logi na VM (np. używając `tail /opt/<nazwa-projektu>/build.log` lub `docker ps`) i zamelduj sukces użytkownikowi wraz z instrukcją jak dostać się do interfejsu webowego (IP + Port) lub jak używać CLI.

# Krytyczne wytyczne
* Zawsze używaj `sshpass` w połączniu ze `StrictHostKeyChecking=no`.
* Buduj i uruchamiaj oprogramowanie **tylko** w środowisku kontenerów Docker, aby utrzymać maszynę `test-lab-vm` w czystości i łatwości zarządzania (unikaj instalowania pakietów apt bezpośrednio na VM, wkładaj je do Dockerfile).
* Zachowaj persystencję danych podmontowując wolumeny z hosta (np. `-v <nazwa>-data:/data` lub `-v /opt/<nazwa-projektu>/data:/data`).
