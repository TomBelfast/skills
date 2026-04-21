# Multi-Tool Skills Pack

Repo z podziałem skilli per narzędzie. Każdy tool pobiera tylko swój pack, w swojej strukturze i do swojej ścieżki instalacji.

## Struktura repo

| Folder | Przeznaczenie |
|---|---|
| `sources/personal-skills/` | wspólne źródło moich skilli |
| `sources/gstack-skills/` | wspólne źródło lustrzanego packa gstack |
| `claude/skills/` | pack dla Claude Code |
| `claude/gstack-skills/` | pack gstack dla Claude Code |
| `cursor/skills/` | pack dla Cursora |
| `cursor/gstack-skills/` | pack gstack dla Cursora |
| `codex/skills/` | pack dla Codexa |
| `gemini/skills/` | pack dla Gemini CLI |
| `antigravity/skills/` | pack dla Antigravity |
| `brand-context/` | wspólne szablony `voice-profile.md`, `icp.md`, `positioning.md` |
| `scripts/build_tool_packs.py` | generator packów per-tool ze źródeł |

## Ścieżki instalacji

| Tool | Domyślny target | Pack w repo |
|---|---|---|
| Claude Code | `~/.claude/skills` | `claude/skills` |
| Cursor | `~/.cursor/skills` | `cursor/skills` |
| Codex | `~/.codex/skills` | `codex/skills` |
| Gemini CLI | `~/.gemini/skills` | `gemini/skills` |
| Antigravity | `~/.gemini/antigravity/skills` lub `~/.gemini/antigravity/global_skills` | `antigravity/skills` |

`brand-context` trafia zawsze katalog wyżej niż `skills`, np.:
- Claude: `~/.claude/brand-context`
- Cursor: `~/.cursor/brand-context`
- Codex: `~/.codex/brand-context`
- Gemini: `~/.gemini/brand-context`
- Antigravity: `~/.gemini/antigravity/brand-context`

## Co różni packi

- `Claude`: zachowuje obecny format i metadata z oryginalnych skilli.
- `Cursor`: używa runtime `SKILL.md` zgodnego z lokalnym systemem skills w `~/.cursor/skills`.
- `Codex`: frontmatter jest znormalizowany pod lepszy discovery w Codexie: `name` + jednowierszowy `description` od pierwszej linii.
- `Gemini`: ten sam znormalizowany wariant co dla Codexa.
- `Antigravity`: ten sam znormalizowany frontmatter co dla Codexa/Gemini, plus referencje są przepięte pod `resources/`, zgodnie z wymaganym układem `SKILL.md` / `scripts` / `examples` / `resources`.
- `gstack`: lustro występuje tylko dla `Claude` i `Cursor`, bo tam mamy potwierdzony runtime oraz ścieżki.

## Szybka synchronizacja

```bash
# Claude Code
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh)

# Codex
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool codex

# Cursor
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool cursor

# Gemini CLI
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool gemini

# Antigravity
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool antigravity
```

Flagi:

```bash
# pomiń mirror gstack (dotyczy tylko Claude/Cursor)
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool cursor --no-gstack

# podgląd bez zmian
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool codex --dry-run

# własny target
bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool gemini --target /some/path
```

`sync.sh` robi:
- `git clone --depth=1` do katalogu tymczasowego,
- wybiera właściwy pack per `--tool`,
- force-update istniejących skilli z pominięciem `learnings.md`,
- bootstrapuje brakujące `learnings.md`,
- dodaje brakujące skille,
- dodaje brakujące pliki z `brand-context/`,
- dla `Antigravity` wybiera automatycznie `global_skills`, jeśli taki katalog już istnieje.

## Instalacja z lokalnego klonu

```bash
git clone https://github.com/TomBelfast/skills.git /tmp/skills
cd /tmp/skills

./install.sh
./install.sh --tool codex
./install.sh --tool cursor
./install.sh --tool gemini
./install.sh --tool antigravity
```

Flagi:

```bash
# dołącz gstack tam, gdzie istnieje
./install.sh --tool claude --with-gstack
./install.sh --tool cursor --with-gstack

# odśwież istniejące skille z repo, ale zachowaj learnings.md
./install.sh --tool codex --force

# podgląd
./install.sh --tool gemini --dry-run
```

## Regeneracja packów

Edytujesz tylko źródła:
- `sources/personal-skills`
- `sources/gstack-skills`

Po zmianach odpal:

```bash
./scripts/build_tool_packs.py
```

Generator:
- buduje packi `claude/cursor/codex/gemini/antigravity`,
- normalizuje frontmatter dla `Codex/Gemini/Cursor/Antigravity`,
- robi rewrite ścieżek gstack dla `Cursor`,
- przepina `references/` na `resources/` w packu `Antigravity`.

## Remote installer

Możesz też instalować bez klonowania repo:

```bash
python3 install_remote.py --tool codex
python3 install_remote.py --tool cursor --with-gstack
python3 install_remote.py --tool antigravity
```

## Uwagi

- `upgrade-skills.sh` zostaje jako pomocniczy skrypt legacy dla istniejących lokalnych skilli Claude.
- Jeśli aktualizujesz źródła, nie edytuj ręcznie wygenerowanych packów per-tool; uruchom generator.
- Jeśli `Codex` nadal nie widzi części skilli po syncu, restart sesji jest nadal wymagany po stronie loadera narzędzia.
