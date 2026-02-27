#!/bin/bash
# GCC Auto-Init & Context Loader
# Uruchamiany automatycznie przy starcie sesji Claude w tym projekcie

GCC_DIR=".GCC"
SKILL_INIT="C:/Users/Tomasz/.claude/skills/gcc/scripts/gcc_init.sh"

# === INICJALIZACJA (jeśli .GCC nie istnieje) ===
if [ ! -d "$GCC_DIR" ]; then
  bash "$SKILL_INIT" 2>/dev/null
  echo "=== GCC: Zainicjalizowano nowy projekt ==="
fi

# === WCZYTANIE KONTEKSTU ===
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         GCC CONTEXT - UGREEN NAS         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Roadmapa i cele
if [ -f "$GCC_DIR/main.md" ]; then
  echo "--- ROADMAPA ---"
  cat "$GCC_DIR/main.md"
  echo ""
fi

# Ostatnie 5 commitów
if [ -f "$GCC_DIR/commit.md" ]; then
  echo "--- OSTATNIE COMMITY ---"
  tail -40 "$GCC_DIR/commit.md"
  echo ""
fi

# Aktywne gałęzie
if [ -f "$GCC_DIR/metadata.yaml" ]; then
  echo "--- STAN PROJEKTU ---"
  cat "$GCC_DIR/metadata.yaml"
  echo ""
fi

echo "=== GCC gotowy. Użyj /gcc commit, /gcc branch, /gcc context ==="
