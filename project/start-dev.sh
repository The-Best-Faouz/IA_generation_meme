#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/klip-backend"
FRONTEND_DIR="$SCRIPT_DIR/klip-frontend"

echo "=== Demarrage de KLIP en local ==="
echo ""

# 1. Build backend
echo "[1/4] Compilation du backend..."
cd "$BACKEND_DIR"
npm run build 2>/dev/null || echo "  -> Deja compile ou erreur ignoree"

# 2. Start backend
echo "[2/4] Demarrage du backend..."
node dist/index.js > /tmp/klip-backend.log 2>&1 &
BACKEND_PID=$!
echo "  -> Backend demarre (PID: $BACKEND_PID)"

# 3. Start Metro
echo "[3/4] Demarrage de Metro bundler..."
cd "$FRONTEND_DIR"
npx react-native start > /tmp/klip-metro.log 2>&1 &
METRO_PID=$!
echo "  -> Metro demarre (PID: $METRO_PID)"

# 4. ADB reverse
echo "[4/4] Configuration ADB reverse..."
sleep 4
adb reverse tcp:3000 tcp:3000 2>/dev/null && echo "  -> Port 3000 forwarde" || echo "  -> Aucun appareil ADB detecte"
adb reverse tcp:8081 tcp:8081 2>/dev/null && echo "  -> Port 8081 forwarde" || echo "  -> Aucun appareil ADB detecte"

echo ""
echo "=== Tout est pret ! ==="
echo "Backend: http://localhost:3000/health"
echo "Metro:   http://localhost:8081"
echo ""
echo "Logs:"
echo "  tail -f /tmp/klip-backend.log"
echo "  tail -f /tmp/klip-metro.log"
echo ""
echo "Pour arreter:"
echo "  kill $BACKEND_PID $METRO_PID"
