# ComboTool

An interactive web visualizer for college-level combinatorics and linear algebra. Explore concepts like permutation matrices and projections through hands-on, animated demonstrations.

**🔗 Live:** [combo-tool-phi.vercel.app](https://combo-tool-phi.vercel.app)

> **Disclaimer:** This project was built with the assistance of AI. AI tools were used to help generate, refine, and review portions of the code, documentation, and design.

## Status

| Topic | Status |
|---|---|
| Permutation Matrices | ✅ Live |
| Projection Matrices | 🚧 Planned |
| Binomial Coefficients & Pascal's Triangle | 🚧 Planned |

The topic registry at `frontend/src/topics.js` is the single source of truth — add an entry there to register a new topic.

## Tech Stack

**Frontend** (`frontend/`)
- Next.js 14 (App Router) on React 18
- HTML5 Canvas for the interactive matrix; SVG for the vector-flow diagram
- Fuse.js for fuzzy search on the browse page
- Axios for backend calls

**Backend** (`backend/`)
- Flask + Flask-CORS
- NumPy / SciPy for matrix math
- Gunicorn for production

## Project Structure

```
ComboTool/
├── backend/                  # Flask API
│   ├── app.py                # Routes
│   ├── combinatorics.py      # Permutation / Projection / Grassmannian math
│   └── requirements.txt
└── frontend/                 # Next.js 14 app
    └── src/
        ├── app/              # App Router pages
        ├── components/       # Shared UI (Navigation, TabBar, TopicCard, …)
        ├── visualizers/      # Per-topic interactive components
        ├── services/api.js   # Axios wrapper for backend endpoints
        └── topics.js         # Topic registry (single source of truth)
```

## Getting Started

**Prerequisites:** Node.js 20+ and Python 3.8+.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                     # serves at http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # serves at http://localhost:3000
```

The frontend reads the backend URL from `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:5001/api`.

## Deployment

- **Frontend:** Vercel, auto-deploys on push to `main`.
- **Backend:** Render (free tier), auto-deploys on push to `main`. The free tier sleeps after ~15 min idle, so the first request after a quiet period takes ~30 seconds to wake — the permutations page shows a loader with that hint during cold starts.

## Author

Mina Megalaa
