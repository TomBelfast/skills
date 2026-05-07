# Antigravity Skills Hub

Kolekcja globalnych umiejętności i workflowów dla systemu Antigravity.

## Samouczenie skilli

Repo ma teraz prosty loop uczenia dla authoringu skilli:

```bash
python skill_learning.py init
python skill_learning.py record --pattern description-triggers --skills skill-creator writing-skills --source test --rule "Keep descriptions focused on triggers, not workflow." --summary "Description summarized workflow instead of the trigger."
python skill_learning.py promote
python skill_learning.py status
```

Zasady i obserwacje są trzymane w `learnings.md`. Powtarzające się korekty mogą być automatycznie promowane do sekcji `Non-Negotiable Rules`, żeby kolejne iteracje skilli dziedziczyły te same wnioski.

## Paid AI niche discovery

Repo zawiera zestaw skilli do szukania nisz AI, w których ludzie już płacą albo mają mocny powód biznesowy, żeby zapłacić:

- `paid-ai-niche-discovery`
- `paid-intent-research`
- `keyword-demand-research`
- `community-pain-mining`
- `competitor-offer-analysis`
- `poland-market-adaptation`
- `ai-solution-blueprint`

Każdy research ma kończyć się decyzją `build`, `test`, `watch` albo `reject`. Najwyżej ważony sygnał to dowód płatności, nie sam wolumen wyszukiwań.

Pierwsza runda zaadaptowanych zewnętrznych skilli marketingowych:

- `social-search-demand-audit`
- `youtube-growth-system`
- `content-repurposing-system`
- `email-nurture-system`
- `community-growth-system`
- `offer-pricing-funnel`

Źródła są pobierane do `.skill-lab/sources/`, a decyzje są zapisywane w `sources/index.json` oraz `audits/sources/`.

## Curator skilli

Lokalny curator jest inspirowany wzorcem z `NousResearch/hermes-agent`: status, dry-run report, pinning, usage sidecar i recoverable archive zamiast usuwania.

```bash
python tools/skill_curator.py status
python tools/skill_curator.py run
python tools/skill_curator.py pin paid-ai-niche-discovery
```

Raporty i stan lokalny są trzymane w `.skill-lab/curator/`.

## Jak zainstalować?

Użyj umiejętności `skill-installer` w swojej sesji Antigravity:

```
/sc:skill-installer --url https://github.com/TomBelfast/skills/tree/main/skills/<nazwa-skilla>
```

## Zawartość

### Skills
- **analyze** – Zaawansowana analiza kodu.
- **brainstorm** – Wsparcie w kreatywnym planowaniu.
- **python-expert** – Najlepsze praktyki Python & Pydantic.
- **langchain-orchestrator** – Budowanie systemów AI.
- ... i wiele innych.

### Global Workflows
- Komendy `/sc:*` dla automatyzacji najczęstszych zadań.
