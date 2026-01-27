import os
import json
import urllib.request
from pathlib import Path

# Konfiguracja
REPO_OWNER = "TomBelfast"
REPO_NAME = "skills"
BRANCH = "main"

# GitHub API URL do wylistowania folderu 'skills'
API_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/skills?ref={BRANCH}"
RAW_BASE_URL = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/{BRANCH}/skills"

def install_cursor_rules():
    print(f"--- Instalator Skilli (Remote) ---")
    print(f"Zrodlo: GitHub {REPO_OWNER}/{REPO_NAME}")
    
    # Utworz katalog docelowy .cursor/rules w biezacym miejscu
    cwd = Path.cwd()
    rules_dir = cwd / ".cursor" / "rules"
    rules_dir.mkdir(parents=True, exist_ok=True)
    print(f"Cel: {rules_dir}")

    try:
        # 1. Pobierz liste skilli z API
        print(f"Pobieranie listy skilli z: {API_URL}")
        with urllib.request.urlopen(API_URL) as response:
            data = json.loads(response.read().decode())
            
        count = 0
        for item in data:
            if item['type'] == 'dir':
                skill_name = item['name']
                # Ignoruj kropki
                if skill_name.startswith('.'):
                    continue
                
                # Buduj URL do pliku SKILL.md (raw)
                skill_url = f"{RAW_BASE_URL}/{skill_name}/SKILL.md"
                dest_file = rules_dir / f"{skill_name}.mdc"
                
                print(f"Instalowanie: {skill_name} ...", end="")
                
                try:
                    with urllib.request.urlopen(skill_url) as skill_res:
                        content = skill_res.read().decode()
                        
                        # Zapisz jako .mdc
                        with open(dest_file, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(" OK")
                        count += 1
                except urllib.error.HTTPError as e:
                    if e.code == 404:
                        print(" SKILL.md nie znaleziony (pominieto)")
                    else:
                        print(f" Blad: {e}")
                except Exception as e:
                    print(f" Blad: {e}")

        print(f"\nSukces! Zainstalowano {count} regul w {rules_dir}")
        
    except Exception as e:
        print(f"\nBLAD KRYTYCZNY: {e}")
        print("Sprawdz polaczenie internetowe lub limity API GitHub.")

if __name__ == "__main__":
    install_cursor_rules()
