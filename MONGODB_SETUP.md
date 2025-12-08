# MongoDB Setup Guide

This guide will help you connect your Movie Watchlist app to MongoDB.

## Prerequisites

1. MongoDB installed locally OR a MongoDB Atlas account
2. Node.js and npm installed

## Setup Options

### Option 1: Local MongoDB

1. Install MongoDB locally:
   - macOS: `brew install mongodb-community`
   - Windows: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - Linux: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. Start MongoDB:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod --config /usr/local/etc/mongod.conf
   ```

3. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/movie-watchlist
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster (choose the free tier)

3. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password

4. Whitelist your IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add `0.0.0.0/0` for development (or your specific IP)

5. Get your connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-watchlist?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your database user credentials.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your-connection-string-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Switching to MongoDB

The app currently uses localStorage. To switch to MongoDB:

1. Update `app/page.tsx` to use MongoDB storage:
   ```typescript
   // Change this:
   import { loadMovies, saveMovies, ... } from '@/app/lib/storage'
   
   // To this:
   import { loadMovies, saveMovies, ... } from '@/app/lib/storage-mongodb'
   ```

2. Make sure your MongoDB connection is working:
   ```bash
   npm run dev
   ```

3. Check the console for any connection errors.

## API Routes

The app includes API routes for MongoDB operations:

- `GET /api/movies` - Get all movies for a user
- `POST /api/movies` - Create a new movie
- `GET /api/movies/[id]` - Get a single movie
- `PUT /api/movies/[id]` - Update a movie
- `DELETE /api/movies/[id]` - Delete a movie

All routes require a `x-user-id` header for authentication.

## Troubleshooting

### Connection Refused
- Make sure MongoDB is running (for local setup)
- Check your connection string is correct
- Verify network access (for Atlas)

### Authentication Failed
- Verify your database username and password
- Check IP whitelist settings (for Atlas)

### Module Not Found
- Run `npm install` to ensure mongoose is installed

## Models

The app uses two MongoDB models:

1. **Movie** - Stores movie data with user association
2. **User** - Stores user authentication data

Both models are defined in `app/models/`.



