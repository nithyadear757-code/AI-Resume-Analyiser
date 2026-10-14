# AI Resume Analyzer

ClearCV compares a resume with a job description and gives a skill-match score, matching and missing skills, and practical suggestions. Resume files are processed in memory by the local backend and are not saved.

## Requirements

- Node.js 18 or later
- npm (included with Node.js)

Supported resume formats: PDF, DOCX, and TXT (maximum file size: 5 MB).

## Run locally

Open two PowerShell terminals at the project root.

In the first terminal, install and start the backend:

```powershell
Set-Location backend
npm install
npm run dev
```

In the second terminal, install and start the frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite, usually [http://localhost:5173](http://localhost:5173). The API listens on [http://localhost:5000](http://localhost:5000). Press `Ctrl+C` in each terminal to stop its server.

No database, cloud service, or API key is required. To use a different API port, set `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env` to match.

## Create a production build

```powershell
Set-Location frontend
npm run build
```

The frontend build is written to `frontend/dist`.

## Backend tests

```powershell
Set-Location backend
npm test
```

## Analysis approach and privacy

Analysis runs locally using a curated skills list, keyword matching, resume-section checks, and measurable-achievement cues. It is not a generative AI model and does not send documents to an external service. The backend keeps uploaded files in memory for the request, returns the analysis, and does not persist the resume. Scores are guidance, not hiring advice; verify every suggestion and only add skills that reflect your actual experience.

The frontend and backend deliverables are packaged separately as `ai-resume-analyzer-frontend.zip` and `ai-resume-analyzer-backend.zip`. Each archive contains only its part of this analyzer and excludes local `.env` files and `node_modules`. To run the packages together, extract each archive into a folder named `frontend` and `backend` under the same parent folder, then follow the local run instructions above.
