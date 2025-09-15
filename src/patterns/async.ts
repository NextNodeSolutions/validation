/**
 * Async validation patterns with caching for external checks
 *
 * Validates data against external services (databases, APIs, etc.)
 * with built-in caching to avoid redundant requests
 */

import {
	createFailureResult,
	createSuccessResult,
	createValidationError,
} from '@/errors/formatter.js'
import { coreLogger } from '@/utils/logger.js'

import type {
	AsyncValidator,
	AsyncValidatorConfig,
	ValidationResult,
} from '@/types/index.js'

/**
 * Simple in-memory cache for async validation results
 */
class ValidationCache {
	private cache = new Map<string, { value: unknown; expires: number }>()
	private readonly defaultTtl: number
	private readonly maxSize: number

	constructor(defaultTtl = 5 * 60 * 1000, maxSize = 1000) {
		this.defaultTtl = defaultTtl
		this.maxSize = maxSize
	}

	get(key: string): unknown | null {
		const entry = this.cache.get(key)
		if (!entry) return null

		if (Date.now() > entry.expires) {
			this.cache.delete(key)
			return null
		}

		return entry.value
	}

	set(key: string, value: unknown, ttl?: number): void {
		// Clean cache if at max capacity
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value
			if (firstKey) this.cache.delete(firstKey)
		}

		this.cache.set(key, {
			value,
			expires: Date.now() + (ttl || this.defaultTtl),
		})
	}

	clear(): void {
		this.cache.clear()
	}

	size(): number {
		return this.cache.size
	}
}

// Global cache instance
const globalCache = new ValidationCache()

/**
 * Fast cache key generator for common types
 * Avoids expensive JSON.stringify for simple values
 */
const createFastCacheKey = (value: unknown): string => {
	const type = typeof value

	if (type === 'string' || type === 'number' || type === 'boolean') {
		return `${type}:${value}`
	}

	if (value === null) return 'null'
	if (value === undefined) return 'undefined'

	// For objects, use JSON.stringify as fallback
	try {
		return `object:${JSON.stringify(value)}`
	} catch {
		return `object:${String(value)}`
	}
}

/**
 * Creates a cached async validator
 */
