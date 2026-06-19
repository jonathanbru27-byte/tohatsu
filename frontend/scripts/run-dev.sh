#!/bin/bash
# Supervisor command is read-only and runs `yarn expo start --port 3000`.
# This wrapper translates that into a Next.js dev server.
set -e
exec node ./node_modules/next/dist/bin/next dev --port 3000 --hostname 0.0.0.0
