# Profile Card Generator

This is a web application that allows users to create and share personal profile cards. Users can log in with their Google account, customize their profile with a username, description, links, and profile picture, and choose from various visual templates.

## Features

- **Google Authentication:** Secure login using Google OAuth 2.0.
- **Profile Management:** Users can create and update their public profile through a personal dashboard.
- **Photo Uploads:** Users can upload a custom profile picture.
- **Template System:** Choose from multiple visual templates to customize the look and feel of your profile.
- **Daily Horoscope:** Automatically displays a daily horoscope based on the user's zodiac sign.
- **Downloadable Profiles:** Download your profile as a self-contained HTML file.

---

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <PROJECT_DIRECTORY>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and fill in your details, especially your Google Client ID and Secret. You can get these from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

4.  **Run the application:**
    ```bash
    node server.js
    ```
    The application will be running at `http://localhost:3000`.

---

## Deployment to a VPS (Ubuntu/Debian)

These instructions guide you through deploying the application to a fresh Virtual Private Server.

### Step 1: Prepare Your VPS

1.  **Get a VPS:** Obtain a VPS from a provider of your choice (e.g., DigitalOcean, Linode, Vultr). Ensure it is running a recent version of Ubuntu or Debian.
2.  **SSH into your server:**
    ```bash
    ssh root@<YOUR_SERVER_IP>
    ```

### Step 2: Run the Automated Deployment Script

1.  **Download the deployment script:**
    ```bash
    curl -O <RAW_URL_TO_YOUR_deploy.sh>
    ```
    *(Note: You will need to replace `<RAW_URL_TO_YOUR_deploy.sh>` with the actual URL from your Git provider after you push this repository.)*

2.  **Run the script:**
    ```bash
    bash deploy.sh
    ```
    This script will update your server and install all necessary system dependencies, including Node.js, npm, and the `pm2` process manager.

### Step 3: Deploy Your Application

After the script finishes, follow the "Next Steps" printed in your terminal. These are the manual steps to get your application code running:

1.  **Clone your repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    ```

2.  **Navigate into your project directory:**
    ```bash
    cd <YOUR_PROJECT_DIRECTORY>
    ```

3.  **Create and configure your `.env` file:**
    ```bash
    cp .env.example .env
    nano .env
    ```
    Fill in your production Google credentials and a strong `SESSION_SECRET`.

4.  **Install project dependencies:**
    ```bash
    npm install
    ```

5.  **Start the application with `pm2`:**
    ```bash
    pm2 start server.js --name "profile-app"
    ```
    `pm2` will now manage your application, keeping it running in the background and restarting it if it crashes.

### Step 4: Keep Your App Running

-   **Check status:** `pm2 status`
-   **View logs:** `pm2 logs profile-app`
-   **To make your app start automatically on server reboot, run:**
    ```bash
    pm2 startup
    ```
    (Follow the on-screen instructions it provides).

Your application is now deployed and live!
