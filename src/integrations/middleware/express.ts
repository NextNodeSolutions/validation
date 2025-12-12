/**
 * Express middleware adapter
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { type } from '@nextnode/validation'
 * import { expressValidator } from '@nextnode/validation/middleware/express'
 *
 * const app = express()
 * app.use(express.json())
 *
 * const userSchema = type({
 *   email: 'string.email',
 *   name: 'string >= 1'
 * })
 *
 * app.post('/users', expressValidator('body', userSchema), (req, res) => {
 *   const user = req.validated
 *   res.json({ user })
 * })
 * ```
 */

import type { Type } from 'arktype'

import type { Schema, ValidationIssue } from '../../lib/core/types.js'
import { createErrorResponse, validateData } from './core.js'
import type { ValidationTarget } from './types.js'

/**
 * Express-specific options
 */
export interface ExpressValidatorOptions {
	/**
	 * Custom error handler
	 */
	onError?: (
		issues: readonly ValidationIssue[],
		req: ExpressRequest,
		res: ExpressResponse,
		next: ExpressNextFunction,
	) => void
	/**
	 * Property to attach validated data to
	 * @default 'validated'
	 */
	attachTo?: string
}

/**
 * Minimal Express Request interface
 */
interface ExpressRequest {
	body: unknown
	query: Record<string, unknown>
	params: Record<string, string>
	headers: Record<string, string | string[] | undefined>
	[key: string]: unknown
}

/**
 * Minimal Express Response interface
 */
interface ExpressResponse {
	status: (code: number) => ExpressResponse
	json: (data: unknown) => void
}

/**
 * Express next function
 */
type ExpressNextFunction = (error?: unknown) => void

/**
 * Express middleware handler type
 */
type ExpressMiddleware = (
	req: ExpressRequest,
	res: ExpressResponse,
	next: ExpressNextFunction,
) => void

/**
 * Get request data based on target
 */
const getRequestData = (
	req: ExpressRequest,
	target: ValidationTarget,
): unknown => {
	switch (target) {
		case 'body':
			return req.body
		case 'query':
			return req.query
		case 'params':
			return req.params
		case 'headers':
			return req.headers
		default:
			return {}
	}
}

/**
 * Creates Express validation middleware
 */
export const expressValidator = <T>(
	target: ValidationTarget,
	schema: Type<T> | Schema<T>,
	options: ExpressValidatorOptions = {},
): ExpressMiddleware => {
	const { attachTo = 'validated' } = options

	return (req, res, next) => {
		const data = getRequestData(req, target)
		const result = validateData(schema, data)

		if (!result.success) {
			if (options.onError) {
				options.onError(result.issues, req, res, next)
				return
			}

			res.status(400).json(createErrorResponse(result.issues))
			return
		}

		// Attach validated data to request
		req[attachTo] = result.data

		// Also update the original target with validated data
		if (target === 'body') {
			req.body = result.data
		}

		next()
	}
}
