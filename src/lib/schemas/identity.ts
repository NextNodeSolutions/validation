/**
 * Identity/personal information validation schemas
 * All schemas return normalized ValidationIssue errors
 */

import { type } from 'arktype'

import { v } from '../core/engine.js'

/**
 * Phone number (E.164 international format)
 * Example: +14155552671
 */
export const phoneE164 = v.schema(type(/^\+[1-9]\d{1,14}$/))

/**
 * Phone number (flexible format)
 * Allows digits, spaces, dashes, parentheses, plus sign
 */
export const phoneFlexible = v.schema(type(/^[\d\s\-()+ ]{7,20}$/))

/**
 * US Social Security Number
 * Format: XXX-XX-XXXX
 *
 * Validates format and rejects invalid patterns per SSA guidelines:
 * - Area numbers 000, 666, and 900-999 are invalid
 * - Group number 00 is invalid
 * - Serial number 0000 is invalid
 */
export const ssnUS = v.schema(
	type(/^\d{3}-\d{2}-\d{4}$/).narrow((ssn, ctx) => {
		const [area, group, serial] = ssn.split('-')

		// Invalid area numbers: 000, 666, 900-999
		const areaNum = Number.parseInt(area!, 10)
		if (areaNum === 0 || areaNum === 666 || areaNum >= 900) {
			return ctx.reject({ expected: 'valid SSN area number' })
		}

		// Invalid group number: 00
		if (group === '00') {
			return ctx.reject({ expected: 'valid SSN group number' })
		}

		// Invalid serial number: 0000
		if (serial === '0000') {
			return ctx.reject({ expected: 'valid SSN serial number' })
		}

		return true
	}),
)

/**
 * French Social Security Number (INSEE)
 * 13 digits + 2 digit key
 */
export const ssnFR = v.schema(
	type(/^[12]\d{2}(0[1-9]|1[0-2])\d{2}\d{3}\d{3}\d{2}$/),
)

/**
 * US ZIP code (5 digits or 5+4)
 */
export const zipCodeUS = v.schema(type(/^\d{5}(-\d{4})?$/))

/**
 * UK Postal code
 */
export const postalCodeUK = v.schema(
	type(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i),
)

/**
 * French postal code (5 digits)
 */
export const postalCodeFR = v.schema(type(/^\d{5}$/))

/**
 * Canadian postal code
 */
export const postalCodeCA = v.schema(
	type(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/),
)

/**
 * Person name (letters, spaces, hyphens, apostrophes)
 * Allows accented characters
 */
export const personName = v.schema(type(/^[\p{L}\s\-']{1,100}$/u))

/**
 * First/Last name (single word, no spaces)
 */
export const singleName = v.schema(type(/^[\p{L}\-']{1,50}$/u))

/**
 * Age (reasonable human age: 0-150)
 */
export const age = v.schema(type('number.integer >= 0 & number.integer <= 150'))

/**
 * Birth date (past date)
 */
export const birthDate = v.schema(
	type('string.date').narrow((dateStr, ctx) => {
		const date = new Date(dateStr)
		const now = new Date()
		if (date > now) {
			return ctx.reject({
				expected: 'date in the past',
				actual: 'future date',
			})
		}
		return true
	}),
)

/**
 * Gender options
 */
export const gender = v.schema(
	type("'male' | 'female' | 'other' | 'prefer_not_to_say'"),
)

/**
 * Title/Salutation
 */
export const title = v.schema(
	type("'mr' | 'mrs' | 'ms' | 'miss' | 'dr' | 'prof'"),
)

/**
 * National ID (generic pattern - alphanumeric)
 */
export const nationalId = v.schema(type(/^[A-Z0-9]{5,20}$/i))

/**
 * Passport number (generic pattern)
 */
export const passportNumber = v.schema(type(/^[A-Z0-9]{6,12}$/i))

/**
 * Bundled identity schemas
 */
export const identitySchemas = {
	// Phone
	phoneE164,
	phoneFlexible,

	// Social Security
	ssnUS,
	ssnFR,

	// Postal codes
	zipCodeUS,
	postalCodeUK,
	postalCodeFR,
	postalCodeCA,

	// Names
	personName,
	singleName,

	// Personal info
	age,
	birthDate,
	gender,
	title,

	// IDs
	nationalId,
	passportNumber,
} as const
