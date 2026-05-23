# Travel Itinerary - Frontend

React + Vite + Tailwind frontend for the AI travel itinerary app. It talks to
the backend over a small REST API.

## Tech

- React 18 + Vite
- React Router v6
- Tailwind CSS
- Axios
- react-dropzone (drag & drop uploads)
- react-hot-toast
- lucide-react (icons)

## Folder structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js          # axios instance with auth header
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── FileDropzone.jsx
│   │   ├── ItineraryCard.jsx
│   │   └── ItineraryDetails.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewItinerary.jsx
│   │   ├── ItineraryPage.jsx
│   │   └── SharedItinerary.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Getting started

```bash
npm install
cp .env.example .env   # then update VITE_API_URL if needed
npm run dev
```

Visit http://localhost:5173.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend, e.g. `http://localhost:5000` |

## Build

```bash
npm run build
npm run preview
```

The production bundle is written to `dist/`.

## Pages

| Path | Auth | Purpose |
| --- | --- | --- |
| `/` | - | Landing page |
| `/login` | - | Email/password login |
| `/register` | - | Create an account |
| `/dashboard` | Yes | List of past itineraries |
| `/itineraries/new` | Yes | Drag & drop upload + AI generation |
| `/itineraries/:id` | Yes | Itinerary detail + share toggle |
| `/share/:token` | - | Public read-only itinerary |
