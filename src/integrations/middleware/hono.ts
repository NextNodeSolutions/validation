/**
 * Hono middleware adapter
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono'
 * import { type } from '@nextnode/validation'
 * import { honoValidator } from '@nextnode/validation/middleware/hono'
 *
 * const app = new Hono()
 *
 * const userSchema = type({
 *   email: 'string.email',
 *   name: 'string >= 1'
 * })
 *
 * app.post('/users', honoValidator('body', userSchema), (c) => {
 *   const user = c.get('validated')
 *   return c.json({ user })
 * })
 * ```
 */

import type { Type } from 'arktype'

import type { Schema, ValidationIssue } from '../../lib/core/types.js'
import { createErrorResponse, validateData } from './core.js'
import type { ValidationTarget } from './types.js'

/**
 * Hono-specific options
 */
export interface HonoValidatorOptions {
	/**
	 * Custom error handler
	 * Return a Response to override the default error response
	 */
	onError?: (
		issues: readonly ValidationIssue[],
		c: HonoContext,
	) => Response | undefined
}

/**
 * Minimal Hono Context interface (to avoid importing hono as dependency)
 */
interface HonoContext {
	req: {
		json: () => Promise<unknown>
		query: () => Record<string, string>
		param: () => Record<string, string>
		raw: { headers: Headers }
	}
	json: (data: unknown, status?: number) => Response
	get: (key: string) => unknown
	set: (key: string, value: unknown) => void
}

/**
 * Hono middleware handler type
 */
type HonoMiddleware = (
	c: HonoContext,
	next: () => Promise<void>,
) => Promise<Response | undefined> | undefined

/**
 * Symbol used to indicate malformed JSON body
 */
const INVALID_JSON = Symbol.for('invalid_json')

/**
 * Get request data based on target
 */
const getRequestData = async (
	c: HonoContext,
	target: ValidationTarget,
): Promise<unknown> => {
	switch (target) {
		case 'body':
			return c.req.json().catch(() => INVALID_JSON)
		case 'query':
			return c.req.query()
		case 'params':
			return c.req.param()
		case 'headers':
			return Object.fromEntries(c.req.raw.headers.entries())
		default:
			return {}
	}
}

/**
 * Handle validation errors with optional custom handler
 */
const handleValidationError = (
	issues: readonly ValidationIssue[],
	c: HonoContext,
	options: HonoValidatorOptions,
): Response => {
	if (options.onError) {
		const customResponse = options.onError(issues, c)
		if (customResponse) return customResponse
	}
	return c.json(createErrorResponse(issues), 400)
}

/**
 * Creates Hono validation middleware
 */
export const honoValidator =
	<T>(
		target: ValidationTarget,
		schema: Type<T> | Schema<T>,
		options: HonoValidatorOptions = {},
	): HonoMiddleware =>
	async (c, next): Promise<Response | undefined> => {
		const data = await getRequestData(c, target)

		// Handle malformed JSON body
		if (data === INVALID_JSON) {
			return handleValidationError(
				[{ path: [], code: 'invalid_json' }],
				c,
				options,
			)
		}

		const result = validateData(schema, data)

		if (!result.success) {
			return handleValidationError(result.issues, c, options)
		}

		// Store validated data for retrieval in handler
		c.set('validated', result.data)
		c.set(`validated_${target}`, result.data)

		await next()
		return undefined
	}

/**
 * Helper to get validated data in route handlers
 */
export const getValidated = <T>(
	c: HonoContext,
	target?: ValidationTarget,
): T => {
	if (target) {
		return c.get(`validated_${target}`) as T
	}
	return c.get('validated') as T
}
