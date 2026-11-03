// Internal fields: excluded from normal queries and never returned in movie API responses.
export interface MovieEmbeddingFields {
  embedding?: number[]
  embeddingModel?: string
}

export const embeddingSchemaFields = {
  embedding: { type: [Number], default: undefined, select: false },
  embeddingModel: { type: String, select: false },
}
