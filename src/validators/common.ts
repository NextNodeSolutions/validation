/**
 * Common NextNode validators with business rules
 *
 * Not just basic validation, but NextNode-specific business logic
 */

import { type } from 'arktype'

import {
	createFailureResult,
	createSuccessResult,
	createValidationError,
} from '@/errors/formatter.js'

import type { ValidationResult } from '@/types/index.js'

/**
 * NextNode API Key validator
 * Format: nk_[32 alphanumeric characters]
 */
export const NextNodeAPIKey = type('string').narrow((key): key is string => {
	const pattern = /^nk_[a-zA-Z0-9]{32}$/
	return pattern.test(key)
})

/**
 * NextNode Project Slug validator
 * - Lowercase letters, numbers, hyphens only
 * - 3-50 characters
 * - Cannot start/end with hyphen
 * - Cannot have consecutive hyphens
 */
export const NextNodeProjectSlug = type('string').narrow(
	(slug): slug is string => {
		if (slug.length < 3 || slug.length > 50) return false
		if (slug.startsWith('-') || slug.endsWith('-')) return false
		if (slug.includes('--')) return false

		const pattern = /^[a-z0-9-]+$/
		return pattern.test(slug)
	},
)

/**
 * NextNode Username validator
 * - Alphanumeric and underscores only
 * - 3-30 characters
 * - Cannot start with number
 * - Reserved usernames not allowed
 */
const RESERVED_USERNAMES = new Set([
	'admin',
	'api',
	'app',
	'apps',
	'auth',
	'blog',
	'dashboard',
	'docs',
	'help',
	'mail',
	'root',
	'support',
	'system',
	'test',
	'www',
	'nextnode',
	'dev',
	'staging',
	'production',
	'config',
])

export const NextNodeUsername = type('string').narrow(
	(username): username is string => {
		if (username.length < 3 || username.length > 30) return false
		if (/^[0-9]/.test(username)) return false
		if (RESERVED_USERNAMES.has(username.toLowerCase())) return false

		const pattern = /^[a-zA-Z0-9_]+$/
		return pattern.test(username)
	},
)

/**
 * Enhanced Email validator with NextNode business rules
 * - Standard email format
 * - No disposable email domains
 * - No plus addressing (+ in local part) for business accounts
 */
const DISPOSABLE_DOMAINS = new Set([
	'tempmail.org',
	'10minutemail.com',
	'guerrillamail.com',
	'mailinator.com',
	'throwaway.email',
	'temp-mail.org',
	'guerrillamail.org',
	'guerrillamail.biz',
	'guerrillamail.net',
	'guerrillamail.de',
	'spam4.me',
	'maildrop.cc',
	'sharklasers.com',
	'yopmail.com',
])

// Pre-compiled regex for better performance
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NextNodeEmail = type('string').narrow((email): email is string => {
	// Basic email pattern validation
	if (!EMAIL_PATTERN.test(email)) return false

	const [local, domain] = email.split('@')
	if (!local || !domain) return false

	const normalizedDomain = domain.toLowerCase()

	// Check for disposable domains (optimized lookup)
	if (DISPOSABLE_DOMAINS.has(normalizedDomain)) return false

	// Business rule: no plus addressing for cleaner data
	if (local.includes('+')) return false

	// Domain must have at least one dot
	if (!normalizedDomain.includes('.')) return false

	return true
})

/**
 * Semantic Version validator with NextNode conventions
 * Supports: 1.0.0, 1.0.0-alpha.1, 1.0.0-beta.2+build.123
 */
export const NextNodeSemVer = type('string').narrow(
	(version): version is string => {
		const semverPattern =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
		return semverPattern.test(version)
	},
)

/**
 * URL validator with NextNode security rules
 * - HTTPS only for production
 * - No localhost in production context
 * - Port restrictions
 */
export const createNextNodeURL = (
	options: { allowHttp?: boolean; allowLocalhost?: boolean } = {},
): ((value: string) => unknown) =>
	type('string').narrow((url): url is string => {
		try {
			const parsed = new URL(url)

			// Protocol restrictions
			if (!options.allowHttp && parsed.protocol !== 'https:') {
				return false
			}
			if (!['http:', 'https:'].includes(parsed.protocol)) {
				return false
			}

			// Localhost restrictions
			if (
				!options.allowLocalhost &&
				(parsed.hostname === 'localhost' ||
					parsed.hostname === '127.0.0.1' ||
					parsed.hostname === '0.0.0.0')
			) {
				return false
			}

			// Port restrictions (no dangerous ports)
			const dangerousPorts = [
				'22',
				'25',
				'135',
				'139',
				'445',
				'993',
				'995',
			]
			if (parsed.port && dangerousPorts.includes(parsed.port)) {
				return false
			}

			return true
		} catch {
			return false
		}
	})

/**
 * UUID validator (v4 only for consistency)
 */
export const NextNodeUUID = type('string').narrow((uuid): uuid is string => {
	const uuidPattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
	return uuidPattern.test(uuid)
})

/**
 * Performance-optimized validation chain for multiple validators
 * Stops at first failure for better performance
 */
export const createValidationChain =
	<T>(...validators: Array<(value: T) => unknown>) =>
	(value: T): ValidationResult<T> => {
		for (const validator of validators) {
			const result = validator(value)

			if (
				typeof result === 'object' &&
				result &&
				' arkKind' in result &&
				result[' arkKind'] === 'errors'
			) {
				return createFailureResult([
					createValidationError(
						'INVALID_FORMAT',
						`Validation failed: ${String(result)}`,
						undefined,
						value,
					),
				])
			}
		}

		return createSuccessResult(value)
	}

/**
 * Utility function to validate and return NextNode format result
 */
export const validateWithNextNodeFormat = <T>(
	validator: (value: unknown) => unknown,
	value: unknown,
): ValidationResult<T> => {
	const result = validator(value)

	if (
		typeof result === 'object' &&
		result &&
		' arkKind' in result &&
		result[' arkKind'] === 'errors'
	) {
		return createFailureResult([
			createValidationError(
				'INVALID_FORMAT',
				`Validation failed: ${String(result)}`,
				undefined,
				value,
			),
		])
	}

	return createSuccessResult(result as T)
}
