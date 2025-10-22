#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Deployment Script ---"

# --- 1. Update and Install System Dependencies ---
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "Installing Git, Node.js, and npm..."
sudo apt-get install -y git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"


# --- 2. Install PM2 Process Manager ---
echo "Installing PM2 globally..."
sudo npm install -g pm2


# --- 3. User Instructions ---
echo "--- System Setup Complete ---"
echo ""
echo "Next Steps:"
echo "1. Clone your repository:"
echo "   git clone <YOUR_REPOSITORY_URL>"
echo ""
echo "2. Navigate into your project directory:"
echo "   cd <YOUR_PROJECT_DIRECTORY>"
echo ""
echo "3. Create your .env file:"
echo "   cp .env.example .env"
echo "   nano .env  (or your favorite editor to fill in your secrets)"
echo ""
echo "4. Install project dependencies:"
echo "   npm install"
echo ""
echo "5. Start the application with PM2:"
echo "   pm2 start server.js --name 'profile-app'"
echo ""
echo "6. (Optional) Make PM2 start on server reboot:"
echo "   pm2 startup"
echo "   (Follow the on-screen instructions)"
echo ""
echo "7. Check the status of your app:"
echo "   pm2 status"
echo ""
echo "--- Deployment Instructions Complete ---"
