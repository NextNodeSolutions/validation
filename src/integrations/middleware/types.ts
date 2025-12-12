/**
 * Server middleware types
 */

import type { Type } from 'arktype'

import type { Schema, ValidationIssue } from '../../lib/core/types.js'

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

/**
 * Middleware configuration
 */
export interface MiddlewareConfig<T = unknown> {
	/** Schema to validate against */
	schema: Type<T> | Schema<T>
	/** What part of request to validate */
	target: ValidationTarget
	/** Custom error handler */
	onError?: ErrorHandler
}

/**
 * Error handler callback
 */
export type ErrorHandler = (
	issues: readonly ValidationIssue[],
	context: ErrorHandlerContext,
) => unknown

/**
 * Error handler context
 */
export interface ErrorHandlerContext {
	target: ValidationTarget
	originalData: unknown
}

/**
 * Framework adapter interface (for DI)
 */
export interface FrameworkAdapter<TMiddleware> {
	createMiddleware<T>(config: MiddlewareConfig<T>): TMiddleware
}
