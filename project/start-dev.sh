#!/bin/bash
# Start backend
cd /home/karma/ICT4D/IA_generation_meme/project/klip-backend
node dist/index.js > /tmp/klip-backend.log 2>&1 &
echo "Backend started (PID: $!)"

# Start Metro
cd /home/karma/ICT4D/IA_generation_meme/project/klip-frontend
npx react-native start > /tmp/klip-metro.log 2>&1 &
echo "Metro started (PID: $!)"

# ADB reverse
sleep 3
adb reverse tcp:3000 tcp:3000 2>/dev/null
adb reverse tcp:8081 tcp:8081 2>/dev/null
echo "ADB reverse configured"
echo ""
echo "All services started!"
echo "Check logs: tail -f /tmp/klip-backend.log /tmp/klip-metro.log"
