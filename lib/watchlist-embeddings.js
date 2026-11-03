// Shared by server routes and the standalone backfill script. Never import into client code.
const { EMBEDDING_MODEL, isEmbedding, createEmbedding } = require('./watchlist-provider')

/** @param {{ title: string, genre?: string, genres?: string[], overview?: string }} movie */
function movieEmbeddingText(movie) {
  return `Title: ${movie.title.trim().slice(0, 300)}\nGenres: ${[movie.genre, ...(movie.genres || [])].filter(Boolean).join(', ').slice(0, 1000)}\nOverview: ${(movie.overview || '').slice(0, 2000)}`
}

/** @param {number[]} a @param {number[]} b */
function cosineSimilarity(a, b) {
  if (!a.length || a.length !== b.length) return -Infinity
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) return -Infinity
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : -Infinity
}

module.exports = { EMBEDDING_MODEL, movieEmbeddingText, isEmbedding, createEmbedding, cosineSimilarity }
