/**
 * Common validation schemas
 * Pre-built validators with normalized error output
 */

import { type } from 'arktype'

import { v } from '../core/engine.js'
import type { Schema } from '../core/types.js'

/**
 * Common string validators
 */
export const email = v.schema(type('string.email'))
export const url = v.schema(type('string.url'))
export const uuid = v.schema(type('string.uuid'))
export const date = v.schema(type('string.date'))
export const json = v.schema(type('string.json'))
export const base64 = v.schema(type('string.base64'))
export const alphanumeric = v.schema(type('string.alphanumeric'))

/**
 * Slug pattern: lowercase letters, numbers, and hyphens
 */
export const slug = v.schema(type(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))

/**
 * Semantic version pattern
 * Limited to 256 characters to prevent ReDoS
 */
export const semver = v.schema(
	type('string <= 256').narrow((value, ctx) => {
		if (!/^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/.test(value)) {
			return ctx.reject({ expected: 'valid semver' })
		}
		return true
	}),
)

/**
 * Common number validators
 */
export const integer = v.schema(type('number.integer'))
export const positive = v.schema(type('number > 0'))
export const nonNegative = v.schema(type('number >= 0'))
export const percentage = v.schema(type('number >= 0 & number <= 100'))

/**
 * Boolean validator
 */
export const boolean = v.schema(type('boolean'))

/**
 * Non-empty string
 */
export const nonEmptyString = v.schema(type('string >= 1'))

/**
 * Create a string with min/max length constraints
 */
export const stringLength = (min: number, max?: number): Schema<string> => {
	if (max !== undefined) {
		return v.schema(type(`string >= ${min} & string <= ${max}`))
	}
	return v.schema(type(`string >= ${min}`))
}

/**
 * Create a number with min/max constraints
 */
export const numberRange = (min: number, max: number): Schema<number> =>
	v.schema(type(`number >= ${min} & number <= ${max}`))

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
