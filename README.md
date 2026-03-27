# Task Manager Project

A full-stack task manager with a React frontend and an Express/MongoDB backend.

## Tech Stack

- Frontend: React 19, Vite
- Backend: Express 5, Mongoose
- Database: MongoDB

## Project Structure

- `frontend/` contains the Vite React app
- `backend/` contains the Express API

## Environment Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Copy `frontend/.env.example` to `frontend/.env`
3. Fill in the required values

Backend environment variables:

- `PORT`: API port, default `5000`
- `NODE_ENV`: use `production` in deployed environments
- `MONGO_URI` or `MONGO_URI_STANDARD`: MongoDB connection string
- `FRONTEND_ORIGIN`: allowed frontend origin, or a comma-separated list of origins
- `RATE_LIMIT_WINDOW_MS`: optional rate-limit window in milliseconds
- `RATE_LIMIT_MAX`: optional max requests per IP during the rate-limit window
- `TRUST_PROXY`: set to `true` behind platforms like Render, Railway, or Nginx
- `SERVE_FRONTEND`: set to `true` to let Express serve the built React app

Frontend environment variables:

- `VITE_API_BASE_URL`: full base URL for the task API, for example `https://api.example.com/api/tasks`

## Local Development

1. Install backend dependencies: `npm install` in `backend/`
2. Install frontend dependencies: `npm install` in `frontend/`
3. Start the backend: `npm run dev` in `backend/`
4. Start the frontend: `npm run dev` in `frontend/`

The frontend runs on `http://localhost:5173` by default and the backend runs on `http://localhost:5000`.

## Production Build

1. Set `frontend/.env` with your production API base URL
2. Set `backend/.env` with your production MongoDB connection string and allowed frontend origin
3. Build the frontend: `npm run build` in `frontend/` or `npm run build` at repo root
4. Start the backend: `npm start` in `backend/` or `npm start` at repo root
5. In production, Express can serve `frontend/dist/` directly when `SERVE_FRONTEND=true`

## One-Command Repo Scripts

- `npm run install:all`
- `npm run build`
- `npm run test`
- `npm start`

## Docker Deployment

1. Build the image: `docker build -t task-manager-project .`
2. Run the container with your environment variables:
   `docker run -p 5000:5000 --env-file backend/.env task-manager-project`

The container builds the frontend and serves it from the backend in production.

## API Endpoints

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Tests

- Backend tests: `npm test` in `backend/`
- Frontend production build check: `npm run build` in `frontend/`

## Production Notes

- Do not commit `.env` files
- Rotate secrets if `backend/.env` was ever pushed before it was untracked
- Set `FRONTEND_ORIGIN` to your real deployed frontend URL
- Keep `node_modules/` out of Git and install dependencies during deployment
