# HirePrep

An Adaptive Placement Preparation Platform.

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite

## Setup Instructions

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database:
   ```bash
   python seed.py
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Features
- **User Authentication:** Register and Login.
- **Dashboard:** View list of problems.
- **Workspace:** Solve problems with an integrated code editor.
- **Adaptive Recommendations:** (Backend logic implemented).
