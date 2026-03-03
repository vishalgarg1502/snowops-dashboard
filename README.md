# ❄️ SnowOps Intelligence Dashboard

> AI-powered fleet intelligence dashboard for municipal public works — built for the **Geotab Vibe Coding Competition 2026**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini_Flash-2.0-blue?logo=google)
![Google Maps](https://img.shields.io/badge/Google_Maps-API-green?logo=googlemaps)
![Geotab](https://img.shields.io/badge/Geotab-API-orange)

## 🎯 Overview

SnowOps Intelligence is a standalone web dashboard that gives a municipal public works fleet manager in **Oakville, Ontario** a real-time, AI-powered view of 50 vans and trucks.

### Features

| Feature | Description |
|---------|-------------|
| **🗺️ Live Map** | Google Maps showing all 20 vehicles with current positions and today's GPS breadcrumb trails (routes) |
| **🏆 Fleet Scoreboard** | Table ranking vehicles by fuel efficiency, idle time, and safety score |
| **✨ Ask Your Fleet** | Gemini-powered chat where managers ask questions like *"Which truck has the worst fuel efficiency?"* |
| **🚨 Alert Panel** | Top 5 active engine fault codes / diagnostic warnings |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS 4
- **Data**: Geotab MyGeotab API + OData Data Connector
- **AI Chat**: Google Gemini 2.0 Flash
- **Maps**: Google Maps JavaScript API via `@vis.gl/react-google-maps`
- **Demo DB**: `demo_vans_and_trucks_50_vehicles` (50 simulated vehicles)

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/vishalgarg1502/snowops-dashboard.git
cd snowops-dashboard

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Fill in your Geotab credentials, Gemini API key, and Google Maps key

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The first load may take 5-10 seconds as the Geotab API fetches data for all vehicles. Subsequent refreshes are faster due to credential caching.

## 🔑 Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `GEOTAB_DATABASE` | Demo database name | Pre-filled: `demo_vans_and_trucks_20_vehicles` |
| `GEOTAB_USERNAME` | Your MyGeotab email | [my.geotab.com/registration](https://my.geotab.com/registration.html) |
| `GEOTAB_PASSWORD` | Your MyGeotab password | Same as above |
| `GEOTAB_SERVER` | API server | `my.geotab.com` |
| `GEMINI_API_KEY` | Gemini API key | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JS API key | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) |

## 📁 Project Structure

```
snowops-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── fleet/route.ts    # Fleet data API (Geotab)
│   │   │   └── chat/route.ts     # Gemini AI chat endpoint
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── globals.css           # Dark theme styles
│   ├── components/
│   │   ├── LiveMap.tsx           # Google Maps with markers + routes
│   │   ├── Scoreboard.tsx        # Fuel efficiency ranking table
│   │   ├── AlertPanel.tsx        # Fault code alerts
│   │   └── AskFleetChat.tsx      # Gemini AI chat interface
│   └── lib/
│       ├── geotab.ts             # Geotab API + OData helpers
│       └── gemini.ts             # Gemini API wrapper
├── .env.example
└── package.json
```

## 📄 License

Built for the Geotab Vibe Coding Competition 2026.
