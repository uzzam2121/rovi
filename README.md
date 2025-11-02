# Rovi – AI Personal Assistant Dashboard

A beautiful, intelligent AI assistant dashboard powered by Gemini API, built with React, Tailwind CSS, and Framer Motion.

## Features

- 🌤️ **Weather Widget** - Real-time weather updates via Open-Meteo API (free, no API key required)
- 🗓️ **Daily Summary** - AI-generated daily summaries
- 📅 **Meeting Scheduler** - Track your upcoming meetings
- 💰 **Expense Tracker** - Visual expense tracking with charts
- 📈 **Habit Tracker** - Monitor your daily habits
- 💡 **Motivational Quotes** - Daily inspiration
- 🏙️ **Price Comparison** - Compare prices for essential items
- 💬 **AI Chat** - Chat with Rovi powered by Gemini

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add your Gemini API key (weather uses Open-Meteo - no key needed):
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

## Deployment

The app is optimized for Vercel deployment. Simply:

1. Push your code to GitHub
2. Import the project to Vercel
3. Add `VITE_GEMINI_API_KEY` as an environment variable in Vercel (weather uses Open-Meteo - no key needed)
4. Deploy!

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Gemini API
- Open-Meteo API (free, no API key required)
