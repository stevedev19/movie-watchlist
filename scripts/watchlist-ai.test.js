const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const embeddings = require('../lib/watchlist-embeddings')
const provider = require('../lib/watchlist-provider')

// Execute the real route/service with isolated DB, auth and provider substitutes.
function loadTS(path, imports, env = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const context = { exports: {}, require: name => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
    return imports[name]
  }, process: { env }, ...globals }
  vm.runInNewContext(source, context)
  return context.exports
}

const vector = score => [score, Math.sqrt(1 - score * score), ...Array(provider.EMBEDDING_DIMENSIONS - 2).fill(0)]

function askHarness({ user = { userId: 'owner' }, movies = [], fail = false, answerFailure = false, quota = { allowed: true, retryAfter: 60, remaining: 9 }, recommendation = { movieId: '6', reason: 'A recommendation' } } = {}) {
  const calls = { filters: [], questions: [], candidates: [], quotaUsers: [] }
  const route = loadTS('app/api/ask/route.ts', {
    'next/server': { NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200, headers: options.headers }) } },
    '@/app/lib/ask-rate-limit': { consumeAskQuota: async userId => { calls.quotaUsers.push(userId); return quota }, getAskQuota: async () => ({ remaining: 8, resetsAt: 7200000 }) },
    '@/lib/auth': { getUserFromRequestCookie: () => user },
    '@/app/lib/mongodb': async () => {},
    '@/app/models/MovieToWatch': { find: filter => {
      calls.filters.push(filter)
      return { select: () => ({ lean: async () => movies }) }
    } },
    '@/lib/watchlist-embeddings': { ...embeddings, createEmbedding: async question => {
      calls.questions.push(question)
      if (fail) throw fail === true ? new Error('provider failed') : fail
      return vector(1)
    } },
    '@/app/lib/watchlist-ai': { ...provider, isProviderConfigured: () => true, recommendMovie: async (_, candidates) => {
      if (answerFailure) throw answerFailure
      calls.candidates = candidates
      return recommendation
    } },
  }, { GEMINI_API_KEY: 'test-only', MONGODB_URI: 'test-only' })
  return { calls, get: () => route.GET(), post: body => route.POST({ json: async () => body }) }
}

test('cosine similarity handles direction, invalid vectors and zero norms', () => {
  assert.equal(embeddings.cosineSimilarity([1, 0], [2, 0]), 1)
  assert.equal(embeddings.cosineSimilarity([1, 0], [0, 1]), 0)
  assert.equal(embeddings.cosineSimilarity([1], [-1]), -1)
  for (const pair of [[[0], [1]], [[1], []], [[NaN], [1]]]) {
    assert.equal(embeddings.cosineSimilarity(...pair), -Infinity)
  }
})

test('embedding text includes title, legacy genre, genres and overview', () => {
  const text = embeddings.movieEmbeddingText({ title: ' Movie ', genre: 'Comedy', genres: ['Adventure'], overview: 'A funny journey.' })
  assert.match(text, /Title: Movie\nGenres: Comedy, Adventure\nOverview: A funny journey\./)
  assert.equal(embeddings.isEmbedding(vector(1)), true)
  assert.equal(embeddings.isEmbedding([1]), false)
  assert.equal(embeddings.isEmbedding(Array(provider.EMBEDDING_DIMENSIONS).fill(0)), false)
})

test('ask rejects unauthenticated users and invalid questions without querying movies', async () => {
  const guest = askHarness({ user: null })
  assert.equal((await guest.post({ question: 'funny?' })).status, 401)
  assert.equal(guest.calls.filters.length, 0)
  const owner = askHarness()
  for (const body of [null, {}, { question: '' }, { question: 42 }, { question: 'x'.repeat(1001) }]) {
    assert.equal((await owner.post(body)).status, 400)
  }
  assert.equal(owner.calls.filters.length, 0)
})

