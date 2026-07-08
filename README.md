# User Management System

A full-stack user management app: a Flask REST API backend with session-based
authentication and a React frontend for registration, login, and CRUD user
management.

## Tech Stack

- **Backend:** Flask, Flask-SQLAlchemy (SQLite), Flask-CORS, Werkzeug password hashing
- **Frontend:** React (Create React App), fetch API

## Project Structure

```
usermanagement/
├── backend/
│   ├── app/
│   │   ├── __init__.py       # app factory: db, CORS, session config, blueprints
│   │   ├── auth_routes.py    # /api/register, /login, /logout, /me
│   │   ├── user_routes.py    # /api/users CRUD (list/get/update/delete)
│   │   ├── decorators.py     # login_required (session-based)
│   │   ├── validators.py     # shared username/email/password validation
│   │   ├── models.py         # User model + password hashing
│   │   └── config.py         # env-driven settings
│   ├── run.py                # entry point
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AuthForm.jsx  # login/register toggle form
    │   │   └── UserTable.jsx # post-login CRUD table
    │   ├── apiConfig.js      # shared API base URL
    │   ├── App.js            # session check + view switch
    │   └── index.js
    ├── package.json
    └── .env.example
```

## Prerequisites

- Python 3.9+
- Node.js 18+ and npm

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python3 -m pip install -r requirements.txt
cp .env.example .env               # edit SECRET_KEY before deploying anywhere real
python3 run.py
```

The API starts on `http://localhost:5000` by default (see [Ports](#ports) below).
SQLite data is stored in `backend/instance/app.db`, created automatically on
first run.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The app opens at `http://localhost:3000`.

## Ports

macOS reserves port **5000** for AirPlay Receiver, so the backend defaults to
**5000** instead. If you change `PORT` in `backend/.env`, update
`REACT_APP_API_URL` in `frontend/.env` to match.

## Environment Variables

**backend/.env**

| Variable        | Description                              | Default                          |
| --------------- | ----------------------------------------- | --------------------------------- |
| `SECRET_KEY`    | Signs session cookies — must be random and secret in production | `dev-secret-key-change-in-production` |
| `DATABASE_URL`  | SQLAlchemy DB URI (relative paths resolve under `backend/instance/`) | `sqlite:///app.db` |
| `CORS_ORIGINS`  | Comma-separated list of allowed frontend origins | `http://localhost:3000` |
| `PORT`          | Port the Flask server listens on          | `5000`                            |

**frontend/.env**

| Variable             | Description                | Default                       |
| -------------------- | --------------------------- | ------------------------------ |
| `REACT_APP_API_URL`  | Base URL of the backend API | `http://localhost:5000/api`   |

## API Reference

Authentication is session-cookie based (`Flask` server-side sessions). The
frontend sends `credentials: "include"` on every request; any client calling
these endpoints directly must do the same (e.g. `curl -c/-b cookies.txt`).

### Auth — `/api/*`

| Method | Endpoint         | Auth required | Description                          |
| ------ | ---------------- | :-----------: | ------------------------------------- |
| POST   | `/api/register`  | No            | Create a new user account             |
| POST   | `/api/login`     | No            | Authenticate and start a session      |
| POST   | `/api/logout`    | Yes           | End the current session               |
| GET    | `/api/me`        | Yes           | Return the currently logged-in user   |

### Users — `/api/users/*` (all require an active session)

| Method | Endpoint           | Description                       |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/api/users`        | List all users                    |
| GET    | `/api/users/<id>`   | Get a single user                 |
| PUT    | `/api/users/<id>`   | Update username/email/password    |
| DELETE | `/api/users/<id>`   | Delete a user                     |

**Request/response examples**

```bash
# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

# Login (persist the session cookie for later requests)
curl -c cookies.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# List users (uses the saved session cookie)
curl -b cookies.txt http://localhost:5000/api/users
```

## Notes

- Any authenticated user can currently view, edit, or delete any other user —
  there is no admin/role distinction. Add role-based checks in
  `app/decorators.py` if that's needed.
- The Flask dev server (`run.py`) is for local development only; put a
  production WSGI server (e.g. gunicorn) in front of it for deployment.
