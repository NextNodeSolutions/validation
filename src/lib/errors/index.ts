/**
 * Error handling exports
 */

export { ErrorCodes, type ErrorCode } from './codes.js'
export type {
	ErrorFormatter,
	ErrorFormatterConfig,
	MessageContext,
	MessageTemplate,
	ValidationIssue,
} from './types.js'
export { createErrorFormatter, DefaultErrorFormatter } from './formatter.js'
