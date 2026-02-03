#!/bin/bash
# Start Chat Animator Remotion server

cd "$(dirname "$0")/.."

# Kill any existing instance
pkill -f "remotion studio --port 4200" 2>/dev/null

# Start the server
npm start
