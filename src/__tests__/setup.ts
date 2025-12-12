/**
 * Vitest global setup file
 * Silences logs during test execution
 */

import { createNoopLogger } from '@nextnode/logger/testing'
import { vi } from 'vitest'

// Mock @nextnode/logger globally to silence logs during tests
vi.mock('@nextnode/logger', () => ({
	createLogger: () => createNoopLogger(),
}))
