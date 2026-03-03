# Geotab Vibe Coding Competition 2026 — Submission

## Entry: SnowOps Intelligence Dashboard

**Participant:** Vishal Garg  
**GitHub:** https://github.com/vishalgarg1502/snowops-dashboard  
**Demo Database:** `demo_vans_and_trucks_50_vehicles`  
**Category:** Standalone Web Application  

---

## 🎯 Problem Statement

Municipal public works fleet managers in Oakville, Ontario need a unified view of their 50-vehicle snow operations fleet. Existing tools require switching between multiple screens for maps, reports, diagnostics, and analysis. SnowOps Intelligence consolidates everything into a single dashboard with AI-powered natural-language querying.

## 🏗️ What I Built

A **standalone Next.js dashboard** with four core panels (initial data load takes 5-10 seconds):

1. **Live Fleet Map** — Google Maps displaying all 50 vehicles' real-time GPS positions with color-coded route trails (polylines) of today's driving paths.
2. **Fleet Efficiency Scoreboard** — Vehicles ranked by fuel efficiency (km/L), idle time, and computed safety score using real Geotab trip data.
3. **Ask Your Fleet (Gemini Chat)** — Natural language chat where the fleet manager can ask questions like *"Which truck has the worst fuel efficiency today?"* — powered by Gemini 2.0 Flash with the day's fleet data injected as context.
4. **Alert Panel** — Top 5 active diagnostic fault codes surfaced from the Geotab FaultData API.

## 🔧 Vibe Coding Process

This project was built entirely using **vibe coding** with an AI-powered IDE:

### Step 1: Research & Context Loading
- Cloned the `geotab-vibe-guide` repo and read all guides (ANTIGRAVITY_QUICKSTART, DATA_CONNECTOR, GOOGLE_TOOLS_GUIDE, AGENTIC_OVERVIEW)
- Asked the AI to summarize available tools, APIs, and the demo database structure

### Step 2: Project Definition
- Defined the total scope: 4 features, tech stack, and target competition prizes
- AI confirmed understanding and asked clarifying questions

### Step 3: Scaffolding
- AI scaffolded the full Next.js project with:
  - `lib/geotab.ts` — Geotab API auth, SDK calls, and OData Data Connector helpers
  - `lib/gemini.ts` — Gemini Flash initialization with fleet context system prompt
  - 4 React components: LiveMap, Scoreboard, AlertPanel, AskFleetChat
  - 2 API routes: `/api/fleet` (Geotab data), `/api/chat` (Gemini proxy)
  - Main dashboard page assembling all panels

### Step 4: Real Data Wiring
- Connected to `demo_vans_and_trucks_20_vehicles` via Geotab MyGeotab API
- Fetched DeviceStatusInfo (live locations), LogRecords (GPS trails), Trips (scoreboard), FaultData (alerts)
- Injected real fleet summary into Gemini system prompt for context-aware Q&A

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | **Next.js 16** (App Router) | Server-side rendering, API routes |
| Styling | **Tailwind CSS 4** | Responsive dark-theme dashboard |
| Maps | **Google Maps JS API** | Live vehicle markers + route polylines |
| Fleet Data | **Geotab MyGeotab API** | Real-time vehicle positions, trips, faults |
| Fleet Analytics | **Geotab Data Connector (OData)** | Pre-aggregated daily KPIs |
| AI Chat | **Google Gemini 2.0 Flash** | Natural language fleet Q&A |
| Icons | **Lucide React** | UI iconography |

## 🏆 Prizes Targeted

| Prize | Amount | Justification |
|-------|--------|---------------|
| **Vibe Master** | $10,000 | End-to-end standalone app built with vibe coding |
| **Green Award** | $2,500 | Fuel efficiency ranking + idle time optimization focus |
| **Best Use of Google Tools** | $2,500 | Gemini Flash + Google Maps + Next.js |

## 📊 Data Sources Used

### MyGeotab API (JSON-RPC)
- `DeviceStatusInfo` — Live GPS positions, speed, driving state
- `LogRecord` — Today's GPS breadcrumb trails for route visualization
- `Trip` — Distance, idle time, driving duration for scoreboard
- `FaultData` — Active engine fault codes for alert panel
- `Device` — Vehicle metadata

### Geotab Data Connector (OData)
- `VehicleKpi_Daily` — Pre-aggregated fuel, distance, idle time KPIs
- `LatestVehicleMetadata` — Vehicle make/model/health for enrichment

## 🎥 Demo Script (for Video)

1. **Open** the dashboard — show the dark-themed layout with 4 metric cards
2. **Pan** the Google Maps view — point out vehicle markers and colored route trails
3. **Scroll** to the scoreboard — show the "worst fuel offenders" prominently ranked
4. **Type** a question in the Gemini chat: *"Which vehicles have been idle over 30 minutes today?"*
5. **Show** the AI response using real fleet data
6. **Point** to the alert panel showing any active fault codes
7. **Click** Refresh to demonstrate automatic data polling

## 📝 Setup Instructions

```bash
git clone https://github.com/vishalgarg1502/snowops-dashboard.git
cd snowops-dashboard
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

Then open http://localhost:3000.
