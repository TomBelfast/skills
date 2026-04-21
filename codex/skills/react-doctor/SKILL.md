---
name: react-doctor
description: React codebase health diagnostics using react-doctor CLI — wykrywa problemy z hooks, state, komponentami i dostępnością
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:react-doctor - React Codebase Health Check

## Triggers
- "sprawdź jakość kodu React"
- "uruchom react-doctor"
- "zdiagnozuj problemy React"
- "react health check"
- "co jest nie tak z komponentami"

## Tool Location
```
/opt/react-doctor/packages/react-doctor/dist/cli.js
```
**Wersja:** react-doctor v0.0.29
**Docs:** https://github.com/millionco/react-doctor

---

## Usage

### Podstawowe uruchomienie (SocialMedia frontend)
```bash
CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --verbose
```

### Opcje CLI
| Flaga | Opis |
|-------|------|
| `--yes` / `-y` | Pomiń prompty, skanuj wszystkie workspace projects |
| `--verbose` | Pokaż szczegóły plików per reguła |
| `--lint` / `--no-lint` | Włącz/wyłącz linting |
| `--dead-code` / `--no-dead-code` | Włącz/wyłącz detekcję martwego kodu |
| `--diff [base]` | Skanuj tylko zmienione pliki vs base branch |
| `--offline` | Pomiń telemetrię (tylko lokalne) |
| `--fail-on <level>` | Exit code na diagnostykach: `error`, `warning`, `none` |
| `--score` | Wyświetl tylko score |

### Przykłady
```bash
# Pełny skan z detalami
CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --verbose

# Tylko zmienione pliki (CI/PR workflow)
CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --diff main

# Bez lintowania (szybszy)
CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --no-lint --verbose

# Z detekcją martwego kodu
CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --dead-code --verbose
```

---

## Co wykrywa

### Kategorie diagnostyczne

#### State & Effects (react-doctor)
- **prefer-useReducer** — komponent ma ≥6 `useState` → sugeruje `useReducer`
- **no-effect-event-handler** — `useEffect` symuluje event handler zamiast użyć `onClick`/`onChange`

#### Architecture (react-doctor)
- **no-giant-component** — komponent >500 linii → sugeruje podział na mniejsze

#### Accessibility (jsx-a11y)
- **click-events-have-key-events** — brak keyboard listener dla clickable elementów
- **label-has-associated-control** — `<label>` bez `htmlFor` lub wrappowanego inputa
- **no-static-element-interactions** — statyczny element HTML z event handlerem bez `role`
- **no-autofocus** — użycie `autoFocus` (problemy UX)

---

## Output

### Wynik w terminalu
```
⚠ 14 warnings  across 3/6 files  in 1.3s
```

### Plik z pełnymi diagnostykami
React-doctor zapisuje wyniki do `/tmp/react-doctor-<uuid>/`:
```
/tmp/react-doctor-<uuid>/
├── diagnostics.json          # Pełny JSON z wszystkimi problemami
├── jsx-a11y--*.txt           # Szczegóły reguł accessibility
└── react-doctor--*.txt       # Szczegóły reguł react-doctor
```

### Format diagnostics.json
```json
[
  {
    "filePath": "src/components/...",
    "plugin": "react-doctor",
    "rule": "no-giant-component",
    "severity": "warning",
    "message": "Component \"X\" is 559 lines",
    "help": "Extract logical sections...",
    "line": 91,
    "column": 17,
    "category": "Architecture"
  }
]
```

---

## Workflow po uruchomieniu

1. **Uruchom diagnostykę:**
   ```bash
   CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --verbose
   ```

2. **Odczytaj pełne wyniki:**
   ```bash
   cat /tmp/react-doctor-<uuid>/diagnostics.json | python3 -m json.tool
   ```
   Lub znajdź najnowszy:
   ```bash
   ls -t /tmp/ | grep react-doctor | head -1
   ```

3. **Przeanalizuj i napraw** — dla każdego pliku z ostrzeżeniami:
   - Przeczytaj plik (`Read` tool)
   - Zastosuj fix zgodnie z `help` message
   - Zweryfikuj ponownym skanem

4. **Weryfikacja po fixach:**
   ```bash
   CI=true node /opt/react-doctor/packages/react-doctor/dist/cli.js /opt/SocialMedia/frontend --yes --diff main
   ```

---

## Typowe fixy

### prefer-useReducer (6+ useState)
```tsx
// PRZED: 6 osobnych useState
const [isOpen, setIsOpen] = useState(false)
const [content, setContent] = useState('')
const [lang, setLang] = useState('PL')
const [mode, setMode] = useState('visual')
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

// PO: useReducer
const [state, dispatch] = useReducer(reducer, {
  isOpen: false, content: '', lang: 'PL',
  mode: 'visual', loading: false, error: null
})
```

### no-effect-event-handler (useEffect jako handler)
```tsx
// PRZED: useEffect reaguje na zmianę stanu jak event handler
useEffect(() => {
  if (triggerSave) { saveContent(); setTriggerSave(false) }
}, [triggerSave])

// PO: logika bezpośrednio w handlerze
const handleSave = () => { saveContent() }
```

### no-giant-component (>500 linii)
Wyodrębnij sekcje do osobnych komponentów:
```tsx
// PRZED: jeden giant component 559 linii
export function Phase02_Content() { /* 559 linii */ }

// PO: podział na komponenty
import { ContentEditor } from './ContentEditor'
import { ContentActions } from './ContentActions'
export function Phase02_Content() {
  return <><ContentEditor /><ContentActions /></>
}
```

### click-events-have-key-events
```tsx
// PRZED: div z onClick bez keyboard listener
<div onClick={handleClick}>Kliknij</div>

// PO: dodaj onKeyDown lub użyj button
<div onClick={handleClick} onKeyDown={(e) => e.key === 'Enter' && handleClick()} role="button" tabIndex={0}>
  Kliknij
</div>
// LUB lepiej:
<button onClick={handleClick}>Kliknij</button>
```

### label-has-associated-control
```tsx
// PRZED: label bez htmlFor
<label>Nazwa</label><input id="name" />

// PO: z htmlFor
<label htmlFor="name">Nazwa</label><input id="name" />
```

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
