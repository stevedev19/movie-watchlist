# Fix 500 Error Instructions

## Issue Found
Your `MONGODB_URI` in `.env.local` is commented out (starts with `#`).

## Quick Fix

1. **Open `.env.local` file** in your editor

2. **Find this line:**
   ```
   # MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/<DB_NAME>?retryWrites=true&w=majority
   ```

3. **Remove the `#` at the beginning** so it becomes:
   ```
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/<DB_NAME>?retryWrites=true&w=majority
   ```

4. **Save the file**

5. **Clear browser cache:**
   - Chrome/Edge: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or open DevTools → Network tab → Check "Disable cache"

6. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   rm -rf .next
   npm run dev
   ```

## Verify It's Working

After fixing, you should see:
- ✅ No 500 errors in browser console
- ✅ Page loads correctly
- ✅ Movies can be added (they'll go to MongoDB collections)

## Your Collections

Once connected, your movies will be stored in:
- `movies-to-watch` - Unwatched movies
- `movies-watched` - Watched movies
- `movies-deleted` - Deleted movies (soft delete)

You can view these in MongoDB Atlas or MongoDB Compass.


