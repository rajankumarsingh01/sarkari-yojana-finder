# Sarkari Yojna Sathi

Bihar ke logon ke liye sarkari schemes dhundhne aur eligibility ka preliminary match dekhne ka platform.
This is an information platform, not a government authority. Final eligibility is decided by the concerned department.

## Structure
- `client/`     React + Vite + Tailwind (port 5173)
- `server/`     Node + Express + Mongoose (port 5000)
- `ai-service/` Python + FastAPI + LangGraph (port 8000)

## Run locally (Windows PowerShell)

Server:
    cd server
    Copy-Item .env.example .env   # then fill values
    npm install
    npm run dev

Client:
    cd client
    npm install
    npm run dev

AI service:
    cd ai-service
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    Copy-Item .env.example .env   # then fill values
    uvicorn app.main:app --reload --port 8000

## Data rule
No scheme data is invented. Every scheme must come from an official source and carry its source URL.
Anything AI-generated needs admin approval before it is published.