/**
 * Vitest global setup file
 * Silences logs during test execution
 *
 * Note: Once @nextnode/logger is updated with /testing export, replace with:
 * import { createNoopLogger } from '@nextnode/logger/testing'
 * vi.mock('@nextnode/logger', () => ({ createLogger: () => createNoopLogger() }))
 */

import { vi } from 'vitest'

// Mock @nextnode/logger globally to silence logs during tests
vi.mock('@nextnode/logger', () => ({
	createLogger: (): {
		info: () => void
		warn: () => void
		error: () => void
		debug: () => void
	} => ({
		info: (): void => {},
		warn: (): void => {},
		error: (): void => {},
		debug: (): void => {},
	}),
}))
