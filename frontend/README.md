# Smart Trello Demo

A minimal Trello-style collaboration surface with JWT auth, shared boards, invite workflows, and a “Smart Recommendations” rail that suggests due dates, list moves, and related cards by inspecting card content.

## Tech Stack

- **Frontend:** React 19 + Vite, Tailwind, socket.io client
- **Backend:** Node.js + Express, MongoDB via Mongoose, socket.io server
- **Auth:** Cookie-based JWT session

## Running the app locally

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev # or nodemon server.js
   ```
   Create a `.env` file with:
   ```
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<long-random-string>
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The Vite dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

## Features

- Board CRUD with default To Do / In Progress / Done lists plus custom lists.
- Invite collaborators by email, accept invites directly from the dashboard.
- Shared boards show live updates via socket rooms.
- Card management (description, labels, due dates, list moves) with lightweight forms.
- Recommendation engine surfaces:
  - Suggested due dates inferred from card text.
  - Suggested list moves when copy hints at status changes.
  - Related-card clustering when two cards share overlapping keywords.

## Folder Structure

- `backend/` – Express API, models, controllers, smart recommendation util.
- `frontend/` – React UI, context/auth, board UI components, pages.

Modify `frontend/src/services/api.js` if you change backend ports or hosts. Fine-tune recommendation heuristics inside `backend/utils/smartRecommendations.js`.
