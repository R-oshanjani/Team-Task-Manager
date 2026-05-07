# Team Task Manager (Full-Stack)

A full-stack web application designed for teams to create projects, assign tasks, and track progress using a Kanban-style board. The application features robust role-based access control (RBAC), ensuring that only authorized project Admins can manage members and delete tasks.

## 🚀 Features
- **Authentication**: Secure JWT-based User Signup and Login.
- **Project Management**: Create projects, view project details, and manage project members.
- **Role-Based Access Control (RBAC)**: 
  - `Admin`: Can add/remove members, delete projects, and delete tasks.
  - `Member`: Can view tasks, create tasks, and update task statuses.
- **Task Tracking (Kanban)**: Track tasks across 'To Do', 'In Progress', and 'Completed' columns.
- **Dashboard**: A comprehensive overview of total tasks, statuses, and your assigned projects.
- **Rich Aesthetics**: A modern UI built with vanilla CSS featuring glassmorphism, gradients, and micro-animations.

## 🛠️ Tech Stack
- **Backend**: Django, Django REST Framework, SimpleJWT, PostgreSQL (via dj-database-url)
- **Frontend**: React, Vite, Axios, React Router v6, Lucide-React
- **Styling**: Custom Vanilla CSS

---

## 💻 Running Locally

### 1. Backend (Django)
Navigate to the `backend` directory and set up your Python environment:

```bash
cd backend
python -m venv venv
# Activate the venv (Windows)
.\venv\Scripts\activate
# Activate the venv (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations to set up the SQLite database
python manage.py migrate

# Start the Django development server
python manage.py runserver 8000
```
The backend API will run at `http://localhost:8000`.

### 2. Frontend (React)
Navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies (requires Node.js)
npm install

# Start the Vite development server
npm run dev
```
The frontend application will run at `http://localhost:5173`.

---
*Built as a Full-Stack Assignment Submission.*