test('ask scopes retrieval to owner Soon list and sends only top five without embeddings', async () => {
  const movies = Array.from({ length: 7 }, (_, index) => ({
    _id: String(index), title: `Movie ${index}`, runtime: 80 + index,
    embedding: vector(index / 10), embeddingModel: embeddings.EMBEDDING_MODEL,
  }))
  const harness = askHarness({ movies })
  assert.equal((await harness.post({ question: '  short and funny  ' })).status, 200)
  assert.deepEqual(JSON.parse(JSON.stringify(harness.calls.filters)), [{ userId: 'owner', watched: false }])
  assert.deepEqual(harness.calls.questions, ['short and funny'])
  assert.deepEqual(Array.from(harness.calls.candidates, movie => movie.id), ['6', '5', '4', '3', '2'])
  assert.equal(harness.calls.candidates[0].runtime, 86)
  assert.equal('embedding' in harness.calls.candidates[0], false)
})

test('empty list skips provider; missing embeddings and provider failures are actionable', async () => {
  const empty = askHarness()
  assert.equal((await empty.post({ question: 'funny?' })).data.status, 'empty')
  assert.equal(empty.calls.questions.length, 0)
  const missing = askHarness({ movies: [{ title: 'Legacy' }] })
  assert.equal((await missing.post({ question: 'funny?' })).status, 503)
  const failed = askHarness({ fail: true, movies: [{ embedding: vector(1), embeddingModel: embeddings.EMBEDDING_MODEL }] })
  assert.equal((await failed.post({ question: 'funny?' })).status, 502)
})

test('LLM recommendation validates movie membership and supports no match', async () => {
  let output = { movieId: 'one', reason: 'Its stored runtime is 80 minutes.' }
  let payload
  const service = loadTS('app/lib/watchlist-ai.ts', {
    'server-only': {},
    '@/lib/watchlist-embeddings': embeddings,
    '@/lib/watchlist-provider': { ...provider, generateRecommendation: async (instructions, input) => {
      payload = { instructions, input }
      return output
    } },
  })
  const movies = [{ id: 'one', title: 'My Movie', runtime: 80 }]
  assert.equal((await service.recommendMovie('Short?', movies)).movieId, 'one')
  assert.match(payload.instructions, /ONLY the supplied Soon movies/)
  assert.deepEqual(JSON.parse(JSON.stringify(payload.input)), { question: 'Short?', movies })
  output = { movieId: 'outside', reason: 'An unrelated title.' }
  assert.deepEqual(JSON.parse(JSON.stringify(await service.recommendMovie('Short?', movies))), { movieId: null, reason: '' })
  output = { movieId: null, reason: 'None of these movies fits.' }
  assert.deepEqual(JSON.parse(JSON.stringify(await service.recommendMovie('Short?', movies))), { movieId: null, reason: '' })
})

test('ask returns friendly 429 errors for embedding and answer provider limits', async () => {
  const movies = [{ _id: 'one', title: 'Movie', embedding: vector(1), embeddingModel: embeddings.EMBEDDING_MODEL }]
  const error = Object.assign(new Error('private provider details'), { status: 429 })
  for (const options of [{ fail: error }, { answerFailure: error }]) {
    const harness = askHarness({ movies, ...options })
    const response = await harness.post({ question: 'funny?' })
    assert.equal(response.status, 429)
    assert.equal(response.headers['Retry-After'], '60')
    assert.match(response.data.error, /try again in a minute/)
    assert.doesNotMatch(response.data.error, /private provider details/)
  }
})

test('ask blocks exhausted user quota before retrieving movies or calling Gemini', async () => {
  const harness = askHarness({ quota: { allowed: false, retryAfter: 120 } })
  const response = await harness.post({ question: 'funny?' })
  assert.equal(response.status, 429)
  assert.equal(response.headers['Retry-After'], '120')
  assert.match(response.data.error, /10 questions this hour/)
  assert.deepEqual(harness.calls.quotaUsers, ['owner'])
  assert.equal(harness.calls.filters.length, 0)
  assert.equal(harness.calls.questions.length, 0)
})

test('ask rejects old-provider embeddings even when vector dimensions match', async () => {
  const harness = askHarness({ movies: [{ embedding: vector(1), embeddingModel: 'text-embedding-3-small' }] })
  assert.equal((await harness.post({ question: 'funny?' })).status, 503)
  assert.equal(harness.calls.questions.length, 0)
})

