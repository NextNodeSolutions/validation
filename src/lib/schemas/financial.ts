/**
 * Financial validation schemas
 * All schemas return normalized ValidationIssue errors
 */

import { type } from 'arktype'

import { v } from '../core/engine.js'
import { percentage } from './common.js'

/**
 * Credit card number using Luhn algorithm validation (FORMAT ONLY)
 *
 * @security This validates card number format and Luhn checksum only.
 * It does NOT:
 * - Verify the card exists or is active
 * - Check card type prefixes (Visa, Mastercard, etc.)
 * - Reject known test card numbers (e.g., 4111111111111111)
 *
 * For production payment processing, use a payment provider (Stripe, etc.)
 * that handles full card validation and PCI compliance.
 */
export const creditCard = v.schema(
	type('string').narrow((cardNumber, ctx) => {
		// Remove spaces and dashes
		const cleaned = cardNumber.replace(/[\s-]/g, '')

		// Check if only digits
		if (!/^\d+$/.test(cleaned)) {
			return ctx.reject({
				expected: 'numeric credit card number',
			})
		}

		// Check length (most cards are 13-19 digits)
		if (cleaned.length < 13 || cleaned.length > 19) {
			return ctx.reject({
				expected: 'credit card number with 13-19 digits',
			})
		}

		// Luhn algorithm
		let sum = 0
		let isEven = false

		for (let i = cleaned.length - 1; i >= 0; i--) {
			let digit = Number.parseInt(cleaned[i]!, 10)

			if (isEven) {
				digit *= 2
				if (digit > 9) {
					digit -= 9
				}
			}

			sum += digit
			isEven = !isEven
		}

		if (sum % 10 !== 0) {
			return ctx.reject({
				expected: 'valid credit card number',
			})
		}

		return true
	}),
)

/**
 * Currency code (ISO 4217)
 */
export const currencyCode = v.schema(type(/^[A-Z]{3}$/))

/**
 * Price/amount: positive number with max 2 decimal places
 */
export const price = v.schema(
	type('number > 0').narrow((n, ctx) => {
		const decimals = (n.toString().split('.')[1] ?? '').length
		if (decimals > 2) {
			return ctx.reject({
				expected: 'price with max 2 decimal places',
				actual: `${decimals} decimal places`,
			})
		}
		return true
	}),
)

// Re-export percentage from common (already wrapped)
export { percentage }

/**
 * IBAN (International Bank Account Number) - FORMAT ONLY
 *
 * @security This validates IBAN string format only (country code + check digits + BBAN).
 * It does NOT verify check digit validity using MOD 97-10 algorithm.
 * Invalid IBANs may pass format validation.
 *
 * For actual IBAN verification, use a dedicated library like `ibantools`.
 */
export const iban = v.schema(type(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/))

/**
 * BIC/SWIFT code
 */
export const bic = v.schema(type(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/))

/**
 * Amount with optional negative (for transactions)
 */
export const amount = v.schema(
	type('number').narrow((n, ctx) => {
		const decimals = (Math.abs(n).toString().split('.')[1] ?? '').length
		if (decimals > 2) {
			return ctx.reject({
				expected: 'amount with max 2 decimal places',
				actual: `${decimals} decimal places`,
			})
		}
		return true
	}),
)

/**
 * Tax ID patterns for common countries
 */
export const taxIdUS = v.schema(type(/^\d{2}-\d{7}$/)) // EIN format
export const taxIdFR = v.schema(type(/^FR\d{11}$/)) // French VAT

/**
 * Bundled financial schemas
 */
export const financialSchemas = {
	creditCard,
	currencyCode,
	price,
	percentage,
	iban,
	bic,
	amount,
	taxIdUS,
	taxIdFR,
} as const
