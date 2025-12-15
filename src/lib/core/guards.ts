/**
 * Type guards for the validation library
 */

import type { Type } from 'arktype'

import type { Schema } from './types.js'

/**
 * Check if schema is our Schema wrapper or raw ArkType
 * @param schema - Schema to check
 * @returns True if schema is a wrapped Schema with safeParse method
 */
export const isWrappedSchema = <T>(
	schema: Type<T> | Schema<T>,
): schema is Schema<T> =>
	'safeParse' in schema && typeof schema.safeParse === 'function'