test('Gemini adapter sends server header, correct retrieval tasks, normalized vectors and structured answers', async () => {
  const originalFetch = global.fetch
  const originalKey = process.env.GEMINI_API_KEY
  const calls = []
  process.env.GEMINI_API_KEY = 'test-secret'
  global.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) })
    return { ok: true, json: async () => url.endsWith(':embedContent')
      ? { embedding: { values: [2, ...Array(provider.EMBEDDING_DIMENSIONS - 1).fill(0)] } }
      : { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"movieId":null,"reason":"No fit."}' }] } }] } }
  }
  try {
    assert.equal((await provider.createEmbedding('Movie'))[0], 1)
    await provider.createEmbedding('Question?', 'RETRIEVAL_QUERY')
    assert.deepEqual(await provider.generateRecommendation('Only these movies.', { movies: [] }), { movieId: null, reason: 'No fit.' })
    assert.equal(calls[0].body.taskType, 'RETRIEVAL_DOCUMENT')
    assert.equal(calls[1].body.taskType, 'RETRIEVAL_QUERY')
    assert.equal(calls[0].body.outputDimensionality, provider.EMBEDDING_DIMENSIONS)
    assert.match(calls[0].url, /generativelanguage\.googleapis\.com.*gemini-embedding-001:embedContent$/)
    assert.match(calls[2].url, /:generateContent$/)
    assert.equal(calls[2].body.generationConfig.responseMimeType, 'application/json')
    for (const call of calls) {
      assert.equal(call.options.headers['x-goog-api-key'], 'test-secret')
      assert.equal(call.url.includes('test-secret'), false)
    }
    global.fetch = async () => ({ ok: false, status: 429 })
    for (const action of [() => provider.createEmbedding('Question'), () => provider.generateRecommendation('Only these.', {})]) {
      await assert.rejects(action(), error => provider.isProviderRateLimit(error) && /try again in a minute/.test(error.message))
    }
    global.fetch = async () => ({ ok: true, json: async () => ({ embedding: { values: [NaN] } }) })
    await assert.rejects(provider.createEmbedding('Question'), /Invalid embedding/)
  } finally {
    global.fetch = originalFetch
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalKey
  }
})

// Minimal Mongo expression evaluator for exercising the actual atomic quota update.
function evaluate(value, doc) {
  if (typeof value === 'string' && value.startsWith('$')) return doc[value.slice(1)]
  if (Array.isArray(value)) return value.map(item => evaluate(item, doc))
  if (!value || typeof value !== 'object') return value
  const [[operator, args]] = Object.entries(value)
  if (operator === '$cond') return evaluate(args[evaluate(args[0], doc) ? 1 : 2], doc)
  const values = evaluate(args, doc)
  if (operator === '$eq') return values[0] === values[1]
  if (operator === '$add') return values.reduce((a, b) => a + b, 0)
  if (operator === '$min') return Math.min(...values)
  throw new Error(`Unsupported Mongo operator ${operator}`)
}

test('Mongo quota allows ten per user, survives module reloads, handles races and resets next hour', async () => {
  const docs = new Map()
  let now = 60 * 60 * 1000 + 10000
  let race = true
  const collection = { findOne: async filter => docs.get(filter._id) || null, findOneAndUpdate: async (filter, update, options) => {
    if (race) { race = false; throw Object.assign(new Error('upsert race'), { code: 11000 }) }
    const doc = docs.get(filter._id) || { _id: filter._id }
    const next = { ...doc }
    for (const [key, expression] of Object.entries(update[0].$set)) next[key] = evaluate(expression, doc)
    docs.set(filter._id, next)
    assert.equal(options.returnDocument, 'after')
    return next
  } }
  function instance() {
    return loadTS('app/lib/ask-rate-limit.ts', {
      'server-only': {}, mongoose: { connection: { collection: name => {
        assert.equal(name, 'ask-rate-limits')
        return collection
      } } },
    }, {}, { Date: class extends Date { static now() { return now } } })
  }
  const first = instance(), second = instance()
  assert.equal((await first.getAskQuota('owner')).remaining, 10)
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? first : second).consumeAskQuota('owner')))
  assert.equal(results.filter(result => result.allowed).length, 10)
  assert.equal((await second.getAskQuota('owner')).remaining, 0)
  assert.equal((await second.consumeAskQuota('another-user')).allowed, true)
  assert.equal((await instance().consumeAskQuota('owner')).allowed, false)
  now += 60 * 60 * 1000
  assert.equal((await first.getAskQuota('owner')).remaining, 10)
  assert.equal((await first.consumeAskQuota('owner')).allowed, true)
})

