/**
 * Error formatting types
 */

import type { ErrorCode } from './codes.js'

/**
 * Validation issue structure
 * Re-exported from core types for convenience
 */
export interface ValidationIssue {
	readonly path: ReadonlyArray<string | number>
	readonly code: ErrorCode | string
	readonly message: string
	readonly expected?: string | undefined
	readonly actual?: string | undefined
}

/**
 * Context for custom message templates
 */
export interface MessageContext {
	/** Field path as string (e.g., "user.email") */
	path: string
	/** Expected type/value */
	expected?: string | undefined
	/** Actual value received */
	actual?: string | undefined
	/** Constraint value (e.g., min length) */
	constraint?: string | number | undefined
}

/**
 * Message template - string or function
 */
export type MessageTemplate = string | ((ctx: MessageContext) => string)

/**
 * Error formatter configuration
 */
export interface ErrorFormatterConfig {
	/** Include expected/actual in messages */
	includeDetails?: boolean
	/** Custom message templates per error code */
	messages?: Partial<Record<ErrorCode, MessageTemplate>>
	/** Maximum length for actual value in error */
	maxActualLength?: number
}

/**
 * Error formatter interface (DI)
 */
export interface ErrorFormatter {
	format(
		arkErrors: unknown,
		basePath?: ReadonlyArray<string | number>,
	): readonly ValidationIssue[]
}
