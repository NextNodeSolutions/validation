/**
 * Network-related validation schemas
 * All schemas return normalized ValidationIssue errors
 */

import { type } from 'arktype'

import { v } from '../core/engine.js'
import { slug, url } from './common.js'

/**
 * IPv4 address
 */
export const ipv4 = v.schema(
	type(
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
	),
)

/**
 * IPv6 address (simplified pattern)
 */
export const ipv6 = v.schema(
	type(
		/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/,
	),
)

/**
 * IP address (v4 or v6)
 * Note: Uses a union of the two patterns
 */
export const ip = v.schema(
	type(
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
	),
)

// Re-export url from common (already wrapped)
export { url }

/**
 * Hostname (domain name without protocol)
 * Limited to 253 characters per RFC 1035 to prevent ReDoS
 */
export const hostname = v.schema(
	type('string <= 253').narrow((value, ctx) => {
		if (
			!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
				value,
			)
		) {
			return ctx.reject({ expected: 'valid hostname' })
		}
		return true
	}),
)

/**
 * Port number (1-65535)
 */
export const port = v.schema(
	type('number.integer >= 1 & number.integer <= 65535'),
)

/**
 * MAC address (colon or hyphen separated)
 */
export const macAddress = v.schema(
	type(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
)

/**
 * HTTP method
 */
export const httpMethod = v.schema(
	type("'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'"),
)

/**
 * HTTP status code ranges
 */
export const httpStatusCode = v.schema(
	type('number.integer >= 100 & number.integer <= 599'),
)

/**
 * Domain with optional subdomain
 * Limited to 253 characters per RFC 1035 to prevent ReDoS
 */
export const domain = v.schema(
	type('string <= 253').narrow((value, ctx) => {
		if (
			!/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
				value,
			)
		) {
			return ctx.reject({ expected: 'valid domain' })
		}
		return true
	}),
)

/**
 * URL slug (path segment)
 * Alias for slug from common schemas
 */
export const urlSlug = slug

/**
 * Bundled network schemas
 */
export const networkSchemas = {
	ipv4,
	ipv6,
	ip,
	url,
	hostname,
	port,
	macAddress,
	httpMethod,
	httpStatusCode,
	domain,
	urlSlug,
} as const
