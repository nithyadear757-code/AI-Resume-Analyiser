# Student Task Management System

A full-stack app for students to create, organize, and track coursework and personal tasks.

**Stack:** React, Vite, and Axios; Node.js and Express; MongoDB with Mongoose.

## Features

- Create, view, edit, and delete tasks
- Track status: Pending, In Progress, or Completed
- Set Low, Medium, or High priority and a due date
- Search task titles and filter by status and priority
- Highlight overdue and due-today tasks that are not completed
- Validate task input in the browser and API, with clear success and error messages
- Show a task summary by status

## Project structure

```text
student-task-management/
├── backend/
│   ├── controllers/       # Task API logic
│   ├── middleware/        # API errors
│   ├── models/            # Mongoose task model
│   ├── routes/            # REST API routes
│   ├── tests/             # Backend utility tests
│   ├── utils/             # Task constants and date validation
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/    # Form, filters, and task cards/list
    │   ├── services/      # Task API client
    │   └── utils/         # Date formatting and validation
    └── index.html
```

## Requirements

- Node.js 18 or later
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Install the dependencies:

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

2. Create `backend/.env` from `backend/.env.example` and set `MONGO_URI` to your local MongoDB URI or Atlas connection string:

   ```dotenv
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/studentTasks
   ```

   For Atlas, use the connection string provided by MongoDB Atlas and include the database name `studentTasks`.

3. In one terminal, start the API:

   ```powershell
   cd backend
   npm run dev
   ```

4. In a second terminal, start the React app:

   ```powershell
   cd frontend
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000).

The frontend reads `VITE_API_URL` from `frontend/.env`; it defaults to `http://localhost:5000`.

## API

All endpoints return JSON. A task has `id`, `title`, `description`, `priority`, `status`, `dueDate`, `createdAt`, and `updatedAt`. New tasks default to `Medium` priority and `Pending` status when those values are omitted.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List all tasks, newest first |
| `GET` | `/tasks?status=pending` | Filter by status |
| `GET` | `/tasks?priority=high` | Filter by priority |
| `GET` | `/tasks/:id` | Get one task |
| `PUT` | `/tasks/:id` | Update one or more task fields |
| `DELETE` | `/tasks/:id` | Delete a task |

Example create request:

```json
{
  "title": "Finish biology assignment",
  "description": "Complete questions 1 through 8 and review the diagrams.",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2026-10-20"
}
```

Use one of the following exact values (case-insensitive in API requests):

- Status: `Pending`, `In Progress`, `Completed`
- Priority: `Low`, `Medium`, `High`

The API accepts dates in `YYYY-MM-DD` format. Invalid dates and enum values receive a `400` response, malformed task IDs receive `400`, and a valid ID with no matching task receives `404`.

## Assumptions and design decisions

- A task title, description, priority, and due date are required. Titles are limited to 120 characters and descriptions to 2,000 characters.
- A new task starts as `Pending` with `Medium` priority unless valid values are provided.
- Due dates are date-only values, stored at UTC midnight. The browser compares the date against the student's local calendar day to display overdue and due-today indicators.
- Completed tasks are not marked overdue.
- Search and status/priority filters are applied in the browser after retrieving the task list. The API also supports status and priority query filters.
- Tasks are not scoped to a user account; authentication and per-user ownership are outside this assignment's scope.

## Tests

Run backend utility tests:

```powershell
cd backend
npm test
```

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## Demo video

Record a short walkthrough showing task creation, title search, status and priority filters, editing, status changes, deletion, and the overdue indicator. Upload the recording to the submission platform or a shareable video host, then add the resulting link here before submission.

## Possible future improvements

- Add user accounts and private task lists
- Add pagination and server-side title search
- Add recurring tasks, reminders, and calendar views
- Add automated API integration tests and deployment instructions