export const withCache = <T>(
	validator: (value: T) => Promise<ValidationResult<T>>,
	config: AsyncValidatorConfig = {},
): AsyncValidator<T> => {
	const {
		cacheTtl = 5 * 60 * 1000, // 5 minutes
		cacheKeyFn = createFastCacheKey,
	} = config

	return async (value: T): Promise<ValidationResult<T>> => {
		const cacheKey = cacheKeyFn(value)

		// Try cache first
		const cached = globalCache.get(cacheKey)
		if (cached) {
			coreLogger.info('Async validation cache hit')
			return cached as ValidationResult<T>
		}

		// Run validation
		try {
			const result = await validator(value)

			// Cache result (both success and failure)
			globalCache.set(cacheKey, result, cacheTtl)

			coreLogger.info('Async validation completed')

			return result
		} catch (error) {
			coreLogger.error('Async validation error')
			return createFailureResult([
				createValidationError(
					'ASYNC_VALIDATION_FAILED',
					`Async validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
					undefined,
					value,
				),
			])
		}
	}
}

/**
 * Validates that a username is unique (example async validator)
 */
export const validateUniqueUsername = withCache(
	async (username: string): Promise<ValidationResult<string>> => {
		// Simulate API call to check username uniqueness
		// In real implementation, this would call your user service

		await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay

		// Reserved usernames (simulating database check)
		const reservedUsernames = [
			'admin',
			'root',
			'system',
			'api',
			'nextnode',
			'support',
		]

		if (reservedUsernames.includes(username.toLowerCase())) {
			return createFailureResult([
				createValidationError(
					'INVALID_USERNAME',
					`Username "${username}" is reserved and cannot be used`,
					undefined,
					username,
				),
			])
		}

		// Simulate checking against database
		// In real app: const exists = await userService.checkUsernameExists(username)
		const exists = Math.random() < 0.1 // 10% chance username is taken

		if (exists) {
			return createFailureResult([
				createValidationError(
					'INVALID_USERNAME',
					`Username "${username}" is already taken`,
					undefined,
					username,
				),
			])
		}

		return createSuccessResult(username)
	},
	{
		cacheTtl: 10 * 60 * 1000, // Cache for 10 minutes
		cacheKeyFn: username => `username:${String(username).toLowerCase()}`,
	},
)

/**
 * Validates that an email domain is allowed
 */
export const validateEmailDomain = withCache(
	async (email: string): Promise<ValidationResult<string>> => {
		const domain = email.split('@')[1]?.toLowerCase()

		if (!domain) {
			return createFailureResult([
				createValidationError(
					'INVALID_EMAIL',
					'Invalid email format',
					undefined,
					email,
				),
			])
		}

		// Simulate checking against domain allowlist/blocklist
		await new Promise(resolve => setTimeout(resolve, 50))

		const blockedDomains = [
			'tempmail.org',
			'guerrillamail.com',
			'mailinator.com',
		]

		if (blockedDomains.includes(domain)) {
			return createFailureResult([
				createValidationError(
					'INVALID_EMAIL',
					`Email domain "${domain}" is not allowed`,
					undefined,
					email,
				),
			])
		}

		return createSuccessResult(email)
	},
	{
		cacheTtl: 60 * 60 * 1000, // Cache for 1 hour
		cacheKeyFn: email =>
			`email-domain:${String(email).split('@')[1]?.toLowerCase()}`,
	},
)

/**
 * Validates that a project slug is unique within organization
 */
export const validateUniqueProjectSlug = (
	organizationId: string,
): AsyncValidator<string> =>
	withCache(
		async (slug: string): Promise<ValidationResult<string>> => {
			// Simulate API call to check slug uniqueness within organization
			await new Promise(resolve => setTimeout(resolve, 75))

			// In real implementation:
			// const exists = await projectService.checkSlugExists(slug, organizationId)
			const exists = Math.random() < 0.15 // 15% chance slug is taken

			if (exists) {
				return createFailureResult([
					createValidationError(
						'INVALID_SLUG',
						`Project slug "${slug}" is already used in this organization`,
						undefined,
						slug,
					),
				])
			}

			return createSuccessResult(slug)
		},
		{
			cacheTtl: 5 * 60 * 1000, // Cache for 5 minutes
			cacheKeyFn: (slug: unknown): string =>
				`project-slug:${organizationId}:${slug}`,
		},
	)

/**
 * Validates API key permissions against user's actual permissions
 */
export const validateAPIKeyPermissions = withCache(
	async (data: {
		userId: string
		permissions: string[]
	}): Promise<ValidationResult<typeof data>> => {
		const { permissions } = data

		// Simulate fetching user's maximum allowed permissions
		await new Promise(resolve => setTimeout(resolve, 100))

		// In real implementation:
		// const userPermissions = await permissionService.getUserPermissions(userId)
		const userPermissions = [
			'projects:read',
			'projects:write',
			'users:read',
		] // Simulated user permissions

		const unauthorizedPermissions = permissions.filter(
			perm =>
				!userPermissions.includes(perm) &&
				!userPermissions.includes(perm.split(':')[0] + ':*'),
		)

		if (unauthorizedPermissions.length > 0) {
			return createFailureResult([
				createValidationError(
					'INVALID_FORMAT',
					`User does not have these permissions: ${unauthorizedPermissions.join(', ')}`,
					'permissions',
					unauthorizedPermissions,
				),
			])
		}

		return createSuccessResult(data)
	},
	{
		cacheTtl: 15 * 60 * 1000, // Cache for 15 minutes
		cacheKeyFn: data => {
			const d = data as { userId: string; permissions: string[] }
			return `api-permissions:${d.userId}:${d.permissions.sort().join(',')}`
		},
	},
)

/**
 * Validates webhook URL accessibility
 */
export const validateWebhookURL = withCache(
	async (url: string): Promise<ValidationResult<string>> => {
		try {
			// Simulate HTTP HEAD request to check if webhook endpoint exists
			await new Promise(resolve => setTimeout(resolve, 200))

			// In real implementation:
			// const response = await fetch(url, { method: 'HEAD', timeout: 5000 })
			// const accessible = response.ok

			const accessible = Math.random() > 0.2 // 80% chance URL is accessible

			if (!accessible) {
				return createFailureResult([
					createValidationError(
						'INVALID_URL',
						`Webhook URL "${url}" is not accessible`,
						undefined,
						url,
					),
				])
			}

			return createSuccessResult(url)
		} catch (error) {
			return createFailureResult([
				createValidationError(
					'INVALID_URL',
					`Failed to validate webhook URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
					undefined,
					url,
				),
			])
		}
	},
	{
		cacheTtl: 2 * 60 * 1000, // Cache for 2 minutes (URLs can change frequently)
		cacheKeyFn: url => `webhook:${url}`,
	},
)

/**
 * Combines multiple async validators
 */
export const combineAsyncValidators =
	<T>(validators: AsyncValidator<T>[]): AsyncValidator<T> =>
	async (value: T): Promise<ValidationResult<T>> => {
		const results = await Promise.all(
			validators.map(validator => validator(value)),
		)

		const errors = results
			.filter(result => !result.success)
			.flatMap(result => ('errors' in result ? result.errors : []))

		if (errors.length > 0) {
			return createFailureResult(errors)
		}

		return createSuccessResult(value)
	}

/**
 * Utility to clear validation cache silently (for tests)
 */
export const clearValidationCacheSilent = (): void => {
	globalCache.clear()
}

/**
 * Utility to clear validation cache
 */
export const clearValidationCache = (): void => {
	clearValidationCacheSilent()
	coreLogger.info('Validation cache cleared')
}

/**
 * Utility to get cache statistics
 */
export const getCacheStats = (): { size: number; maxSize: number } => ({
	size: globalCache.size(),
	maxSize: 1000, // From ValidationCache constructor
})
