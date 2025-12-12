/**
 * Common validation schemas
 * Pre-built validators using ArkType's built-in keywords
 */

import { type } from 'arktype'

/**
 * Common string validators
 */
export const email = type('string.email')
export const url = type('string.url')
export const uuid = type('string.uuid')
export const date = type('string.date')
export const json = type('string.json')
export const base64 = type('string.base64')
export const alphanumeric = type('string.alphanumeric')

/**
 * Slug pattern: lowercase letters, numbers, and hyphens
 */
export const slug = type(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

/**
 * Semantic version pattern
 */
export const semver = type(/^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/)

/**
 * Common number validators
 */
export const integer = type('number.integer')
export const positive = type('number > 0')
export const nonNegative = type('number >= 0')
export const percentage = type('number >= 0 & number <= 100')

/**
 * Boolean validator
 */
export const boolean = type('boolean')

/**
 * Non-empty string
 */
export const nonEmptyString = type('string >= 1')

/**
 * Create a string with min/max length constraints
 */
export const stringLength = (
	min: number,
	max?: number,
): ReturnType<typeof type> => {
	if (max !== undefined) {
		return type(`string >= ${min} & string <= ${max}`)
	}
	return type(`string >= ${min}`)
}

/**
 * Create a number with min/max constraints
 */
export const numberRange = (
	min: number,
	max: number,
): ReturnType<typeof type> => type(`number >= ${min} & number <= ${max}`)

/**
 * Bundled common schemas for convenient import
 */
export const schemas = {
	// String validators
	email,
	url,
	uuid,
	date,
	json,
	base64,
	alphanumeric,
	slug,
	semver,
	nonEmptyString,

	// Number validators
	integer,
	positive,
	nonNegative,
	percentage,

	// Boolean
	boolean,

	// Factory functions
	stringLength,
	numberRange,
} as const
