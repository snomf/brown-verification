# 🐻 Bruno Verifies Hosting Cheat-Sheet

Here's how everything is set up and why!

## 1. The Website (Vercel)
- **Host**: [Vercel](https://vercel.com)
- **What it does**: This is the "front door" where people go to verify their email.
- **How it updates**: When you push code to GitHub, Vercel sees it and updates automatically.

## 2. The Discord Bot (Oracle Cloud)
- **Host**: [Oracle Always Free Server](https://cloud.oracle.com)
- **What it does**: This is the "brain" that stays online 24/7 to handle Discord commands (`/verify`, `/confirm`).
- **How it runs**: It runs inside something called **Docker**, which keeps it separate from your other apps (Neko, Audiobookshelf).

## 3. The "Auto-Update" Magic
- **GitHub Actions**: When you push code, GitHub builds a "package" (a Docker image) of your bot.
- **Watchtower**: Every 30 seconds, a tiny program on your Oracle server (called Watchtower) checks if a new package exists. If it does, it updates the bot for you!

## 4. Where to find things on your Server
If you ever need to fix something via SSH:
- **Location**: `~/bruno-bot/`
- **File**: `docker-compose.yml` (rules for running the bot)
- **File**: `.env` (your secret keys)

## 5. Important Commands (Run on Server)
- **Check if bot is running**: `docker ps`
- **Restart everything**: `docker compose restart`
- **Stop everything**: `docker compose down`
- **Start everything**: `docker compose up -d`
