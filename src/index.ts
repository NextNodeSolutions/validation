/**
 * @nextnode/validation
 * A TypeScript validation library powered by ArkType for comprehensive input validation on both frontend and backend in NextNode projects
 */

// Core ArkType re-export for direct usage
export { type } from 'arktype'

// Type exports
export type * from './types/index.js'

// Error handling exports
export * from './errors/formatter.js'

// Common validators
export * from './validators/common.js'

// Domain validators  
export * from './validators/domain.js'

// Advanced patterns - conditional
export {
  validateIf,
  requireAtLeastOne,
  requireExactlyOne,
  requireWhen,
  validateBasedOnField,
  validateProjectSettings,
  validateDeploymentConfig,
  validateAPIKeyPermissions as validateConditionalAPIKeyPermissions
} from './patterns/conditional.js'

// Advanced patterns - async
export {
  withCache,
  validateUniqueUsername,
  validateEmailDomain,
  validateUniqueProjectSlug,
  validateAPIKeyPermissions as validateAsyncAPIKeyPermissions,
  validateWebhookURL,
  combineAsyncValidators,
  clearValidationCache,
  getCacheStats
} from './patterns/async.js'

// Advanced patterns - transforms
export * from './patterns/transforms.js'

// Utility exports
export * from './utils/logger.js'
