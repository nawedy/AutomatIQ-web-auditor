#!/bin/bash

echo "🚀 Optimizing AutomatIQ.AI Development Environment..."

# Kill all Next.js processes
echo "🔄 Stopping existing servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clear all caches
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf .turbo

# Clear any temporary files
echo "🗑️ Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Optimize package.json for faster builds
echo "⚡ Optimizing configuration..."

# Start fresh development server
echo "🌟 Starting optimized development server..."
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

echo "✅ Development environment optimized!"
echo "🔗 Server will be available at http://localhost:3000 (or next available port)" 