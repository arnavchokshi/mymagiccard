#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Current directory:"
pwd

echo "Installing backend dependencies..."
cd src
npm install

echo "Backend dependencies installed successfully!"
echo "Contents of src directory:"
ls -la

echo "Node.js version:"
node --version

echo "NPM version:"
npm --version 