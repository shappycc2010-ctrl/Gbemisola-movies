# Gbemisola Movies — Local Full-Stack

Quick start:
1. Copy your logo to client/logo.png and server/logo.png
2. Install deps:
   npm install
   npm run install-all
3. Build frontend and start server:
   npm run build
   npm start
4. Visit http://localhost:4000

Dev:
- Run `npm run dev` after installing devDependency `concurrently` to run both dev servers.

Notes:
- Local JSON DB: server/db.json (managed with lowdb)
- Uploads placed in server/uploads/
- Quick login endpoint: POST /api/auth/quick { name }
- Admin panel: /admin is accessible from the frontend (button)
- To enable YouTube sync you need to fill YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET and complete OAuth flow.
