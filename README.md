# CarePlus — Healthcare Management Platform

CarePlus is a web application for healthcare workflows, built with a React frontend and an Express/Node.js backend connected to MongoDB. The backend exposes routes for authentication, appointments, doctors, test centres, visits, health-vault records, notifications, search, statistics, and an optional AI chatbot integration.

## Core Areas

- **Patient workflows** — user-facing healthcare features and appointment requests.
- **Doctor workflows** — doctor-related routes and appointment management.
- **Appointments and visits** — API routes for appointment and visit records.
- **Provider and test-centre discovery** — dedicated provider, doctor, search, and test-centre endpoints.
- **Health vault and notifications** — separate API route groups for health records and notifications.
- **AI chatbot integration** — a Groq-powered chatbot route when a supported API key is configured.
- **Interactive frontend** — React 19, Vite, React Router, Leaflet/React Leaflet, and QR-code components.

Feature availability and access may depend on application configuration and user role.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router |
| Maps and UI | Leaflet, React Leaflet, Lucide React |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication and security-related packages | JSON Web Tokens, bcryptjs |
| Optional AI integration | Groq SDK |

## Repository Structure

```text
CarePlus/
├── client/        # React + Vite frontend
│   ├── src/
│   └── package.json
└── server/        # Express API and database models
    ├── middleware/
    ├── models/
    ├── routes/
    ├── uploads/
    ├── server.js
    └── package.json
```

## Prerequisites

- Node.js and npm
- A running MongoDB instance or MongoDB connection URI
- A Groq API key if you want to enable the chatbot integration

## Run Locally

### 1. Configure the backend

Open a terminal:

```bash
cd server
npm install
```

Create a local `.env` file inside `server/` and configure the values needed by your environment:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital
GROQ_API_KEY=your_groq_api_key
```

The backend accepts `MONGO_URI` and otherwise falls back to a local database named `hospital`. The chatbot checks `GROQ_API` or `GROQ_API_KEY`; the key is optional for non-chatbot workflows.

Start the API:

```bash
npm start
```

The server listens on port `5000` by default.

### 2. Configure and start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local address printed by Vite in the terminal (usually [http://localhost:5173](http://localhost:5173)).

If the frontend uses a configured API base URL, set it to the backend address used in your local environment. Check the client source for the exact variable name before adding it to a local environment file.

## API Route Groups

The backend mounts these route prefixes:

| Prefix | Area |
|---|---|
| `/auth` | Authentication |
| `/users` | User operations |
| `/appointments` | Appointment workflows |
| `/stats` | Dashboard statistics |
| `/chatbot` | AI chatbot |
| `/providers` | Providers |
| `/api/search` | Search |
| `/api/doctor` | Doctor-related operations |
| `/api/testcenter` | Test centres |
| `/api/visits` | Visits |
| `/api/health-vault` | Health-vault operations |
| `/api/notifications` | Notifications |

Consult the route files in `server/routes/` for endpoint methods, request bodies, and response formats.

## Security Notes

- Keep MongoDB credentials, API keys, and authentication secrets in local environment files.
- Never commit real secrets, tokens, or private user/health data.
- This repository handles healthcare-related workflows; do not treat its chatbot output as a substitute for professional medical care.
- Review authentication, authorization, file-upload handling, and deployment configuration before exposing the application publicly.

## Development

Frontend scripts are defined in `client/package.json`:

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the built frontend

The backend's package currently defines a placeholder test script, so `npm test` is not a passing test suite.

## License

No root-level license file was identified during this documentation review. Contact the repository owner before reusing or redistributing this project.
