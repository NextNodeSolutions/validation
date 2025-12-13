/**
 * Core validation engine exports
 */

export type { Infer } from './engine.js'
export { createValidationEngine, ValidationError, v } from './engine.js'
export { isWrappedSchema } from './guards.js'
export type {
	ErrorFormatter,
	Schema,
	SchemaFactory,
	SchemaMetadata,
	ValidationEngineConfig,
	ValidationIssue,
	ValidationResult,
} from './types.js'
