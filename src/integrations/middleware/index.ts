/**
 * Server middleware integrations
 * Import from '@nextnode/validation/middleware'
 */

// Core utilities
export {
	createErrorResponse,
	defaultErrorHandler,
	validateData,
} from './core.js'

// Types
export type {
	ErrorHandler,
	ErrorHandlerContext,
	FrameworkAdapter,
	MiddlewareConfig,
	ValidationErrorResponse,
	ValidationTarget,
} from './types.js'

// Hono
export { getValidated, honoValidator } from './hono.js'
export type { HonoValidatorOptions } from './hono.js'

// Express
export { expressValidator } from './express.js'
export type { ExpressValidatorOptions } from './express.js'

// Fastify
export { fastifyValidator } from './fastify.js'
export type { FastifyValidatorOptions } from './fastify.js'
