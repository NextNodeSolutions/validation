/**
 * Core types for @nextnode/validation
 *
 * Error format: key + reason only, no internationalization
 * Consumer projects handle i18n based on keys
 */

export type ValidationErrorCode =
	| 'INVALID_EMAIL'
	| 'INVALID_API_KEY'
	| 'INVALID_UUID'
	| 'INVALID_URL'
	| 'INVALID_SEMVER'
	| 'INVALID_SLUG'
	| 'INVALID_PROJECT_NAME'
	| 'INVALID_USERNAME'
	| 'REQUIRED_FIELD'
	| 'FIELD_TOO_SHORT'
	| 'FIELD_TOO_LONG'
	| 'INVALID_FORMAT'
	| 'INVALID_RANGE'
	| 'ASYNC_VALIDATION_FAILED'
	| 'CONDITIONAL_VALIDATION_FAILED'
	| 'DEPENDENCY_CHECK_FAILED'

/**
 * Standardized validation error for all NextNode projects
 */
export type ValidationError = {
	/** Error key for i18n lookup by consumer */
	key: ValidationErrorCode
	/** Technical reason for debugging */
	reason: string
	/** Path to the field in object (optional) */
	path?: string
	/** Value that failed validation (optional) */
	value?: unknown
}

/**
 * Result type for validation operations
 */
export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: ValidationError[] }

/**
 * Async validation function type
 */
export type AsyncValidator<T> = (value: T) => Promise<ValidationResult<T>>

/**
 * Configuration for async validators with caching
 */
export type AsyncValidatorConfig = {
	/** Cache TTL in milliseconds */
	cacheTtl?: number
	/** Max cache size */
	maxCacheSize?: number
	/** Custom cache key generator */
	cacheKeyFn?: (value: unknown) => string
}

/**
 * NextNode domain types for validation
 */
export type NextNodeDomains = {
	/** NextNode API key format: nk_xxxxx */
	apiKey: string
	/** NextNode project slug format */
	projectSlug: string
	/** NextNode username format */
	username: string
}
