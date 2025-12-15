/**
 * Logger functionality tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoist the mock function so it's available during mock setup
const mockError = vi.hoisted(() => vi.fn())

// Mock @nextnode/logger
vi.mock('@nextnode/logger', () => ({
	createLogger: vi.fn(() => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: mockError,
	})),
}))

import { coreLogger, logError } from '../utils/logger.js'

describe('Logger Utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Logger instances', () => {
		it('should create specialized loggers', () => {
			expect(coreLogger).toBeDefined()
		})

		it('should have logger methods', () => {
			expect(coreLogger.info).toBeDefined()
			expect(coreLogger.warn).toBeDefined()
			expect(coreLogger.error).toBeDefined()
		})
	})

	describe('logError', () => {
		it('should log Error objects with stack trace', () => {
			const error = new Error('Test error')
			const context = { userId: 123, action: 'test' }

			logError(error, context)

			expect(mockError).toHaveBeenCalledWith('Operation failed', {
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

			expect(mockError).toHaveBeenCalledWith('Operation failed', {
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

			expect(mockError).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: '[object Object]',
				},
			})
		})

		it('should handle error without context', () => {
			const error = new Error('No context error')

			logError(error)

			expect(mockError).toHaveBeenCalledWith('Operation failed', {
				details: {
					error: 'No context error',
					stack: error.stack,
				},
			})
		})
	})
})
