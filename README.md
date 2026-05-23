# AI-Ticket-Analyzer
TripCraft is an AI-powered travel planner that turns booking files into clean itineraries in seconds. Upload your ticket or reservation, and it extracts travel details, organizes your trip, and lets you manage and share plans easily.

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

# Travel Itinerary - Backend

Node.js + Express + MongoDB REST API for an AI-powered travel itinerary
generator. Uploaded booking documents are sent to Groq (OpenAI-compatible API),
which extracts the bookings and produces a day-by-day itinerary. Originals are
stored in AWS S3.

## Tech

- Node.js + Express
- MongoDB (Mongoose)
- JSON Web Tokens (auth)
- AWS S3 (file storage, private bucket + signed URLs)
- Groq (OpenAI-compatible chat completions, multimodal - reads PDFs and images directly)
- Multer (multipart uploads)

## Folder structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # mongoose.connect
│   │   └── s3.js              # S3 client + isS3Configured()
│   ├── controllers/           # all route handlers + business logic
│   │   ├── authController.js
│   │   ├── itineraryController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js # multer config
│   ├── models/
│   │   ├── User.js
│   │   └── Itinerary.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itineraryRoutes.js
│   │   └── uploadRoutes.js
│   ├── app.js                 # express app setup
│   └── server.js              # entry point
├── .env
├── .env.example
└── package.json
```

## Getting started

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

The API will be live on `http://localhost:5000`.

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `GROQ_API_KEY` | Groq API key (https://console.groq.com) |
| `GROQ_MODEL` | e.g. `meta-llama/llama-4-scout-17b-16e-instruct` |
| `AWS_ACCESS_KEY_ID` | IAM user with S3 access |
| `AWS_SECRET_ACCESS_KEY` | matching secret |
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_S3_BUCKET` | bucket name |

If the AWS variables are left as placeholders the app still works end-to-end;
file content is just not persisted (only metadata is stored in Mongo).

## API

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| GET | `/api/health` | - | - |
| POST | `/api/auth/register` | - | `{ name, email, password }` |
| POST | `/api/auth/login` | - | `{ email, password }` |
| GET | `/api/auth/me` | Bearer | - |
| GET | `/api/itineraries` | Bearer | - |
| POST | `/api/itineraries` | Bearer | `multipart/form-data` with `files[]` and optional `notes` |
| GET | `/api/itineraries/:id` | Bearer | - |
| PATCH | `/api/itineraries/:id` | Bearer | partial itinerary object |
| DELETE | `/api/itineraries/:id` | Bearer | - |
| POST | `/api/itineraries/:id/share` | Bearer | `{ isPublic: boolean }` |
| GET | `/api/itineraries/share/:token` | - | - |
| GET | `/api/uploads/sign?key=...` | Bearer | - |

## AWS S3 setup

1. Create a bucket (e.g. `travel-itinerary-uploads`). Keep "Block all public
   access" ON - we use signed URLs.
2. Create an IAM user with this minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. Put the access key, secret, region and bucket name into `.env`.

## Notes

- Passwords are hashed with bcrypt on save.
- File uploads are validated by MIME type (`application/pdf`, `image/jpeg`,
  `image/png`, `image/webp`) and capped at 10 MB per file, 8 files per request.
- Shared itineraries expose a public read-only payload only.
