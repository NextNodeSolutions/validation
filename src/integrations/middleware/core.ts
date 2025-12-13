/**
 * Core middleware utilities
 * Shared validation logic used by all framework adapters
 */

import type { Type } from 'arktype'
import { type } from 'arktype'

import { isWrappedSchema } from '../../lib/core/guards.js'
import type {
	Schema,
	ValidationIssue,
	ValidationResult,
} from '../../lib/core/types.js'
import { DefaultErrorFormatter } from '../../lib/errors/formatter.js'
import { coreLogger } from '../../utils/logger.js'
import type { ValidationErrorResponse } from './types.js'

const errorFormatter = new DefaultErrorFormatter()

/**
 * Core validation function used by all framework adapters
 * Pure function - no framework dependencies
 */
export const validateData = <T>(
	schema: Type<T> | Schema<T>,
	data: unknown,
): ValidationResult<T> => {
	if (isWrappedSchema(schema)) {
		return schema.safeParse(data)
	}

	const result = schema(data)

	if (result instanceof type.errors) {
		return {
			success: false,
			issues: errorFormatter.format(result),
		}
	}

	return { success: true, data: result as T }
}

/**
 * Creates standardized error response
 */
export const createErrorResponse = (
	issues: readonly ValidationIssue[],
): ValidationErrorResponse => {
	coreLogger.info('Validation failed', {
		details: { issueCount: issues.length },
	})

	return {
		success: false,
		error: {
			code: 'VALIDATION_ERROR',
			message: `Validation failed: ${issues.length} issue(s)`,
			issues,
		},
	}
}
