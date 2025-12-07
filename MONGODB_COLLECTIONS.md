# MongoDB Collections Structure

Your Movie Watchlist app now uses three separate MongoDB collections:

## Collections

### 1. `movies-to-watch`
- **Purpose**: Stores movies that haven't been watched yet
- **Schema**: 
  - title (required)
  - year, genre, notes (optional)
  - watched: false (always)
  - createdAt, userId (required)
  - watchedAt (optional)

### 2. `movies-watched`
- **Purpose**: Stores movies that have been watched
- **Schema**:
  - title (required)
  - year, genre, notes (optional)
  - rating (1-5, optional)
  - watched: true (always)
  - createdAt, watchedAt, userId (required)

### 3. `movies-deleted`
- **Purpose**: Soft delete - stores deleted movies for recovery
- **Schema**:
  - All fields from original movie
  - deletedAt (required) - timestamp when deleted
  - userId (required)

## How It Works

### Adding Movies
- New movies with `watched: false` → Added to `movies-to-watch`
- New movies with `watched: true` → Added to `movies-watched`

### Updating Movies
- Updating watched status from `false` to `true`:
  - Movie is moved from `movies-to-watch` → `movies-watched`
  - `watchedAt` timestamp is set
- Updating watched status from `true` to `false`:
  - Movie is moved from `movies-watched` → `movies-to-watch`
  - `watchedAt` is cleared

### Deleting Movies
- Movies are **soft deleted** (not permanently removed)
- Movie is copied to `movies-deleted` collection
- Original movie is removed from `movies-to-watch` or `movies-watched`
- `deletedAt` timestamp is added

### Fetching Movies
- GET `/api/movies` fetches from both `movies-to-watch` and `movies-watched`
- Returns combined list sorted by creation date
- Deleted movies are NOT included in regular queries

## API Endpoints

### GET /api/movies
- Returns all movies from both `movies-to-watch` and `movies-watched`
- Requires `x-user-id` header

### POST /api/movies
- Creates a new movie
- Automatically adds to correct collection based on `watched` status
- Requires `x-user-id` header

### GET /api/movies/[id]
- Gets a single movie
- Searches both collections
- Requires `x-user-id` header

### PUT /api/movies/[id]
- Updates a movie
- Automatically moves between collections if watched status changes
- Requires `x-user-id` header

### DELETE /api/movies/[id]
- Soft deletes a movie (moves to `movies-deleted`)
- Requires `x-user-id` header

## Benefits

1. **Better Organization**: Movies are automatically organized by status
2. **Soft Delete**: Deleted movies can be recovered if needed
3. **Performance**: Queries can target specific collections
4. **Data Integrity**: Clear separation of movie states

## Viewing Collections in MongoDB

You can view your collections using:
- MongoDB Compass
- MongoDB Shell (`mongo` or `mongosh`)
- Any MongoDB GUI tool

```javascript
// In MongoDB Shell
use movie-watchlist
db.getCollectionNames() // Shows: movies-to-watch, movies-watched, movies-deleted

// View documents
db['movies-to-watch'].find()
db['movies-watched'].find()
db['movies-deleted'].find()
```


