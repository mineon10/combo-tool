# Setup Instructions

## Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Frontend Setup

```bash
cd frontend
npm install
```

## Running Locally

### Terminal 1: Start Backend

```bash
cd backend
source venv/bin/activate
flask run
```

Backend will run at `http://localhost:5000`

### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

Frontend will run at `http://localhost:3000`

## Deployment

(Coming soon)
