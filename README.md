# CHỐT! — Viral mini-game MVP

**CHỐT!** is a mobile-first Vietnamese viral playground built around three loops:

- **Community Vote** — choose first, reveal the crowd result after voting.
- **Gacha / Randomizer** — fast, visual random results made to screenshot and share.
- **Group Room** — generate a room code and invite friends to join a private reveal flow.

## Stack

- Next.js 16.3.4
- React 19.3
- TypeScript
- Plain CSS (no UI framework required)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## MVP data note

The current vote counts are **explicit demo seed data** so the product can be reviewed before a database is connected. The UI labels them as demo data and does not pretend they are real-time users.

Group Room currently generates and shares room links on the client. The next production step is to connect a realtime backend (for example Supabase/Postgres + Realtime or Redis) for cross-device room membership, votes, and live counters.

## Product direction

The intended loop is:

1. Player chooses before seeing crowd results.
2. Reveal makes the player feel either validated or unusually different.
3. Share copy is generated immediately.
4. A friend opens the link and repeats the loop.

This repo is intentionally structured as a small MVP so the data layer can be swapped without redesigning the UI.
