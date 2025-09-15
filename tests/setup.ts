/**
 * Vitest setup file to configure global test environment
 */

import { vi } from 'vitest'

// Mock @nextnode/logger to silence all logging during tests
vi.mock('@nextnode/logger', () => ({
	createLogger: vi.fn(() => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	})),
}))
