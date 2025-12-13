/**
 * Logger utility for @nextnode/validation
 * Centralized logging with @nextnode/logger
 */

import { createLogger } from '@nextnode/logger'

export const logger = createLogger()

export const coreLogger = createLogger({
	prefix: 'CORE',
})

/**
 * Log helper for errors with context
 * @param error - Error object or message
 * @param context - Additional context
 */
export const logError = (
	error: unknown,
	context?: Record<string, unknown>,
): void => {
	const errorMessage = error instanceof Error ? error.message : String(error)
	const errorStack = error instanceof Error ? error.stack : undefined

	const errorDetails: Record<string, unknown> = { error: errorMessage }
	if (errorStack) errorDetails.stack = errorStack
	if (context) errorDetails.context = context

	logger.error('Operation failed', { details: errorDetails })
}
