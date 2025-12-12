/**
 * Core validation engine exports
 */

export {
	createValidationEngine,
	v,
	ValidationError,
} from './engine.js'
export type { Infer } from './engine.js'
export type {
	ErrorFormatter,
	Schema,
	SchemaFactory,
	SchemaMetadata,
	ValidationEngineConfig,
	ValidationIssue,
	ValidationResult,
} from './types.js'
