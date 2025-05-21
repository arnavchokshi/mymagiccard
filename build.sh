#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Clean install dependencies
rm -rf node_modules
npm ci

# Create production build
CI=false npm run build

# Install serve globally
npm install -g serve 