/**
 * Default error formatter - transforms ArkType errors to ValidationIssue format
 */

import { ErrorCodes, type ErrorCode } from './codes.js'

import type { ArkErrors } from 'arktype'
import type {
	ErrorFormatter,
	ErrorFormatterConfig,
	ValidationIssue,
} from './types.js'

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
			const path = [...basePath, ...this.extractPath(error)]
			const code = this.mapErrorCode(error)
			const message = this.formatMessage(error, code, path)
			const arkError = error as { expected?: string; actual?: unknown }

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

	private extractPath(error: unknown): Array<string | number> {
		const arkError = error as { path?: Array<string | number> }
		return arkError.path ?? []
	}

	private mapErrorCode(error: unknown): string {
		const arkError = error as {
			code?: string
			expected?: string
			message?: string
		}

		// Map based on expected type keywords
		if (arkError.expected) {
			const expected = arkError.expected.toLowerCase()

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
		if (arkError.code === 'predicate') return ErrorCodes.PREDICATE
		if (arkError.code === 'required') return ErrorCodes.REQUIRED

		// Check message for additional context
		if (arkError.message) {
			const msg = arkError.message.toLowerCase()
			if (msg.includes('must be at least')) return ErrorCodes.STRING_MIN
			if (msg.includes('must be at most')) return ErrorCodes.STRING_MAX
			if (msg.includes('required')) return ErrorCodes.REQUIRED
		}

		return arkError.code ?? ErrorCodes.INVALID_TYPE
	}

	private formatMessage(
		error: unknown,
		code: string,
		path: ReadonlyArray<string | number>,
	): string {
		const pathStr = path.length > 0 ? path.join('.') : 'value'
		const customTemplate = this.config.messages[code as ErrorCode]

		if (typeof customTemplate === 'function') {
			const arkError = error as { expected?: string; actual?: unknown }
			return customTemplate({
				path: pathStr,
				expected: arkError.expected,
				actual: this.sanitizeActual(arkError.actual),
			})
		}

		if (typeof customTemplate === 'string') {
			return customTemplate.replace('{path}', pathStr)
		}

		// Default: use ArkType's message
		const arkError = error as { message?: string }
		return arkError.message ?? `Validation failed at ${pathStr}`
	}

	private sanitizeActual(actual: unknown): string | undefined {
		if (actual === undefined) return undefined
		if (actual === null) return 'null'

		const str = typeof actual === 'string' ? actual : JSON.stringify(actual)

		if (str.length > this.config.maxActualLength) {
			return str.substring(0, this.config.maxActualLength) + '...'
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
