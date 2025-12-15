/**
 * React Hook Form resolver for ArkType schemas
 */

import type { Type } from 'arktype'
import { type } from 'arktype'

import { isWrappedSchema } from '../../lib/core/guards.js'
import type { Schema, ValidationIssue } from '../../lib/core/types.js'
import { defaultErrorFormatter } from '../../lib/errors/formatter.js'
import type {
	ArktypeResolverOptions,
	FieldError,
	FieldErrors,
	ResolverResult,
} from './types.js'

/**
 * Converts validation issues to React Hook Form FieldErrors
 *
 * RHF requires message field - uses code (frontend handles i18n)
 */
const issuesToFieldErrors = <T>(
	issues: readonly ValidationIssue[],
	validateAllFieldCriteria: boolean,
): FieldErrors<T> => {
	const errors: Record<string, FieldError> = {}

	for (const issue of issues) {
		const path = (issue.path ?? []).join('.')

		if (!path) continue

		if (!errors[path]) {
			errors[path] = {
				type: issue.code,
				message: issue.code,
			}
		}

		if (validateAllFieldCriteria) {
			const types = errors[path].types ?? {}
			errors[path].types = {
				...types,
				[issue.code]: issue.code,
			}
		}
	}

	return errors as FieldErrors<T>
}

/**
 * Creates a resolver for React Hook Form using ArkType schemas
 *
 * @example
 * ```typescript
 * import { useForm } from 'react-hook-form'
 * import { arktypeResolver } from '@nextnode/validation/react-hook-form'
 * import { type } from 'arktype'
 *
 * const schema = type({
 *   email: 'string.email',
 *   password: 'string >= 8'
 * })
 *
 * function LoginForm() {
 *   const { register, handleSubmit, formState: { errors } } = useForm({
 *     resolver: arktypeResolver(schema)
 *   })
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register('email')} />
 *       {errors.email && <span>{errors.email.message}</span>}
 *       <input {...register('password')} type="password" />
 *       {errors.password && <span>{errors.password.message}</span>}
 *       <button type="submit">Login</button>
 *     </form>
 *   )
 * }
 * ```
 */
export const arktypeResolver = <T extends Record<string, unknown>>(
	schema: Type<T> | Schema<T>,
	options: ArktypeResolverOptions = {},
): ((values: T) => Promise<ResolverResult<T>>) => {
	const { validateAllFieldCriteria = false } = options

	return async (values: T): Promise<ResolverResult<T>> => {
		// Using our Schema wrapper
		if (isWrappedSchema(schema)) {
			const result = schema.safeParse(values)

			if (result.success) {
				return {
					values: result.data as T,
					errors: {},
				}
			}

			return {
				values: {},
				errors: issuesToFieldErrors<T>(
					result.issues,
					validateAllFieldCriteria,
				),
			}
		}

		// Raw ArkType usage
		const result = schema(values)

		if (result instanceof type.errors) {
			const issues = defaultErrorFormatter.format(result)

			return {
				values: {},
				errors: issuesToFieldErrors<T>(
					issues,
					validateAllFieldCriteria,
				),
			}
		}

		return {
			values: result as T,
			errors: {},
		}
	}
}
