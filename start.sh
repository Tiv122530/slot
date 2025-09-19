#!/bin/bash

# Slot Game Project Startup Script

echo "🚀 Starting Slot Game Project..."
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""
echo "🌐 Starting servers..."
echo "   - Backend server (Express + SQLite)"
echo "   - Frontend server (Vite + React)"
echo ""

# Start both servers concurrently
npm start