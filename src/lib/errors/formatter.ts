/**
 * Default error formatter - transforms ArkType errors to ValidationIssue format
 *
 * Outputs only: path, code, params (for i18n)
 * Frontend handles message generation via i18n
 */

import type { ArkErrors } from 'arktype'

import type { ErrorFormatter, ValidationIssue } from '../core/types.js'
import { ErrorCodes } from './codes.js'

/**
 * Internal representation of ArkType error properties
 */
interface ArkTypeError {
	code?: string
	expected?: string
	actual?: unknown
	path?: ReadonlyArray<string | number>
	message?: string
	rule?: unknown // constraint value (e.g., minLength number, regex pattern)
}

/**
 * Default error formatter implementation
 * Extracts code + params for i18n, no message generation
 */
export class DefaultErrorFormatter implements ErrorFormatter {
	/**
	 * Create a ValidationIssue, omitting path if empty
	 */
	private createIssue(
		path: ReadonlyArray<string | number>,
		code: string,
		params?: Record<string, unknown>,
	): ValidationIssue {
		return {
			...(path.length > 0 && { path }),
			code,
			...(params && { params }),
		}
	}

	format(
		arkErrors: ArkErrors,
		basePath: ReadonlyArray<string | number> = [],
	): readonly ValidationIssue[] {
		const issues: ValidationIssue[] = []

		for (const error of arkErrors) {
			const arkError = error as ArkTypeError
			const path = [...basePath, ...(arkError.path ?? [])]

			// Handle compound errors (multiple failures in one)
			const splitIssues = this.splitCompoundError(arkError, path)
			if (splitIssues.length > 0) {
				issues.push(...splitIssues)
				continue
			}

			const code = this.mapErrorCode(arkError)
			const params = this.extractParams(arkError, code)

			issues.push(this.createIssue(path, code, params))
		}

		return issues
	}

	/**
	 * Split compound ArkType errors (◦ bullets) into separate issues
	 */
	private splitCompoundError(
		error: ArkTypeError,
		path: ReadonlyArray<string | number>,
	): ValidationIssue[] {
		const expected = error.expected ?? ''
		if (!expected.includes('◦')) return []

		return expected
			.split('◦')
			.map(s => s.trim())
			.filter(s => s.length > 0)
			.map(failure => {
				const code = this.mapErrorCodeFromExpected(failure)
				const params = this.extractParamsFromExpected(failure)
				return this.createIssue([...path], code, params)
			})
	}

	/**
	 * Map error code from expected string (for split compound errors)
	 */
	private mapErrorCodeFromExpected(expected: string): string {
		const lower = expected.toLowerCase()

		if (lower.includes('character')) return ErrorCodes.STRING_MIN
		if (lower.includes('uppercase')) return ErrorCodes.PASSWORD_NO_UPPERCASE
		if (lower.includes('lowercase')) return ErrorCodes.PASSWORD_NO_LOWERCASE
		if (lower.includes('number') || lower.includes('digit'))
			return ErrorCodes.PASSWORD_NO_NUMBER
		if (lower.includes('special')) return ErrorCodes.PASSWORD_NO_SPECIAL

		return ErrorCodes.PREDICATE
	}

	/**
	 * Extract params from expected string (for split compound errors)
	 */
	private extractParamsFromExpected(
		expected: string,
	): Record<string, unknown> | undefined {
		// Extract "at least N characters" pattern
		const minMatch = expected.match(/at least (\d+) character/i)
		if (minMatch?.[1]) {
			return { min: Number.parseInt(minMatch[1], 10) }
		}
		return undefined
	}

	/**
	 * Map ArkType error to our error code
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Error mapping requires many conditions
	private mapErrorCode(error: ArkTypeError): string {
		const expected = error.expected?.toLowerCase() ?? ''
		const message = error.message?.toLowerCase() ?? ''

		// Format validators (email, url, uuid, etc.)
		if (expected.includes('email')) return ErrorCodes.INVALID_EMAIL
		if (expected.includes('url')) return ErrorCodes.INVALID_URL
		if (expected.includes('uuid')) return ErrorCodes.INVALID_UUID
		if (expected.includes('date')) return ErrorCodes.INVALID_DATE
		if (expected.includes('json')) return ErrorCodes.INVALID_JSON
		if (expected.includes('base64')) return ErrorCodes.INVALID_BASE64
		if (expected.includes('hex')) return ErrorCodes.INVALID_HEX
		if (expected.includes('integer')) return ErrorCodes.NOT_INTEGER
		if (
			expected.includes('creditcard') ||
			expected.includes('credit card')
		) {
			return ErrorCodes.INVALID_CREDIT_CARD
		}
		if (expected.includes('ip')) {
			if (expected.includes('v4')) return ErrorCodes.INVALID_IPV4
			if (expected.includes('v6')) return ErrorCodes.INVALID_IPV6
			return ErrorCodes.INVALID_IP
		}

		// Length/range constraints
		if (
			error.code === 'minLength' ||
			message.includes('must be at least')
		) {
			return ErrorCodes.STRING_MIN
		}
		if (error.code === 'maxLength' || message.includes('must be at most')) {
			return ErrorCodes.STRING_MAX
		}

		// ArkType error codes
		if (error.code === 'predicate') return ErrorCodes.PREDICATE
		if (error.code === 'required' || expected === 'required')
			return ErrorCodes.REQUIRED

		return error.code ?? ErrorCodes.INVALID_TYPE
	}

	/**
	 * Extract constraint params from ArkType error
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Param extraction requires checking multiple conditions
	private extractParams(
		error: ArkTypeError,
		code: string,
	): Record<string, unknown> | undefined {
		const params: Record<string, unknown> = {}

		// Extract constraint value from rule
		if (error.rule !== undefined && error.rule !== null) {
			const isMinCode =
				code === ErrorCodes.STRING_MIN ||
				code === ErrorCodes.ARRAY_MIN ||
				code === ErrorCodes.NUMBER_MIN
			const isMaxCode =
				code === ErrorCodes.STRING_MAX ||
				code === ErrorCodes.ARRAY_MAX ||
				code === ErrorCodes.NUMBER_MAX

			if (isMinCode) params.min = error.rule
			else if (isMaxCode) params.max = error.rule
		}

		// Extract from expected string patterns (fallback)
		if (error.expected) {
			const minMatch = error.expected.match(/at least (\d+)/i)
			if (minMatch?.[1] && !params.min) {
				params.min = Number.parseInt(minMatch[1], 10)
			}

			const maxMatch = error.expected.match(/at most (\d+)/i)
			if (maxMatch?.[1] && !params.max) {
				params.max = Number.parseInt(maxMatch[1], 10)
			}
		}

		// Add expected type for type errors
		if (code === ErrorCodes.INVALID_TYPE && error.expected) {
			params.expected = error.expected
		}

		return Object.keys(params).length > 0 ? params : undefined
	}
}

/**
 * Singleton instance of DefaultErrorFormatter
 * Use this instead of creating new instances
 */
export const defaultErrorFormatter = new DefaultErrorFormatter()
