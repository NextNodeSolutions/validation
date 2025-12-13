/**
 * Logger functionality tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { coreLogger, logError, logger } from '../utils/logger.js'

// Mock @nextnode/logger
vi.mock('@nextnode/logger', () => ({
	createLogger: vi.fn(
		(): { info: () => void; warn: () => void; error: () => void } => ({
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		}),
	),
}))

describe('Logger Utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Logger instances', () => {
		it('should create main logger', () => {
			expect(logger).toBeDefined()
			expect(logger.info).toBeDefined()
			expect(logger.warn).toBeDefined()
			expect(logger.error).toBeDefined()
		})

		it('should create specialized loggers', () => {
			expect(coreLogger).toBeDefined()
		})
	})

	describe('logError', () => {
		it('should log Error objects with stack trace', () => {
			const error = new Error('Test error')
			const context = { userId: 123, action: 'test' }

			logError(error, context)

			expect(logger.error).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: 'Test error',
					stack: error.stack,
					context,
				},
			})
		})

		it('should log string errors', () => {
			const errorMessage = 'Simple error string'

			logError(errorMessage)

			expect(logger.error).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: errorMessage,
				},
			})
		})

		it('should log unknown error types', () => {
			const unknownError = {
				code: 'UNKNOWN',
				details: 'Something went wrong',
			}

			logError(unknownError)

			expect(logger.error).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: '[object Object]',
				},
			})
		})

		it('should handle error without context', () => {
			const error = new Error('No context error')

			logError(error)

			expect(logger.error).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: 'No context error',
					stack: error.stack,
				},
			})
		})
	})
})