test('backfill regenerates every movie in both lists, including current Gemini embeddings', async () => {
  const updated = []
  let embedded = 0
  let finish
  const done = new Promise(resolve => { finish = resolve })
  const currentMovie = { _id: 'current', title: 'Current', embeddingModel: provider.EMBEDDING_MODEL, embedding: vector(1) }
  const oldMovie = { _id: 'old', title: 'Old', embeddingModel: 'text-embedding-3-small' }
  const fakeMongoose = {
    connect: async () => {}, disconnect: async () => finish(),
    connection: { collection: name => ({
      find: async function* () { yield currentMovie; yield oldMovie },
      updateOne: async (filter, update) => { updated.push({ name, filter, update }); return { modifiedCount: 1 } },
    }) },
  }
  vm.runInNewContext(fs.readFileSync('scripts/backfill-embeddings.js', 'utf8'), {
    process: { cwd: () => '.', env: { MONGODB_URI: 'test' } },
    console: { log: () => {}, error: message => assert.fail(message) },
    require: name => ({
      '@next/env': { loadEnvConfig: () => {} }, mongoose: fakeMongoose,
      '../lib/watchlist-provider': { isProviderConfigured: () => true },
      '../lib/watchlist-embeddings': { ...embeddings, createEmbedding: async () => { embedded++; return vector(1) } },
    })[name],
  })
  await done
  assert.equal(embedded, 4)
  assert.equal(updated.length, 4)
  assert.deepEqual([...new Set(updated.map(item => item.name))], ['movies-to-watch', 'movies-watched'])
  assert.ok(updated.every(item => item.update.$set.embeddingModel === provider.EMBEDDING_MODEL))
})

test('funny cannot recommend Ted Lasso or any ID outside the retrieved Soon movies', async () => {
  const movies = [{ _id: 'soon-comedy', title: 'My Comedy', year: 2020, imageUrl: '/poster.jpg', embedding: vector(1), embeddingModel: embeddings.EMBEDDING_MODEL }]
  for (const movieId of ['ted-lasso', null]) {
    const harness = askHarness({ movies, recommendation: { movieId, reason: 'Watch Ted Lasso!' } })
    const response = await harness.post({ question: 'funny' })
    assert.equal(response.status, 200)
    assert.equal(response.data.status, 'no_match')
    assert.equal(response.data.movie, null)
    assert.doesNotMatch(JSON.stringify(response.data), /Ted Lasso/)
    assert.equal(response.data.remaining, 9)
  }
  const matched = askHarness({ movies, recommendation: { movieId: 'soon-comedy', reason: 'A funny story.' } })
  const response = await matched.post({ question: 'funny' })
  assert.equal(response.data.status, 'match')
  assert.equal(response.data.movie.title, 'My Comedy')
  assert.equal(response.data.movie.imageUrl, '/poster.jpg')
  assert.equal(response.data.movie.year, 2020)
  assert.equal(response.data.reason, 'A funny story.')
})

test('quota GET is authenticated and does not consume questions', async () => {
  assert.equal((await askHarness({ user: null }).get()).status, 401)
  const harness = askHarness()
  const response = await harness.get()
  assert.equal(response.status, 200)
  assert.equal(response.data.remaining, 8)
  assert.equal(harness.calls.quotaUsers.length, 0)
})

test('a movie outside the top five is rejected even if it is in Soon', async () => {
  const movies = Array.from({ length: 6 }, (_, i) => ({
    _id: String(i), title: `Movie ${i}`, embedding: vector(i / 10), embeddingModel: embeddings.EMBEDDING_MODEL,
  }))
  const harness = askHarness({ movies, recommendation: { movieId: '0', reason: 'Unretrieved recommendation.' } })
  const response = await harness.post({ question: 'funny' })
  assert.equal(response.data.status, 'no_match')
  assert.equal(response.data.movie, null)
  assert.doesNotMatch(JSON.stringify(response.data), /Unretrieved recommendation/)
})
