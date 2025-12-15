/**
 * Server middleware types
 */

import type { ValidationIssue } from '../../lib/core/types.js'

/**
 * Validation target in HTTP request
 */
export type ValidationTarget = 'body' | 'query' | 'params' | 'headers'

/**
 * HTTP error response format
 */
export interface ValidationErrorResponse {
	success: false
	error: {
		code: 'VALIDATION_ERROR'
		message: string
		issues: readonly ValidationIssue[]
	}
}
