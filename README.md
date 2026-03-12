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

## 5) Sample Admin Credentials

- Email: `admin@opportunitymatcher.com`
- Password: `Admin@123`

These are seeded via `npm run seed:admin` (can be changed in backend `.env`).
