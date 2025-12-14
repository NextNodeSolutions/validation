/**
 * Authentication-related validation schemas
 * All schemas return normalized ValidationIssue errors
 */

import { type } from 'arktype'

import { v } from '../core/engine.js'
import type { Schema } from '../core/types.js'

/**
 * Username: starts with letter, alphanumeric with underscore, 3-30 chars
 */
export const username = v.schema(type(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/))

/**
 * Basic password: minimum 8 characters
 */
export const passwordBasic = v.schema(type('string >= 8'))

/**
 * Email for auth purposes
 */
export const authEmail = v.schema(type('string.email'))

/**
 * JWT token format
 */
export const jwtToken = v.schema(
	type(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
)

/**
 * API key format with configurable prefix
 */
export const createApiKey = (prefix = 'sk'): Schema<string> =>
	v.schema(type(new RegExp(`^${prefix}_[A-Za-z0-9]{32,}$`)))

/**
 * Default API key (sk_ prefix)
 */
export const apiKey = createApiKey('sk')

/**
 * Password validation rule
 */
interface PasswordRule {
	check: (password: string) => boolean
	expected: string
}

/**
 * Password requirements configuration
 */
export interface PasswordRequirements {
	minLength?: number
	requireUppercase?: boolean
	requireLowercase?: boolean
	requireNumbers?: boolean
	requireSpecialChars?: boolean
	/** If true, stops at first error. If false (default), collects all errors. */
	failFast?: boolean
}

/**
 * Creates a password schema with configurable requirements
 * By default, collects all validation errors for better UX
 */
export const createPasswordSchema = (
	options: PasswordRequirements = {},
): Schema<string> => {
	const {
		minLength = 8,
		requireUppercase = true,
		requireLowercase = true,
		requireNumbers = true,
		requireSpecialChars = false,
		failFast = false,
	} = options

	const rules: PasswordRule[] = [
		{
			check: p => p.length >= minLength,
			expected: `at least ${minLength} characters`,
		},
		...(requireUppercase
			? [
					{
						check: (p: string) => /[A-Z]/.test(p),
						expected: 'uppercase letter',
					},
				]
			: []),
		...(requireLowercase
			? [
					{
						check: (p: string) => /[a-z]/.test(p),
						expected: 'lowercase letter',
					},
				]
			: []),
		...(requireNumbers
			? [{ check: (p: string) => /[0-9]/.test(p), expected: 'number' }]
			: []),
		...(requireSpecialChars
			? [
					{
						check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
						expected: 'special character',
					},
				]
			: []),
	]

	const arkType = type('string').narrow((password, ctx) => {
		let valid = true

		for (const rule of rules) {
			if (!rule.check(password)) {
				ctx.reject({ expected: rule.expected })
				if (failFast) return false
				valid = false
			}
		}

		return valid
	})

	return v.schema(arkType)
}

/**
 * Strong password with all requirements
 */
export const strongPassword = createPasswordSchema({
	minLength: 8,
	requireUppercase: true,
	requireLowercase: true,
	requireNumbers: true,
	requireSpecialChars: true,
})

/**
 * Login form schema
 */
export const loginSchema = v.schema(
	type({
		email: 'string.email',
		password: 'string >= 1',
		'rememberMe?': 'boolean',
	}),
)

/**
 * Registration form schema with password confirmation
 */
export const registerSchema = v.schema(
	type({
		email: 'string.email',
		username: /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/,
		password: 'string >= 8',
		confirmPassword: 'string >= 1',
	}).narrow((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			return ctx.reject({
				expected: 'matching passwords',
				actual: 'passwords do not match',
				path: ['confirmPassword'],
			})
		}
		return true
	}),
)

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = v.schema(
	type({
		email: 'string.email',
	}),
)

/**
 * Password reset schema
 */
export const passwordResetSchema = v.schema(
	type({
		token: 'string >= 1',
		password: 'string >= 8',
		confirmPassword: 'string >= 1',
	}).narrow((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			return ctx.reject({
				expected: 'matching passwords',
				actual: 'passwords do not match',
				path: ['confirmPassword'],
			})
		}
		return true
	}),
)

/**
 * Bundled auth schemas
 */
export const authSchemas = {
	username,
	passwordBasic,
	authEmail,
	jwtToken,
	apiKey,
	strongPassword,
	loginSchema,
	registerSchema,
	passwordResetRequestSchema,
	passwordResetSchema,

	// Factory functions
	createApiKey,
	createPasswordSchema,
} as const
