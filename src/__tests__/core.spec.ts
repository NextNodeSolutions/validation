/**
 * Core validation engine tests
 */

import { describe, it, expect } from 'vitest'
import { type } from 'arktype'

import {
	v,
	createValidationEngine,
	DefaultErrorFormatter,
	ErrorCodes,
} from '../lib/index.js'

describe('Validation Engine', () => {
	describe('createValidationEngine', () => {
		it('should create a validation engine with default config', () => {
			const engine = createValidationEngine()

			expect(engine).toBeDefined()
			expect(engine.schema).toBeDefined()
			expect(engine.define).toBeDefined()
			expect(engine.object).toBeDefined()
		})

		it('should create engine with custom error formatter', () => {
			const customFormatter = new DefaultErrorFormatter({
				includeDetails: false,
			})
			const engine = createValidationEngine({
				errorFormatter: customFormatter,
			})

			expect(engine).toBeDefined()
		})
	})

	describe('v (default engine)', () => {
		describe('v.schema()', () => {
			it('should wrap ArkType schema with validation methods', () => {
				const emailType = type('string.email')
				const schema = v.schema(emailType)

				expect(schema.safeParse).toBeDefined()
				expect(schema.parse).toBeDefined()
				expect(schema.validate).toBeDefined()
			})

			it('should validate valid data successfully', () => {
				const emailType = type('string.email')
				const schema = v.schema(emailType)

				const result = schema.safeParse('test@example.com')

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data).toBe('test@example.com')
				}
			})

			it('should return issues for invalid data', () => {
				const emailType = type('string.email')
				const schema = v.schema(emailType)

				const result = schema.safeParse('invalid-email')

				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.issues.length).toBeGreaterThan(0)
					expect(result.issues[0]?.code).toBe(
						ErrorCodes.INVALID_EMAIL,
					)
				}
			})
		})

		describe('v.define()', () => {
			it('should create schema from string definition', () => {
				const schema = v.define<string>('string >= 3')

				const result = schema.safeParse('hello')
				expect(result.success).toBe(true)
			})

			it('should reject invalid values', () => {
				const schema = v.define<string>('string >= 3')

				const result = schema.safeParse('ab')
				expect(result.success).toBe(false)
			})

			it('should handle numeric constraints', () => {
				const schema = v.define<number>('number > 0')

				expect(schema.safeParse(10).success).toBe(true)
				expect(schema.safeParse(0).success).toBe(false)
				expect(schema.safeParse(-5).success).toBe(false)
			})
		})

		describe('v.object()', () => {
			it('should create object schema', () => {
				const schema = v.object<{ name: string; age: number }>({
					name: 'string >= 1',
					age: 'number >= 0',
				})

				const result = schema.safeParse({ name: 'John', age: 25 })
				expect(result.success).toBe(true)
			})

			it('should validate nested object properties', () => {
				const schema = v.object<{ user: { email: string } }>({
					user: {
						email: 'string.email',
					},
				})

				const validResult = schema.safeParse({
					user: { email: 'test@example.com' },
				})
				expect(validResult.success).toBe(true)

				const invalidResult = schema.safeParse({
					user: { email: 'invalid' },
				})
				expect(invalidResult.success).toBe(false)
			})

			it('should handle optional properties', () => {
				const schema = v.object<{ name: string; nickname?: string }>({
					name: 'string',
					'nickname?': 'string',
				})

				const withoutOptional = schema.safeParse({ name: 'John' })
				expect(withoutOptional.success).toBe(true)

				const withOptional = schema.safeParse({
					name: 'John',
					nickname: 'Johnny',
				})
				expect(withOptional.success).toBe(true)
			})
		})

		describe('parse()', () => {
			it('should return data for valid input', () => {
				const schema = v.define<string>('string')
				const data = schema.parse('hello')

				expect(data).toBe('hello')
			})

			it('should throw ValidationError for invalid input', () => {
				const schema = v.define<number>('number')

				expect(() => schema.parse('not a number')).toThrow()
			})
		})

		describe('validate()', () => {
			it('should be alias for safeParse', () => {
				const schema = v.define<string>('string.email')

				const result = schema.validate('test@example.com')
				expect(result.success).toBe(true)

				const invalidResult = schema.validate('invalid')
				expect(invalidResult.success).toBe(false)
			})
		})
	})

	describe('DefaultErrorFormatter', () => {
		it('should format errors with path information', () => {
			const userSchema = type({
				email: 'string.email',
				age: 'number >= 0',
			})

			const result = userSchema({ email: 'invalid', age: -5 })

			if (result instanceof type.errors) {
				const formatter = new DefaultErrorFormatter()
				const issues = formatter.format(result)

				expect(issues.length).toBeGreaterThan(0)
				issues.forEach(issue => {
					expect(issue.path).toBeDefined()
					expect(issue.code).toBeDefined()
					expect(issue.message).toBeDefined()
				})
			}
		})

		it('should include expected info when available', () => {
			const schema = type('number > 10')
			const result = schema(5)

			if (result instanceof type.errors) {
				const formatter = new DefaultErrorFormatter({
					includeDetails: true,
				})

				const issues = formatter.format(result)
				expect(issues[0]?.expected).toBeDefined()
			}
		})

		it('should include actual info when available', () => {
			const schema = type('number')
			const result = schema('string')

			if (result instanceof type.errors) {
				const formatter = new DefaultErrorFormatter({
					includeDetails: true,
				})

				const issues = formatter.format(result)
				expect(issues[0]?.actual).toBeDefined()
			}
		})
	})

	describe('Error Codes', () => {
		it('should have all standard error codes defined', () => {
			expect(ErrorCodes.INVALID_TYPE).toBe('invalid_type')
			expect(ErrorCodes.INVALID_FORMAT).toBe('invalid_format')
			expect(ErrorCodes.REQUIRED).toBe('required')
			expect(ErrorCodes.INVALID_EMAIL).toBe('invalid_email')
			expect(ErrorCodes.INVALID_URL).toBe('invalid_url')
			expect(ErrorCodes.STRING_MIN).toBe('string_min')
			expect(ErrorCodes.NUMBER_MIN).toBe('number_min')
			expect(ErrorCodes.CUSTOM).toBe('custom')
		})
	})
})
