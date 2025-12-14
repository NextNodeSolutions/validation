/**
 * Core type definitions for the validation engine
 */

import type { Type } from 'arktype'

/**
 * Structured validation error with path tracking
 * Designed for form field binding and i18n support
 *
 * Frontend usage: t(`validation.${code}`, params)
 */
export interface ValidationIssue {
	/** Path to the invalid field (e.g., ['user', 'email']). Omitted for simple schemas. */
	readonly path?: ReadonlyArray<string | number>
	/** Machine-readable error code for i18n lookup */
	readonly code: string
	/** Interpolation params for i18n messages (e.g., { min: 8 }) */
	readonly params?: Readonly<Record<string, unknown>>
}

/**
 * Validation result - discriminated union
 * success: true -> data is valid
 * success: false -> issues contains validation errors
 */
export type ValidationResult<T> =
	| { readonly success: true; readonly data: T }
	| { readonly success: false; readonly issues: readonly ValidationIssue[] }

/**
 * Configuration for the validation engine
 */
export interface ValidationEngineConfig {
	/** Custom error formatter (DI) */
	errorFormatter?: ErrorFormatter
	/** Enable detailed logging */
	debug?: boolean
	/** Strip unknown keys from objects */
	stripUnknown?: boolean
}

/**
 * Error formatter interface for dependency injection
 * Allows custom error formatting without modifying core engine
 */
export interface ErrorFormatter {
	format(
		arkErrors: unknown,
		basePath?: ReadonlyArray<string | number>,
	): readonly ValidationIssue[]
}

/**
 * Schema metadata for documentation and introspection
 */
export interface SchemaMetadata {
	/** Schema name for debugging */
	name?: string
	/** Human-readable description */
	description?: string
}

/**
 * Schema wrapper with standardized validation interface
 * Wraps ArkType with consistent API (validate, parse, safeParse)
 */
export interface Schema<T = unknown> {
	/** The underlying ArkType type */
	readonly _type: Type<T>
	/** Schema metadata */
	readonly meta?: SchemaMetadata | undefined
	/** Validate data - returns result with issues */
	validate(data: unknown): ValidationResult<T>
	/** Parse data - throws ValidationError on failure */
	parse(data: unknown): T
	/** Safe parse - alias for validate */
	safeParse(data: unknown): ValidationResult<T>
}

/**
 * Factory function type for creating schemas
 */
export type SchemaFactory = <T>(
	arkType: Type<T>,
	meta?: SchemaMetadata,
) => Schema<T>
