// Server-only provider adapter, also used by the standalone backfill script.
// Keep HTTP formats, credentials, model names and provider errors in this module.
const EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_DIMENSIONS = 768
const ANSWER_MODEL = 'gemini-3.5-flash-lite'
const RATE_LIMIT_MESSAGE = 'Too many requests right now. Please try again in a minute.'

function isProviderConfigured() {
  return !!process.env.GEMINI_API_KEY
}

/** @param {unknown} error */
function isProviderRateLimit(error) {
  return !!error && typeof error === 'object' && 'status' in error && error.status === 429
}

/** @param {string} model @param {string} method @param {object} body */
async function request(model, method, body) {
  if (!isProviderConfigured()) throw new Error('GEMINI_API_KEY is not configured')
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
    cache: 'no-store',
  })
  // Never expose provider bodies, credentials or watchlist content in errors.
  if (!response.ok) {
    const error = new Error(response.status === 429 ? RATE_LIMIT_MESSAGE : `Recommendation provider returned status ${response.status}`)
    throw Object.assign(error, { status: response.status })
  }
  return response.json()
}

/** @param {unknown} value @returns {value is number[]} */
function isEmbedding(value) {
  return Array.isArray(value) && value.length === EMBEDDING_DIMENSIONS &&
    value.every(v => typeof v === 'number' && Number.isFinite(v)) && value.some(v => v !== 0)
}

/** @param {string} input @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType @returns {Promise<number[]>} */
async function createEmbedding(input, taskType = 'RETRIEVAL_DOCUMENT') {
  const result = await request(EMBEDDING_MODEL, 'embedContent', {
    content: { parts: [{ text: input }] }, taskType, outputDimensionality: EMBEDDING_DIMENSIONS,
  })
  const embedding = result.embedding?.values
  if (!isEmbedding(embedding)) throw new Error('Invalid embedding response')
  // Reduced-dimensional gemini-embedding-001 vectors need normalization.
  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0))
  return embedding.map(value => value / norm)
}

/** @param {string} instructions @param {object} input */
async function generateRecommendation(instructions, input) {
  const result = await request(ANSWER_MODEL, 'generateContent', {
    systemInstruction: { parts: [{ text: instructions }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: { movieId: { type: 'STRING', nullable: true }, reason: { type: 'STRING' } },
        required: ['movieId', 'reason'],
      },
    },
  })
  const candidate = result.candidates?.[0]
  if (candidate?.finishReason !== 'STOP') throw new Error('No complete recommendation returned')
  const content = candidate.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('')
  if (!content) throw new Error('No recommendation returned')
  return JSON.parse(content)
}

module.exports = {
  EMBEDDING_MODEL, EMBEDDING_DIMENSIONS, RATE_LIMIT_MESSAGE, isProviderConfigured,
  isProviderRateLimit, isEmbedding, createEmbedding, generateRecommendation,
}
