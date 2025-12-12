/**
 * Server middleware tests
 */

import { describe, it, expect, vi } from 'vitest'
import { type } from 'arktype'

import {
	validateData,
	createErrorResponse,
} from '../integrations/middleware/core.js'
import { expressValidator } from '../integrations/middleware/express.js'
import { fastifyValidator } from '../integrations/middleware/fastify.js'
import { honoValidator, getValidated } from '../integrations/middleware/hono.js'
import { v } from '../lib/core/engine.js'

describe('Server Middleware', () => {
	describe('Core Functions', () => {
		describe('validateData', () => {
			it('should validate with ArkType schema', () => {
				const schema = type({ name: 'string' })
				const result = validateData(schema, { name: 'John' })

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data).toEqual({ name: 'John' })
				}
			})

			it('should validate with Schema wrapper', () => {
				const schema = v.object<{ name: string }>({ name: 'string' })
				const result = validateData(schema, { name: 'John' })

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data).toEqual({ name: 'John' })
				}
			})

			it('should return issues for invalid data', () => {
				const schema = type({ email: 'string.email' })
				const result = validateData(schema, { email: 'invalid' })

				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.issues.length).toBeGreaterThan(0)
				}
			})
		})

		describe('createErrorResponse', () => {
			it('should create structured error response', () => {
				const issues = [
					{
						path: ['email'],
						code: 'invalid_format',
						message: 'Invalid email',
					},
				]
				const response = createErrorResponse(issues)

				expect(response.success).toBe(false)
				expect(response.error.code).toBe('VALIDATION_ERROR')
				expect(response.error.issues).toEqual(issues)
			})

			it('should include issue count in message', () => {
				const issues = [
					{ path: ['field1'], code: 'required', message: 'Required' },
					{ path: ['field2'], code: 'required', message: 'Required' },
				]
				const response = createErrorResponse(issues)

				expect(response.error.message).toContain('2')
			})
		})
	})

	describe('Express Middleware', () => {
		const userSchema = type({
			email: 'string.email',
			name: 'string >= 1',
		})

		interface MockRequest {
			body: unknown
			query: Record<string, unknown>
			params: Record<string, string>
			headers: Record<string, string | string[] | undefined>
			[key: string]: unknown
		}

		const createMockReq = (body: unknown = {}): MockRequest => ({
			body,
			query: {},
			params: {},
			headers: {},
		})

		const createMockRes = (): {
			statusCode: number
			jsonData: unknown
			status: ReturnType<typeof vi.fn>
			json: ReturnType<typeof vi.fn>
		} => {
			const res = {
				statusCode: 200,
				jsonData: null as unknown,
				status: vi.fn((code: number) => {
					res.statusCode = code
					return res
				}),
				json: vi.fn((data: unknown) => {
					res.jsonData = data
				}),
			}
			return res
		}

		it('should call next() for valid data', () => {
			const middleware = expressValidator('body', userSchema)
			const req = createMockReq({
				email: 'test@example.com',
				name: 'John',
			})
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(next).toHaveBeenCalled()
			expect(res.status).not.toHaveBeenCalled()
		})

		it('should attach validated data to request', () => {
			const middleware = expressValidator('body', userSchema)
			const req = createMockReq({
				email: 'test@example.com',
				name: 'John',
			})
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(req.validated).toEqual({
				email: 'test@example.com',
				name: 'John',
			})
		})

		it('should return 400 for invalid data', () => {
			const middleware = expressValidator('body', userSchema)
			const req = createMockReq({ email: 'invalid', name: '' })
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(next).not.toHaveBeenCalled()
			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalled()
		})

		it('should call custom onError handler', () => {
			const onError = vi.fn()
			const middleware = expressValidator('body', userSchema, { onError })
			const req = createMockReq({ email: 'invalid' })
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(onError).toHaveBeenCalled()
			expect(res.status).not.toHaveBeenCalled()
		})

		it('should validate query parameters', () => {
			const querySchema = type({ page: 'string' })
			const middleware = expressValidator('query', querySchema)
			const req = {
				body: {},
				query: { page: '1' },
				params: {},
				headers: {},
			}
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(next).toHaveBeenCalled()
		})

		it('should validate route params', () => {
			const paramsSchema = type({ id: 'string' })
			const middleware = expressValidator('params', paramsSchema)
			const req = {
				body: {},
				query: {},
				params: { id: '123' },
				headers: {},
			}
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(next).toHaveBeenCalled()
		})

		it('should use custom attachTo property', () => {
			const middleware = expressValidator('body', userSchema, {
				attachTo: 'validatedBody',
			})
			const req = createMockReq({
				email: 'test@example.com',
				name: 'John',
			})
			const res = createMockRes()
			const next = vi.fn()

			middleware(req, res, next)

			expect(req.validatedBody).toEqual({
				email: 'test@example.com',
				name: 'John',
			})
		})
	})

	describe('Fastify Middleware', () => {
		const userSchema = type({
			email: 'string.email',
			name: 'string >= 1',
		})

		interface MockFastifyRequest {
			body: unknown
			query: Record<string, unknown>
			params: Record<string, string>
			headers: Record<string, string | undefined>
			[key: string]: unknown
		}

		const createMockRequest = (body: unknown = {}): MockFastifyRequest => ({
			body,
			query: {},
			params: {},
			headers: {},
		})

		const createMockReply = (): {
			statusCode: number
			sentData: unknown
			code: ReturnType<typeof vi.fn>
			send: ReturnType<typeof vi.fn>
		} => {
			const reply = {
				statusCode: 200,
				sentData: null as unknown,
				code: vi.fn((status: number) => {
					reply.statusCode = status
					return reply
				}),
				send: vi.fn((data: unknown) => {
					reply.sentData = data
				}),
			}
			return reply
		}

		it('should not send response for valid data', async () => {
			const preHandler = fastifyValidator('body', userSchema)
			const request = createMockRequest({
				email: 'test@example.com',
				name: 'John',
			})
			const reply = createMockReply()

			await preHandler(request, reply)

			expect(reply.code).not.toHaveBeenCalled()
			expect(reply.send).not.toHaveBeenCalled()
		})

		it('should attach validated data to request', async () => {
			const preHandler = fastifyValidator('body', userSchema)
			const request = createMockRequest({
				email: 'test@example.com',
				name: 'John',
			})
			const reply = createMockReply()

			await preHandler(request, reply)

			expect(request.validated).toEqual({
				email: 'test@example.com',
				name: 'John',
			})
		})

		it('should send 400 for invalid data', async () => {
			const preHandler = fastifyValidator('body', userSchema)
			const request = createMockRequest({ email: 'invalid' })
			const reply = createMockReply()

			await preHandler(request, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalled()
		})

		it('should call custom onError handler', async () => {
			const onError = vi.fn()
			const preHandler = fastifyValidator('body', userSchema, { onError })
			const request = createMockRequest({ email: 'invalid' })
			const reply = createMockReply()

			await preHandler(request, reply)

			expect(onError).toHaveBeenCalled()
		})
	})

	describe('Hono Middleware', () => {
		const userSchema = type({
			email: 'string.email',
			name: 'string >= 1',
		})

		interface MockHonoContext {
			req: {
				json: ReturnType<typeof vi.fn>
				query: ReturnType<typeof vi.fn>
				param: ReturnType<typeof vi.fn>
				raw: { headers: Headers }
			}
			json: ReturnType<typeof vi.fn>
			get: ReturnType<typeof vi.fn>
			set: ReturnType<typeof vi.fn>
		}

		const createMockContext = (body: unknown = {}): MockHonoContext => {
			const store: Record<string, unknown> = {}
			return {
				req: {
					json: vi.fn().mockResolvedValue(body),
					query: vi.fn().mockReturnValue({}),
					param: vi.fn().mockReturnValue({}),
					raw: { headers: new Headers() },
				},
				json: vi.fn(
					(data: unknown, status?: number) =>
						new Response(JSON.stringify(data), {
							status: status ?? 200,
						}),
				),
				get: vi.fn((key: string) => store[key]),
				set: vi.fn((key: string, value: unknown) => {
					store[key] = value
				}),
			}
		}

		it('should call next() for valid data', async () => {
			const middleware = honoValidator('body', userSchema)
			const c = createMockContext({
				email: 'test@example.com',
				name: 'John',
			})
			const next = vi.fn().mockResolvedValue(undefined)

			await middleware(c, next)

			expect(next).toHaveBeenCalled()
		})

		it('should store validated data in context', async () => {
			const middleware = honoValidator('body', userSchema)
			const c = createMockContext({
				email: 'test@example.com',
				name: 'John',
			})
			const next = vi.fn().mockResolvedValue(undefined)

			await middleware(c, next)

			expect(c.set).toHaveBeenCalledWith('validated', {
				email: 'test@example.com',
				name: 'John',
			})
			expect(c.set).toHaveBeenCalledWith('validated_body', {
				email: 'test@example.com',
				name: 'John',
			})
		})

		it('should return 400 response for invalid data', async () => {
			const middleware = honoValidator('body', userSchema)
			const c = createMockContext({ email: 'invalid' })
			const next = vi.fn()

			const response = await middleware(c, next)

			expect(response).toBeInstanceOf(Response)
			expect(next).not.toHaveBeenCalled()
			expect(c.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: false }),
				400,
			)
		})

		it('should call custom onError handler', async () => {
			const onError = vi.fn()
			const middleware = honoValidator('body', userSchema, { onError })
			const c = createMockContext({ email: 'invalid' })
			const next = vi.fn()

			await middleware(c, next)

			expect(onError).toHaveBeenCalled()
		})

		it('should return custom response from onError', async () => {
			const customResponse = new Response('Custom error', { status: 422 })
			const onError = vi.fn().mockReturnValue(customResponse)
			const middleware = honoValidator('body', userSchema, { onError })
			const c = createMockContext({ email: 'invalid' })
			const next = vi.fn()

			const response = await middleware(c, next)

			expect(response).toBe(customResponse)
		})

		describe('getValidated helper', () => {
			it('should retrieve validated data from context', () => {
				const store: Record<string, unknown> = {
					validated: { email: 'test@example.com' },
				}
				const c = {
					req: {} as never,
					json: vi.fn(),
					get: vi.fn((key: string) => store[key]),
					set: vi.fn(),
				}

				const data = getValidated<{ email: string }>(c)
				expect(data).toEqual({ email: 'test@example.com' })
			})

			it('should retrieve target-specific validated data', () => {
				const store: Record<string, unknown> = {
					validated_body: { name: 'John' },
					validated_query: { page: '1' },
				}
				const c = {
					req: {} as never,
					json: vi.fn(),
					get: vi.fn((key: string) => store[key]),
					set: vi.fn(),
				}

				const bodyData = getValidated<{ name: string }>(c, 'body')
				expect(bodyData).toEqual({ name: 'John' })

				const queryData = getValidated<{ page: string }>(c, 'query')
				expect(queryData).toEqual({ page: '1' })
			})
		})
	})

	describe('Validation Targets', () => {
		const schema = type({ value: 'string' })

		it('should validate different targets in Express', () => {
			const targets = ['body', 'query', 'params', 'headers'] as const

			targets.forEach(target => {
				const middleware = expressValidator(target, schema)
				expect(middleware).toBeDefined()
			})
		})

		it('should validate different targets in Fastify', () => {
			const targets = ['body', 'query', 'params', 'headers'] as const

			targets.forEach(target => {
				const preHandler = fastifyValidator(target, schema)
				expect(preHandler).toBeDefined()
			})
		})

		it('should validate different targets in Hono', () => {
			const targets = ['body', 'query', 'params', 'headers'] as const

			targets.forEach(target => {
				const middleware = honoValidator(target, schema)
				expect(middleware).toBeDefined()
			})
		})
	})
})
