/**
 * Default error formatter - transforms ArkType errors to ValidationIssue format
 */

import type { ArkErrors } from 'arktype'

import type { ErrorCode } from './codes.js'
import { ErrorCodes } from './codes.js'
import type {
	ErrorFormatter,
	ErrorFormatterConfig,
	ValidationIssue,
} from './types.js'

/**
 * Internal representation of ArkType error properties
 * Used to avoid repeated type assertions when accessing error fields
 */
interface ArkTypeError {
	code?: string
	expected?: string
	actual?: unknown
	path?: ReadonlyArray<string | number>
	message?: string
}

/**
 * Default error formatter implementation
 * Implements ErrorFormatter interface for DI
 */
export class DefaultErrorFormatter implements ErrorFormatter {
	private readonly config: Required<ErrorFormatterConfig>

	constructor(config: ErrorFormatterConfig = {}) {
		this.config = {
			includeDetails: config.includeDetails ?? true,
			messages: config.messages ?? {},
			maxActualLength: config.maxActualLength ?? 50,
		}
	}

	format(
		arkErrors: ArkErrors,
		basePath: ReadonlyArray<string | number> = [],
	): readonly ValidationIssue[] {
		const issues: ValidationIssue[] = []

		for (const error of arkErrors) {
			const arkError = error as ArkTypeError
			const path = [...basePath, ...this.extractPath(arkError)]

			// Check if this is a compound error (multiple failures in one)
			const splitIssues = this.splitCompoundError(arkError, path)
			if (splitIssues.length > 0) {
				issues.push(...splitIssues)
				continue
			}

			const code = this.mapErrorCode(arkError)
			const message = this.formatMessage(arkError, code, path)

			const issue: ValidationIssue = this.config.includeDetails
				? {
						path,
						code,
						message,
						expected: arkError.expected,
						actual: this.sanitizeActual(arkError.actual),
					}
				: {
						path,
						code,
						message,
					}

			issues.push(issue)
		}

		return issues
	}

	/**
	 * Split compound ArkType errors (multiple failures in one) into separate issues
	 * ArkType uses ◦ bullets when multiple ctx.reject() calls are made
	 */
	private splitCompoundError(
		error: ArkTypeError,
		path: ReadonlyArray<string | number>,
	): ValidationIssue[] {
		const expected = error.expected ?? ''

		// Check if this is a compound error with bullet points
		if (!expected.includes('◦')) {
			return []
		}

		// Split by bullet points and create separate issues
		const failures = expected
			.split('◦')
			.map(s => s.trim())
			.filter(s => s.length > 0)

		return failures.map(failure => {
			const issue: ValidationIssue = {
				path: [...path],
				code: this.mapErrorCodeFromExpected(failure),
				message: `must have ${failure}`,
				...(this.config.includeDetails && {
					expected: failure,
					actual: this.sanitizeActual(error.actual),
				}),
			}
			return issue
		})
	}

	/**
	 * Map error code from a single expected string
	 */
	private mapErrorCodeFromExpected(expected: string): string {
		const lower = expected.toLowerCase()

		if (lower.includes('character')) return ErrorCodes.STRING_MIN
		if (lower.includes('uppercase')) return ErrorCodes.PREDICATE
		if (lower.includes('lowercase')) return ErrorCodes.PREDICATE
		if (lower.includes('number')) return ErrorCodes.PREDICATE
		if (lower.includes('special')) return ErrorCodes.PREDICATE

		return ErrorCodes.PREDICATE
	}

	private extractPath(error: ArkTypeError): Array<string | number> {
		return error.path ? [...error.path] : []
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Error mapping requires many conditions
	private mapErrorCode(error: ArkTypeError): string {
		// Map based on expected type keywords
		if (error.expected) {
			const expected = error.expected.toLowerCase()

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
		}

		// Map based on ArkType error codes
		if (error.code === 'predicate') return ErrorCodes.PREDICATE
		if (error.code === 'required') return ErrorCodes.REQUIRED

		// Check message for additional context
		if (error.message) {
			const msg = error.message.toLowerCase()
			if (msg.includes('must be at least')) return ErrorCodes.STRING_MIN
			if (msg.includes('must be at most')) return ErrorCodes.STRING_MAX
			if (msg.includes('required')) return ErrorCodes.REQUIRED
		}

		return error.code ?? ErrorCodes.INVALID_TYPE
	}

	private formatMessage(
		error: ArkTypeError,
		code: string,
		path: ReadonlyArray<string | number>,
	): string {
		const pathStr = path.length > 0 ? path.join('.') : 'value'
		const customTemplate = this.config.messages[code as ErrorCode]

		if (typeof customTemplate === 'function') {
			return customTemplate({
				path: pathStr,
				expected: error.expected,
				actual: this.sanitizeActual(error.actual),
			})
		}

		if (typeof customTemplate === 'string') {
			return customTemplate.replace('{path}', pathStr)
		}

		// Default: use ArkType's message
		return error.message ?? `Validation failed at ${pathStr}`
	}

	private sanitizeActual(actual: unknown): string | undefined {
		if (actual === undefined) return undefined
		if (actual === null) return 'null'

		const str = typeof actual === 'string' ? actual : JSON.stringify(actual)

		if (str.length > this.config.maxActualLength) {
			return `${str.substring(0, this.config.maxActualLength)}...`
		}

		return str
	}
}

/**
 * Factory function for creating custom formatters
 */
export const createErrorFormatter = (
	config: ErrorFormatterConfig = {},
): ErrorFormatter => new DefaultErrorFormatter(config)
