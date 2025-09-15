/**
 * Error formatting utilities for @nextnode/validation
 *
 * Converts ArkType errors to NextNode standardized format
 */

import type {
	ValidationError,
	ValidationErrorCode,
	ValidationResult,
} from '@/types/index.js'

/**
 * Creates a standardized validation error
 */
export const createValidationError = (
	key: ValidationErrorCode,
	reason: string,
	path?: string | undefined,
	value?: unknown,
): ValidationError => ({
	key,
	reason,
	...(path && { path }),
	...(value !== undefined && { value }),
})

/**
 * Creates a failed validation result
 */
export const createFailureResult = <T>(
	errors: ValidationError[],
): ValidationResult<T> => ({
	success: false,
	errors,
})

/**
 * Creates a successful validation result
 */
export const createSuccessResult = <T>(data: T): ValidationResult<T> => ({
	success: true,
	data,
})

/**
 * Converts ArkType error to NextNode format
 *
 * @param arktypeError - Error from ArkType validation
 * @param fallbackKey - Default error key if mapping fails
 * @returns ValidationError in NextNode format
 */
export const formatArktypeError = (
	arktypeError: {
		message?: string
		path?: string[]
		actual?: unknown
	},
	fallbackKey: ValidationErrorCode = 'INVALID_FORMAT',
): ValidationError => {
	// Extract path from ArkType error structure
	const path = arktypeError.path ? arktypeError.path.join('.') : undefined

	// Map ArkType error message to NextNode error key
	const key = mapArktypeErrorToKey(arktypeError.message ?? '') || fallbackKey

	return createValidationError(
		key,
		arktypeError.message ?? 'Validation failed',
		path,
		arktypeError.actual,
	)
}

/**
 * Maps ArkType error messages to NextNode error keys
 */
const mapArktypeErrorToKey = (message: string): ValidationErrorCode | null => {
	// Email validation patterns
	if (message.includes('email') || message.includes('@')) {
		return 'INVALID_EMAIL'
	}

	// URL validation patterns
	if (message.includes('url') || message.includes('http')) {
		return 'INVALID_URL'
	}

	// UUID validation patterns
	if (message.includes('uuid') || message.includes('guid')) {
		return 'INVALID_UUID'
	}

	// Length validation patterns
	if (message.includes('length') || message.includes('characters')) {
		if (message.includes('short') || message.includes('minimum')) {
			return 'FIELD_TOO_SHORT'
		}
		if (message.includes('long') || message.includes('maximum')) {
			return 'FIELD_TOO_LONG'
		}
	}

	// Required field patterns
	if (message.includes('required') || message.includes('undefined')) {
		return 'REQUIRED_FIELD'
	}

	// Range validation patterns
	if (message.includes('range') || message.includes('between')) {
		return 'INVALID_RANGE'
	}

	// Format validation patterns
	if (message.includes('format') || message.includes('pattern')) {
		return 'INVALID_FORMAT'
	}

	return null
}

/**
 * Formats multiple validation errors into a readable summary
 * Useful for logging and debugging
 */
export const formatErrorSummary = (errors: ValidationError[]): string => {
	if (errors.length === 0) return 'No validation errors'

	if (errors.length === 1) {
		const error = errors[0]
		if (!error) return 'Unknown validation error'
		return error.path ? `${error.path}: ${error.reason}` : error.reason
	}

	return `${errors.length} validation errors:\n${errors
		.map(
			error =>
				`  - ${error.path ? `${error.path}: ` : ''}${error.reason}`,
		)
		.join('\n')}`
}

/**
 * Extracts all error keys for i18n lookup
 */
export const extractErrorKeys = (
	errors: ValidationError[],
): ValidationErrorCode[] => errors.map(error => error.key)

/**
 * Groups errors by their keys
 */
export const groupErrorsByKey = (
	errors: ValidationError[],
): Record<ValidationErrorCode, ValidationError[]> =>
	errors.reduce(
		(acc, error) => {
			if (!acc[error.key]) {
				acc[error.key] = []
			}
			acc[error.key].push(error)
			return acc
		},
		{} as Record<ValidationErrorCode, ValidationError[]>,
	)
