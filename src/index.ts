/**
 * @nextnode/validation
 * TypeScript validation library powered by ArkType
 */

// Re-export ArkType's type function for direct use
export { type } from 'arktype'
export type { Type } from 'arktype'

// Core validation engine
export * from './lib/index.js'

// Utility exports (logger)
export * from './utils/index.js'
