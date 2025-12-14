/**
 * Error formatting types
 */

/**
 * Validation issue structure
 * Re-exported from core types for convenience
 *
 * Frontend usage: t(`validation.${code}`, params)
 */
export interface ValidationIssue {
	/** Path to the invalid field. Omitted for simple schemas. */
	readonly path?: ReadonlyArray<string | number>
	readonly code: string
	readonly params?: Readonly<Record<string, unknown>>
}

/**
 * Error formatter configuration
 */
export interface ErrorFormatterConfig {
	/** Enable debug logging */
	debug?: boolean
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
