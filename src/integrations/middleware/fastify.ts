/**
 * Fastify middleware adapter
 *
 * @example
 * ```typescript
 * import Fastify from 'fastify'
 * import { type } from '@nextnode/validation'
 * import { fastifyValidator } from '@nextnode/validation/middleware/fastify'
 *
 * const fastify = Fastify()
 *
 * const userSchema = type({
 *   email: 'string.email',
 *   name: 'string >= 1'
 * })
 *
 * fastify.post('/users', {
 *   preHandler: fastifyValidator('body', userSchema)
 * }, (request, reply) => {
 *   const user = request.validated
 *   reply.send({ user })
 * })
 * ```
 */

import { createErrorResponse, validateData } from './core.js'

import type { Type } from 'arktype'
import type { Schema, ValidationIssue } from '../../lib/core/types.js'
import type { ValidationTarget } from './types.js'

/**
 * Fastify-specific options
 */
export interface FastifyValidatorOptions {
	/**
	 * Custom error handler
	 */
	onError?: (
		issues: readonly ValidationIssue[],
		request: FastifyRequest,
		reply: FastifyReply,
	) => void
}

/**
 * Minimal Fastify Request interface
 */
interface FastifyRequest {
	body: unknown
	query: Record<string, unknown>
	params: Record<string, string>
	headers: Record<string, string | undefined>
	[key: string]: unknown
}

/**
 * Minimal Fastify Reply interface
 */
interface FastifyReply {
	code: (statusCode: number) => FastifyReply
	send: (data: unknown) => void
}

/**
 * Fastify preHandler hook type
 */
type FastifyPreHandler = (
	request: FastifyRequest,
	reply: FastifyReply,
) => Promise<void>

/**
 * Get request data based on target
 */
const getRequestData = (
	request: FastifyRequest,
	target: ValidationTarget,
): unknown => {
	switch (target) {
		case 'body':
			return request.body
		case 'query':
			return request.query
		case 'params':
			return request.params
		case 'headers':
			return request.headers
		default:
			return {}
	}
}

/**
 * Creates Fastify preHandler hook for validation
 */
export const fastifyValidator =
	<T>(
		target: ValidationTarget,
		schema: Type<T> | Schema<T>,
		options: FastifyValidatorOptions = {},
	): FastifyPreHandler =>
	async (request, reply) => {
		const data = getRequestData(request, target)
		const result = validateData(schema, data)

		if (!result.success) {
			if (options.onError) {
				options.onError(result.issues, request, reply)
				return
			}

			reply.code(400).send(createErrorResponse(result.issues))
			return
		}

		// Attach validated data to request
		request.validated = result.data
	}
