#!/bin/bash

# Clean everything
echo "🧹 Cleaning dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Install with optional dependencies (needed for Rollup)
echo "📦 Installing dependencies..."
npm install --include=optional --no-fund --no-audit

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
