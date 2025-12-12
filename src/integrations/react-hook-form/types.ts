/**
 * React Hook Form integration types
 */

import type { Type } from 'arktype'
import type { Schema } from '../../lib/core/types.js'

/**
 * Options for the ArkType resolver
 */
export interface ArktypeResolverOptions {
	/**
	 * Validate all field criteria (shows all errors for a field)
	 * @default false
	 */
	validateAllFieldCriteria?: boolean
}

/**
 * Field error structure (from react-hook-form)
 */
export interface FieldError {
	type: string
	message?: string
	types?: Record<string, string>
}

/**
 * Field errors map (from react-hook-form)
 */
export type FieldErrors<T = Record<string, unknown>> = {
	[K in keyof T]?: FieldError
}

/**
 * Resolver result (from react-hook-form)
 */
export type ResolverResult<T> =
	| { values: T; errors: Record<string, never> }
	| { values: Record<string, never>; errors: FieldErrors<T> }

/**
 * ArkType resolver function signature
 */
export type ArktypeResolver = <T extends Record<string, unknown>>(
	schema: Type<T> | Schema<T>,
	options?: ArktypeResolverOptions,
) => (values: T) => Promise<ResolverResult<T>>
