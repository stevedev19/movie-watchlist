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
