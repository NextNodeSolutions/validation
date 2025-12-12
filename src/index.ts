/**
 * @nextnode/validation
 * TypeScript validation library powered by ArkType
 *
 * @example
 * ```typescript
 * import { type, v, schemas } from '@nextnode/validation'
 *
 * // Direct ArkType usage
 * const userSchema = type({
 *   email: 'string.email',
 *   age: 'number >= 0'
 * })
 *
 * // Using validation engine
 * const schema = v.object({ email: schemas.email })
 * const result = schema.safeParse(data)
 *
 * // Using pre-built schemas
 * const { email, url, uuid } = schemas
 * ```
 */

// Re-export ArkType's type function for direct use
export { type } from 'arktype'
export type { Type } from 'arktype'

// Core validation engine (includes types, schemas, and errors)
export * from './lib/index.js'
