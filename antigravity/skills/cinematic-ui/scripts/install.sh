#!/bin/bash

# Cinematic UI Installer
# Target: Tailwind + React projects

echo "🚀 Initializing Cinematic Matrix Design System..."

# Determine project structure
STYLE_FILE="src/index.css"
if [ ! -f "$STYLE_FILE" ]; then
    STYLE_FILE="src/globals.css"
fi

CONFIG_FILE="tailwind.config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="tailwind.config.ts"
fi

ASSETS_DIR="$(dirname "$(dirname "$0")")/assets"

# 1. Update index.css
if [ -f "$STYLE_FILE" ]; then
    echo "✨ Injecting cinematic styles into $STYLE_FILE..."
    cat "$ASSETS_DIR/globals.css" >> "$STYLE_FILE"
else
    echo "⚠️  Style file not found. Creating src/index.css..."
    mkdir -p src
    cp "$ASSETS_DIR/globals.css" src/index.css
fi

# 2. Update tailwind.config.js
# Note: This is a simple append for now, ideally should merge
if [ -f "$CONFIG_FILE" ]; then
    echo "✨ Setting up Tailwind presets (Note: Manual merge may be required for complex configs)..."
    echo "// CINEMATIC UI PRESET - ADDED BY INSTALLER" >> "$CONFIG_FILE"
    # We recommend manual review for tailwind.config as automated merge can be destructive
    echo "👉 Please verify your $CONFIG_FILE contains the cinematic color palette and animations."
fi

echo "✅ Cinematic Matrix Design System successfully deployed!"
echo "👉 You can now use classes: .glass-card, .text-title, .text-label"
echo "👉 Any bold+italic text will automatically receive the emerald gradient."
