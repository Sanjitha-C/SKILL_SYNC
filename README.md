# Opportunity Matcher

Opportunity Matcher is a full-stack web app that recommends events to students based on interests captured during signup.

## 1) Folder Structure

```text
IP NEW/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── student/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## 2) Backend (implemented first)

- Express + MongoDB + JWT auth
- Student signup, shared login for admin/student
- Role-based middleware and protected APIs
- MongoDB schemas: User, Event, Registration, Attendance, Feedback, Message
- Multer image upload for event posters
- Admin APIs: event management, student attendance, reports, notifications
- Student APIs: matched opportunities, register/skip, progress, attendance, reports, feedback, messages

## 3) Frontend

- React + Vite + Axios + React Router
- Shared modern sidebar theme for admin and student dashboards
- Single login flow with role-based redirect
- Student-only signup with interests multi-select tags
- Admin sections: Manage Events, Students, Reports
- Student sections: My Institution, Opportunities (swipe-style actions), Progress, Attendance, Reports, Messages
- Protected routes and role checks

## 4) Run Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally (or cloud URI)

### Backend

```bash
cd backend
npm install
copy .env.example .env
# Set a unique ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.
npm run seed:admin
npm run dev
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open: `http://localhost:5173`

## 5) Admin Setup

Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) in
`backend/.env`, then run `npm run seed:admin` from the backend directory. Never
use a shared sample password in a deployed environment.

## 6) Optional Local Demo Data

After creating an admin and student account, run this from the repository root:

```bash
npm --prefix backend run seed:demo
```

This idempotently adds sample events and linked registrations, attendance, feedback,
an event summary, and a student message for the most recently created student account.
It does not delete or update existing accounts or records. Demo event titles begin
with `[Skill Sync Demo]` so they are easy to identify.

## 7) Deploy to Vercel, Render, and MongoDB Atlas

The local MongoDB database is not copied to the cloud. Create a MongoDB Atlas
cluster and database user, then add a network access rule that allows your Render
service to connect. Prefer the Render outbound IP ranges when available; if you
must allow `0.0.0.0/0`, use a unique database password and a least-privilege
database user. Atlas connection strings and all passwords are secrets; do not
commit them or paste them into source files.

### Deploy the API to Render

1. In Render, create a **Blueprint** from this GitHub repository. Render reads
   the root `render.yaml` and creates the API service from the `backend` folder.
2. Set `MONGO_URI` to the Atlas connection string and `CLIENT_URL` to the exact
   Vercel production URL (for example, `https://your-app.vercel.app`). Keep the
   generated `JWT_SECRET`; do not replace it with a public/default value.
3. Wait until Render reports the service healthy at `/api/health`; copy its
   `https://...onrender.com` service URL.

### Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel and set the project root
   directory to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
   `frontend/vercel.json` enables client-side route refreshes.
3. Add these Vercel environment variables, replacing the host with your Render
   service URL:

   ```text
   VITE_API_URL=https://your-api.onrender.com/api
   VITE_FILE_BASE_URL=https://your-api.onrender.com
   ```

4. Deploy the frontend. Add its exact production URL to Render's `CLIENT_URL`
   (comma-separated if you have multiple frontend origins), then redeploy the API.

### Create the first deployed admin

From a trusted PowerShell terminal at the repository root, enter the Atlas URI
and admin credentials when prompted, then remove them from that terminal session:

```powershell
$env:MONGO_URI = Read-Host "Atlas connection string"
$env:ADMIN_NAME = Read-Host "Admin name"
$env:ADMIN_EMAIL = Read-Host "Admin email"
$securePassword = Read-Host "Unique admin password (at least 12 characters)" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
npm --prefix backend run seed:admin
Remove-Item Env:\MONGO_URI, Env:\ADMIN_NAME, Env:\ADMIN_EMAIL, Env:\ADMIN_PASSWORD
Remove-Variable securePassword
```

The seeder refuses missing or shorter-than-12-character passwords and does not
print passwords. Do not run `seed:demo` against production.

Render's free service may sleep when idle, so its first request can take longer.
Event images are stored on the service's local filesystem and are not durable
across service restarts/redeploys; avoid relying on production image uploads until
durable object storage is configured.
