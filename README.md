# Claude Code Skills — Self-Learning Pack

Kolekcja 117 Claude Code skilli z zainstalowaną **pętlą uczenia się** (Pre-Run Checklist + `learnings.md` + Feedback Loop). Każdy skill czyta swoje `learnings.md` przed działaniem i zapisuje korekty użytkownika po wykonaniu — dzięki temu uczy się z Twoich poprawek między sesjami.

## Struktura

| Folder | Zawartość | Źródło |
|---|---|---|
| `personal-skills/` | **85 skilli** osobistych | moje |
| `gstack-skills/` | **32 skille** z projektu gstack (z dodaną pętlą uczenia na wierzchu) | [garrytan/gstack](https://github.com/garrytan/gstack) — **preferuj instalację kanoniczną**, patrz `gstack-skills/README.md` |
| `brand-context/` | Szablony: `voice-profile.md`, `icp.md`, `positioning.md` | uzupełnij u siebie |
| `install.sh` | Skrypt instalacyjny — kopiuje do `~/.claude/skills/` | — |
| `upgrade-skills.sh` | Skrypt do zainstalowania pętli uczenia na istniejących skillach (idempotentny) | — |

## Instalacja na świeżym Claude

```bash
git clone https://github.com/TomBelfast/skills.git /tmp/skills && cd /tmp/skills

# Tylko personalne (rekomendowane)
./install.sh

# Personalne + gstack (gstack najlepiej zainstalować kanonicznie — patrz gstack-skills/README.md)
./install.sh --with-gstack

# Nadpisanie istniejących skilli (uwaga: zamaże lokalne learnings.md)
./install.sh --force

# Suchy bieg (podgląd co się wydarzy)
./install.sh --dry-run
```

Po instalacji uzupełnij `~/.claude/brand-context/*.md` swoim głosem, ICP i pozycjonowaniem — każdy skill produkujący pisany output automatycznie je załaduje.

## Jak działa pętla uczenia się

Każdy `SKILL.md` ma **na samej górze** (zaraz po frontmatter):

```markdown
## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → load it for written outputs
3. Check if ../brand-context/icp.md exists → load it for audience-aware work
```

I **na samym dole**:

```markdown
## Feedback Loop & Self-Improvement
Po wygenerowaniu outputu Claude pyta: "Rate this output 1–5. What should I do differently next time?"
Jeśli dostanie feedback — zapisuje go do ./learnings.md pod "Patterns Observed".
Gdy ten sam typ poprawki pojawi się 2+ razy — promuje się do "Non-Negotiable Rules".
```

Efekt: skill poprawia się z każdym użyciem, bez ręcznego edytowania SKILL.md.

## Aplikacja pętli na własnym zbiorze skilli

Jeśli masz już `~/.claude/skills/` i chcesz dodać pętlę uczenia do istniejących skilli (bez modyfikowania ich zawartości):

```bash
./upgrade-skills.sh
```

Idempotentne: pomija skille, które już mają pętlę. Bezpiecznie uruchamiać wielokrotnie.

## Licencje

- `personal-skills/` — moje, do wolnego użytku.
- `gstack-skills/` — oryginał © garrytan / gstack; tu jest kopia lustrzana z moją personalizacją. Preferuj kanoniczną instalację z repo gstack.
