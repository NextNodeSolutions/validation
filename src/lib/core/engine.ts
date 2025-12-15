/**
 * Core validation engine
 * Wraps ArkType with standardized interface and error formatting
 */

import type { Type } from 'arktype'
import { type } from 'arktype'

import { coreLogger, logError } from '../../utils/logger.js'
import { DefaultErrorFormatter } from '../errors/formatter.js'
import type {
	ErrorFormatter,
	Schema,
	SchemaMetadata,
	ValidationEngineConfig,
	ValidationIssue,
	ValidationResult,
} from './types.js'

/**
 * Validation error class
 * Thrown by parse() when validation fails
 */
export class ValidationError extends Error {
	readonly issues: readonly ValidationIssue[]

	constructor(issues: readonly ValidationIssue[]) {
		const summary = issues.map(i => i.code).join(', ')
		super(`Validation failed: ${summary}`)
		this.name = 'ValidationError'
		this.issues = issues
	}
}

/**
 * Creates a validation engine with configurable error formatting
 * Uses composition for extensibility via ErrorFormatter interface
 */
export const createValidationEngine = (
	config: ValidationEngineConfig = {},
): {
	schema: <T>(arkType: Type<T>, meta?: SchemaMetadata) => Schema<T>
	define: <T = unknown>(
		definition: string,
		meta?: SchemaMetadata,
	) => Schema<T>
	object: <T = Record<string, unknown>>(
		definition: Record<string, unknown>,
		meta?: SchemaMetadata,
	) => Schema<T>
} => {
	const errorFormatter: ErrorFormatter =
		config.errorFormatter ?? new DefaultErrorFormatter()

	const createSchema = <T>(
		arkType: Type<T>,
		meta?: SchemaMetadata,
	): Schema<T> => ({
		_type: arkType,
		meta,

		validate(data: unknown): ValidationResult<T> {
			const result = arkType(data)

			if (result instanceof type.errors) {
				if (config.debug) {
					coreLogger.info('Validation failed', {
						details: {
							schema: meta?.name ?? 'anonymous',
							errors: result.summary,
						},
					})
				}
				return {
					success: false,
					issues: errorFormatter.format(result),
				}
			}

			return { success: true, data: result as T }
		},

		parse(data: unknown): T {
			const result = this.validate(data)
			if (!result.success) {
				throw new ValidationError(result.issues)
			}
			return result.data
		},

		safeParse(data: unknown): ValidationResult<T> {
			return this.validate(data)
		},
	})

	return {
		/**
		 * Wrap an ArkType schema with standardized interface
		 */
		schema: createSchema,

		/**
		 * Create schema directly from ArkType definition string
		 */
		define<T = unknown>(
			definition: string,
			meta?: SchemaMetadata,
		): Schema<T> {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: ArkType requires flexible input types
				const arkType = type(definition as any) as unknown as Type<T>
				return createSchema(arkType, meta)
			} catch (error) {
				logError(error, { definition })
				throw error
			}
		},

		/**
		 * Create schema from object definition
		 */
		object<T = Record<string, unknown>>(
			definition: Record<string, unknown>,
			meta?: SchemaMetadata,
		): Schema<T> {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: ArkType requires flexible input types
				const arkType = type(definition as any) as unknown as Type<T>
				return createSchema(arkType, meta)
			} catch (error) {
				logError(error, { definition })
				throw error
			}
		},
	}
}

/**
 * Default engine instance with default configuration
 * Ready to use out of the box
 */
export const v = createValidationEngine()

/**
 * Type utility to infer schema type
 */
export type Infer<T extends Schema<unknown>> =
	T extends Schema<infer U> ? U : never
