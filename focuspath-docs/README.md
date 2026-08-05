# FocusPath Architecture & Execution Guide

This document describes how to configure, run, and verify the **AI Adaptive Academic Planning and Focus Management System** (FocusPath).

---

## Technical Stack Overview

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts, React Query, React Hook Form, Zod.
- **Backend**: Django REST Framework (Python 3.11+), PostgreSQL, Redis, Celery.

---

## 1. Backend Setup & Run

The backend manages user authentication, tab tracking audit logs, task soft-deletion policies, and the AI planner slots shifting algorithm.

### Prerequisites
- Python 3.11+
- Redis Server (running on `localhost:6379`)
- PostgreSQL Database (or fallback to local sqlite for mock testing if configured)

### Setup Environment
1. Navigate to the backend folder:
   ```bash
   cd focuspath-backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Database Migrations
Create the PostgreSQL database schemas and apply initial migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Start Servers
1. **Django Development Server**:
   Starts the API server at `http://127.0.0.1:8000/`.
   ```bash
   python manage.py runserver
   ```

2. **Celery Worker** (Required for background AI plan updates):
   Open a separate terminal window and execute:
   ```bash
   celery -A config worker --loglevel=info
   ```

---

## 2. Frontend Setup & Run

The frontend implements the high-fidelity Bento Box designs, visual analytics widgets, parent restrictions sliders, and browser tab tracking.

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup Environment
1. Navigate to the frontend folder:
   ```bash
   cd focuspath-frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```

### Start Development Server
Run the local next server at `http://localhost:3000/`:
```bash
npm run dev
```

### Build for Production
Run compile audits to check type safety and static optimization:
```bash
npm run build
```

---

## 3. Key Core Features & Troubleshooting

### Tab Swindling Lockout Check
- In **Kid Mode**, if a child switches active browser tabs **3 times**, the user is flagged as locked (`is_locked = True`).
- An `ApprovalRequest` record is generated.
- When the parent clicks **Approve** from the Parent Dashboard, `is_locked` is set to `False` and `tab_switch_count` is reset.
- A bypass duration limit (usually 120 minutes) is assigned.

### Soft Deletion
- Deleting planner tasks does not erase database rows; it flags the records with `ARCHIVED` status.
- Views default to active tasks only.
