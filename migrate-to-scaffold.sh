#!/bin/bash

# NOMA → Scaffold-ETH 2 Migration Script
# Run this after creating your Scaffold-ETH 2 frontend

echo "🏗️  NOMA to Scaffold-ETH 2 Migration"
echo "═══════════════════════════════════════"

FRONTEND_DIR="frontend"

# Check if frontend exists
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Frontend directory not found!"
  echo "Please run: npx create-eth@latest frontend"
  exit 1
fi

echo "✅ Frontend directory found"

# 1. Copy contracts
echo ""
echo "📦 Step 1: Copying contracts..."
rm -rf $FRONTEND_DIR/packages/hardhat/contracts/*
cp -r contracts/src/* $FRONTEND_DIR/packages/hardhat/contracts/
echo "✅ Contracts copied"y

# 2. Copy deployment info
echo ""
echo "📝 Step 2: Setting up deployments..."
mkdir -p $FRONTEND_DIR/packages/hardhat/deployments/sepolia
cp contracts/deployments/localhost.json $FRONTEND_DIR/packages/hardhat/deployments/sepolia/ 2>/dev/null || true
echo "✅ Deployment files ready"

# 3. Copy env
echo ""
echo "🔐 Step 3: Copying environment..."
if [ -f "contracts/.env" ]; then
  cp contracts/.env $FRONTEND_DIR/packages/hardhat/.env
  echo "✅ Environment copied"
else
  echo "⚠️  No .env file found"
fi

# 4. Copy package dependencies
echo ""
echo "📦 Step 4: Setting up dependencies..."
cd $FRONTEND_DIR/packages/hardhat
yarn add dotenv
cd ../../..
echo "✅ Dependencies installed"

echo ""
echo "🎉 Migration Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. cd frontend"
echo "2. Generate deployment JSONs: yarn hardhat run scripts/generate-deployments.js"
echo "3. Start the app: yarn start"
echo ""
