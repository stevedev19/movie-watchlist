// Uses the same environment loading and embedding implementation as the app.
require('@next/env').loadEnvConfig(process.cwd(), true)
const mongoose = require('mongoose')
const { isProviderConfigured } = require('../lib/watchlist-provider')
const { EMBEDDING_MODEL, createEmbedding, movieEmbeddingText } = require('../lib/watchlist-embeddings')

async function main() {
  if (!process.env.MONGODB_URI || !isProviderConfigured()) {
    throw new Error('Set MONGODB_URI and GEMINI_API_KEY in .env.local before running the backfill.')
  }
  await mongoose.connect(process.env.MONGODB_URI)
  let updated = 0
  // Always regenerate every movie, including embeddings from the current model.
  for (const name of ['movies-to-watch', 'movies-watched']) {
    const collection = mongoose.connection.collection(name)
    const cursor = collection.find({}, { projection: { title: 1, genre: 1, genres: 1, overview: 1, embedding: 1, embeddingModel: 1 } })
    for await (const movie of cursor) {
      const embedding = await createEmbedding(movieEmbeddingText(movie))
      // If metadata changed during the request, leave it for a subsequent run.
      const result = await collection.updateOne(
        { _id: movie._id, title: movie.title, genre: movie.genre ?? null, genres: movie.genres ?? null, overview: movie.overview ?? null },
        { $set: { embedding, embeddingModel: EMBEDDING_MODEL } }
      )
      updated += result.modifiedCount
    }
    console.log(`Finished ${name}.`)
  }
  console.log(`Created embeddings for ${updated} movies.`)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
}).finally(() => mongoose.disconnect())
