# Smart Drain System 💧

Real-time IoT drainage infrastructure monitoring platform.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Database & Realtime**: Supabase (PostgreSQL + WebSockets)
- **Maps**: React-Leaflet
- **Charts**: Recharts
- **Routing**: React Router DOM

## Project Structure
```
smart-drain/
├── apps/
│   └── web/          ← React dashboard (start here)
├── services/         ← Spring Boot microservices (future)
└── database/         ← SQL migrations
```

## Getting Started
```bash
cd apps/web
cp .env.example .env.local    # fill in your Supabase credentials
npm install
npm run dev                    # http://localhost:5173
```
