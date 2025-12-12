/**
 * React Hook Form resolver tests
 */

import { describe, it, expect } from 'vitest'
import { type } from 'arktype'

import { arktypeResolver } from '../integrations/react-hook-form/resolver.js'
import { v } from '../lib/core/engine.js'

describe('React Hook Form Resolver', () => {
	describe('arktypeResolver', () => {
		describe('with ArkType schema', () => {
			const userSchema = type({
				email: 'string.email',
				password: 'string >= 8',
			})

			it('should return values for valid data', async () => {
				const resolver = arktypeResolver(userSchema)
				const result = await resolver({
					email: 'test@example.com',
					password: 'password123',
				})

				expect(result.values).toEqual({
					email: 'test@example.com',
					password: 'password123',
				})
				expect(result.errors).toEqual({})
			})

			it('should return errors for invalid data', async () => {
				const resolver = arktypeResolver(userSchema)
				const result = await resolver({
					email: 'invalid',
					password: 'short',
				})

				expect(result.values).toEqual({})
				expect(result.errors.email).toBeDefined()
				expect(result.errors.password).toBeDefined()
			})

			it('should include error messages', async () => {
				const resolver = arktypeResolver(userSchema)
				const result = await resolver({
					email: 'invalid',
					password: 'password123',
				})

				expect(result.errors.email?.message).toBeDefined()
				expect(typeof result.errors.email?.message).toBe('string')
			})
		})

		describe('with Schema wrapper', () => {
			const userSchema = v.object<{ name: string; age: number }>({
				name: 'string >= 1',
				age: 'number >= 0',
			})

			it('should validate using Schema wrapper', async () => {
				const resolver = arktypeResolver(userSchema)
				const validResult = await resolver({ name: 'John', age: 25 })

				expect(validResult.values).toEqual({ name: 'John', age: 25 })
				expect(validResult.errors).toEqual({})
			})

			it('should return errors from Schema wrapper', async () => {
				const resolver = arktypeResolver(userSchema)
				const invalidResult = await resolver({ name: '', age: -5 })

				expect(invalidResult.values).toEqual({})
				expect(invalidResult.errors.name).toBeDefined()
				expect(invalidResult.errors.age).toBeDefined()
			})
		})

		describe('nested object validation', () => {
			const nestedSchema = type({
				user: {
					profile: {
						name: 'string >= 1',
						email: 'string.email',
					},
				},
			})

			it('should validate nested objects', async () => {
				const resolver = arktypeResolver(nestedSchema)
				const validResult = await resolver({
					user: {
						profile: {
							name: 'John',
							email: 'john@example.com',
						},
					},
				})

				expect(validResult.errors).toEqual({})
			})

			it('should report errors at nested paths using dot notation', async () => {
				const resolver = arktypeResolver(nestedSchema)
				const invalidResult = await resolver({
					user: {
						profile: {
							name: '',
							email: 'invalid',
						},
					},
				})

				// Errors use dot-notation paths like "user.profile.name"
				const errors = invalidResult.errors as Record<string, unknown>
				expect(errors['user.profile.name']).toBeDefined()
				expect(errors['user.profile.email']).toBeDefined()
			})
		})

		describe('resolver options', () => {
			const schema = type({ value: 'number' })

			it('should work with validateAllFieldCriteria option', async () => {
				const resolver = arktypeResolver(schema, {
					validateAllFieldCriteria: true,
				})
				const result = await resolver({ value: 42 })

				expect(result.values).toEqual({ value: 42 })
			})
		})

		describe('array validation', () => {
			const arraySchema = type({
				items: 'string[]',
			})

			it('should validate arrays', async () => {
				const resolver = arktypeResolver(arraySchema)
				const validResult = await resolver({ items: ['a', 'b', 'c'] })

				expect(validResult.values).toEqual({ items: ['a', 'b', 'c'] })
				expect(validResult.errors).toEqual({})
			})

			it('should report errors for invalid array items', async () => {
				const resolver = arktypeResolver(arraySchema)
				const invalidResult = await resolver({
					items: [1, 2, 3] as unknown as string[],
				})

				// Errors may be keyed by path like "items.0" or "items"
				const errors = invalidResult.errors as Record<string, unknown>
				const hasItemsError = Object.keys(errors).some(key =>
					key.startsWith('items'),
				)
				expect(hasItemsError).toBe(true)
			})
		})

		describe('optional fields', () => {
			const optionalSchema = type({
				required: 'string',
				'optional?': 'string',
			})

			it('should allow missing optional fields', async () => {
				const resolver = arktypeResolver(optionalSchema)
				const result = await resolver({ required: 'value' })

				expect(result.values).toEqual({ required: 'value' })
				expect(result.errors).toEqual({})
			})

			it('should validate optional fields when provided', async () => {
				const resolver = arktypeResolver(optionalSchema)
				const result = await resolver({
					required: 'value',
					optional: 123,
				} as unknown as {
					required: string
					optional?: string
				})

				expect(result.errors.optional).toBeDefined()
			})
		})
	})
})
