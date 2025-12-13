# MongoDB Connection Check

## Your MongoDB URI
Based on your .env.local file, your MongoDB connection string is:
```
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/<DB_NAME>?retryWrites=true&w=majority
```

## Collections Created

Your app is now configured to use these three collections:

1. **movies-to-watch** - For unwatched movies
2. **movies-watched** - For watched movies  
3. **movies-deleted** - For soft-deleted movies

## Verify Connection

To verify your MongoDB connection is working:

1. Make sure your `.env.local` file has:
   ```env
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/<DB_NAME>?retryWrites=true&w=majority
   ```
   (Make sure it's NOT commented with `#`)

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Check MongoDB Atlas to see if collections are created when you add movies

## If You're Getting 500 Errors

1. **Clear browser cache**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Clear Next.js cache**: 
   ```bash
   rm -rf .next
   npm run dev
   ```
3. **Check MongoDB connection**: Make sure your IP is whitelisted in MongoDB Atlas
4. **Check .env.local**: Ensure MONGODB_URI is not commented out

## Testing the Connection

Once logged in, try adding a movie. It should:
- Appear in `movies-to-watch` collection if unwatched
- Appear in `movies-watched` collection if watched
- Move to `movies-deleted` when deleted

