# Employee Leave Management System

A full-stack web app to submit, review and track employee leave requests.

**Stack:** React (Vite) + Axios, Node.js + Express, MongoDB (Mongoose), plain CSS.

## Features
- Submit, edit and delete leave requests
- Approve / reject requests (status badges: Pending, Approved, Rejected)
- Total leave days calculated automatically (start and end date both counted)
- Search by employee name or ID; filter by status and leave type
- Validation on both frontend and backend, with clear error messages

## Folder structure
```
employee-leave-management/
├── backend/   (Express API + Mongoose)
└── frontend/  (React + Vite)
```

## Prerequisites
Node.js 18+ (LTS), VS Code, a free MongoDB Atlas account.

## 1. MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Database Access: add a user with a username and password.
3. Network Access: add IP address `0.0.0.0/0` (allow from anywhere, for development).
4. Connect -> Drivers -> copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/leaveDB?retryWrites=true&w=majority`
   (replace USER and PASSWORD, and add the database name `leaveDB` before the `?`).

## 2. Backend
Open a terminal in VS Code:
```
cd backend
npm install
```
Open `backend/.env` and set your connection string:
```
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/leaveDB?retryWrites=true&w=majority
```
Run it:
```
npm run dev
```
You should see `MongoDB connected` and `Server running on http://localhost:5000`.

## 3. Frontend
Open a **second** terminal:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 in your browser.

## API
| Method | URL | Description |
|---|---|---|
| POST | /leaves | Create a leave (status always starts as Pending) |
| GET | /leaves | Get all leaves |
| GET | /leaves?status=Pending | Filter by status |
| GET | /leaves/:id | Get one leave |
| PUT | /leaves/:id | Update fields and/or status |
| DELETE | /leaves/:id | Delete a leave |

Sample POST body:
```json
{
  "employeeName": "Priya Sharma",
  "employeeId": "EMP001",
  "leaveType": "Sick Leave",
  "startDate": "2026-10-15",
  "endDate": "2026-10-17",
  "reason": "Fever"
}
```
Approve with `PUT /leaves/:id` and body `{ "status": "Approved" }`.

## Business rules
- New requests start as Pending.
- End date cannot be before start date; both dates are counted (15 Oct to 17 Oct = 3 days).
- Only Casual Leave, Sick Leave, Earned Leave are accepted.
- Only Pending, Approved, Rejected are accepted as status.
- A request with invalid dates cannot be approved.
- Invalid ID -> 400. Missing record -> 404. Required fields cannot be empty.

## Common errors
- `MONGO_URI is missing`: edit `backend/.env`.
- `MongoDB connection failed`: check the password, and that Atlas Network Access allows your IP.
- Frontend says "Cannot reach the server": start the backend first.
- `EADDRINUSE`: port 5000 is busy; change `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env`.
