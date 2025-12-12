/**
 * Authentication-related validation schemas
 */

import { type } from 'arktype'

/**
 * Username: starts with letter, alphanumeric with underscore, 3-30 chars
 */
export const username = type(/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/)

/**
 * Basic password: minimum 8 characters
 */
export const passwordBasic = type('string >= 8')

/**
 * Email for auth purposes
 */
export const authEmail = type('string.email')

/**
 * JWT token format
 */
export const jwtToken = type(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)

/**
 * API key format with configurable prefix
 */
export const createApiKey = (prefix = 'sk'): ReturnType<typeof type> =>
	type(new RegExp(`^${prefix}_[A-Za-z0-9]{32,}$`))

/**
 * Default API key (sk_ prefix)
 */
export const apiKey = createApiKey('sk')

/**
 * Password requirements configuration
 */
export interface PasswordRequirements {
	minLength?: number
	requireUppercase?: boolean
	requireLowercase?: boolean
	requireNumbers?: boolean
	requireSpecialChars?: boolean
}

/**
 * Creates a password schema with configurable requirements
 */
export const createPasswordSchema = (
	options: PasswordRequirements = {},
): ReturnType<ReturnType<typeof type<'string'>>['narrow']> => {
	const {
		minLength = 8,
		requireUppercase = true,
		requireLowercase = true,
		requireNumbers = true,
		requireSpecialChars = false,
	} = options

	return type(`string >= ${minLength}`).narrow((password, ctx) => {
		if (requireUppercase && !/[A-Z]/.test(password)) {
			return ctx.reject({
				expected: 'password with uppercase letter',
			})
		}
		if (requireLowercase && !/[a-z]/.test(password)) {
			return ctx.reject({
				expected: 'password with lowercase letter',
			})
		}
		if (requireNumbers && !/[0-9]/.test(password)) {
			return ctx.reject({
				expected: 'password with number',
			})
		}
		if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return ctx.reject({
				expected: 'password with special character',
			})
		}
		return true
	})
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
export const loginSchema = type({
	email: 'string.email',
	password: 'string >= 1',
	'rememberMe?': 'boolean',
})

/**
 * Registration form schema with password confirmation
 */
export const registerSchema = type({
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
})

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = type({
	email: 'string.email',
})

/**
 * Password reset schema
 */
export const passwordResetSchema = type({
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
})

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
