# Movie Watchlist

A modern, responsive Movie Watchlist web app built with Next.js, React, TypeScript, Tailwind CSS, and MongoDB. Track movies you want to watch, rate what you've seen, and discover recommendations from the community.

## Features

- 🎬 **Add Movies**: Add movies with title, year, genre, image, and notes
- ✅ **Track Progress**: Organize movies into "To Watch" and "Watched" lists
- ⭐ **Rate Movies**: Rate watched movies from 1-5 stars
- 🔍 **Smart Filtering**: Filter by user, genre, year, rating, and search by title
- 👤 **User Authentication**: Sign up, login, and logout with secure JWT authentication
- 🔒 **Ownership Control**: Only movie authors can edit, delete, and rate their movies
- 🌐 **Public Viewing**: Everyone can view all movies, but only authors can modify
- 📱 **Responsive Design**: Beautiful Netflix-style dark theme, works on all devices
- 🎨 **Modern UI**: Smooth animations, hover effects, and intuitive user experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies
- **Animations**: Framer Motion
- **UI Components**: Custom components with shadcn/ui utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd movie-watchlist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
MONGODB_URI=your-mongodb-connection-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### Ask your watchlist

Set `GEMINI_API_KEY` in `.env.local` (and your hosting environment). The key stays on the server.
New movies require this key to create their embeddings before saving. Adding or editing embedding metadata fails without saving if the embedding service is unavailable.

Run `npm run backfill:embeddings` once for existing movies. The script loads Next.js development environment files, processes both Soon and Seen collections, and **regenerates every embedding on every run**, including current Gemini embeddings. It makes Gemini API calls that may incur charges and writes embeddings to the configured MongoDB database.

The dashboard's **Ask your watchlist** box searches only the signed-in user's Soon movies. `POST /api/ask` accepts `{ "question": "Something short and funny tonight?" }` and returns `{ "status": "match", "movie": { "id": "...", "title": "...", "year": 2020, "imageUrl": "..." }, "reason": "...", "remaining": 9, "resetsAt": 0 }` (with the actual quota reset timestamp in milliseconds). The chosen ID must belong to the retrieved Soon candidates; unknown IDs or no match return `status: "no_match"`, a null movie, and a fixed friendly message without model text. Titles and posters come from the database. `GET /api/ask` reads the remaining hourly quota without consuming it. It ranks movies by cosine similarity in code and supplies at most five movies, including stored runtimes, to the LLM. Missing, invalid, or stale model embeddings return a preparation error until backfilled; an empty Soon list returns `status: "empty"`. Open `/dashboard#ask` for the section; the Add Movie link opens the existing dialog and Mark as seen opens the existing rating flow.

Provider code lives in `lib/watchlist-provider.js`, using `gemini-embedding-001` (768 dimensions, document/query retrieval tasks) and `gemini-3.5-flash-lite` through server-side HTTP requests. See Google's [embeddings](https://ai.google.dev/gemini-api/docs/embeddings) and [structured output](https://ai.google.dev/gemini-api/docs/structured-output) documentation. Each movie stores `embeddingModel`, and old OpenAI embeddings are incompatible: run the backfill before using recommendations after switching providers.

`/api/ask` allows 10 valid question attempts per user per fixed UTC clock hour. MongoDB stores atomic counters in `ask-rate-limits`, shared across server instances; failed provider calls also count. Limit responses return HTTP 429 and a `Retry-After` header. Gemini 429 responses display “Please try again in a minute.” The existing UI displays these server messages. No vector database or additional framework is required.

### Prerequisites

- Vercel account
- MongoDB Atlas account (recommended for production)

### Steps

1. **Push your code to GitHub** (if not already done)

2. **Import your project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
     - `JWT_SECRET`: A strong random string (generate with `openssl rand -base64 32`)
     - `JWT_EXPIRES_IN`: `7d` (optional)

4. **Deploy**:
   - Vercel will automatically detect Next.js and deploy
   - The build will run automatically on every push to your main branch

### Environment Variables for Vercel

Make sure to set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://[username]:[password]@[cluster].mongodb.net/[dbname]` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | `https://your-app.vercel.app` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a strong random string |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |

## Project Structure

```
movie-watchlist/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   ├── dashboard/        # Dashboard page
│   ├── lib/              # Utility functions
│   ├── models/           # MongoDB models
│   └── page.tsx          # Home page
├── components/            # Shared UI components
├── lib/                  # Shared utilities
├── models/               # Database models
├── types/                # TypeScript types
└── public/               # Static files
```

## API Routes

- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user
- `GET /api/movies` - Get all movies
- `POST /api/movies` - Create a movie
- `GET /api/movies/[id]` - Get a movie
- `PUT /api/movies/[id]` - Update a movie
- `DELETE /api/movies/[id]` - Delete a movie
- `GET /api/users` - Get all users (for filtering)
- `POST /api/upload` - Upload movie image

## Features in Detail

### Authentication
- Secure JWT-based authentication
- HttpOnly cookies for token storage
- Password hashing with bcrypt

### Movie Management
- Public viewing: All users can see all movies
- Ownership: Only authors can edit/delete/rate their movies
- Image uploads: Support for movie poster images
- Rich metadata: Title, year, genre, notes, rating

### Filtering & Search
- Filter by user (who registered the movie)
- Filter by genre, year, watched status
- Filter by rating (highly rated movies)
- Search by movie title

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
