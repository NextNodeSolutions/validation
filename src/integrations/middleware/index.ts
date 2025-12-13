/**
 * Server middleware integrations
 * Import from '@nextnode/validation/middleware'
 */

// Core utilities
export { createErrorResponse, validateData } from './core.js'
export type { ExpressValidatorOptions } from './express.js'
// Express
export { expressValidator } from './express.js'
export type { FastifyValidatorOptions } from './fastify.js'
// Fastify
export { fastifyValidator } from './fastify.js'
export type { HonoValidatorOptions } from './hono.js'
// Hono
export { getValidated, honoValidator } from './hono.js'
// Types
export type {
	ErrorHandler,
	ErrorHandlerContext,
	FrameworkAdapter,
	MiddlewareConfig,
	ValidationErrorResponse,
	ValidationTarget,
} from './types.js'
