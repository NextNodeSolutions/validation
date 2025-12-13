/**
 * Network-related validation schemas
 */

import { type } from 'arktype'

import { url } from './common.js'

/**
 * IPv4 address
 */
export const ipv4 = type(
	/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
)

/**
 * IPv6 address (simplified pattern)
 */
export const ipv6 = type(
	/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$/,
)

/**
 * IP address (v4 or v6)
 * Note: Uses a union of the two patterns
 */
export const ip = type(
	/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
)

// Re-export url from common
export { url }

/**
 * Hostname (domain name without protocol)
 */
export const hostname = type(
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
)

/**
 * Port number (1-65535)
 */
export const port = type('number.integer >= 1 & number.integer <= 65535')

/**
 * MAC address (colon or hyphen separated)
 */
export const macAddress = type(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)

/**
 * HTTP method
 */
export const httpMethod = type(
	"'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'",
)

/**
 * HTTP status code ranges
 */
export const httpStatusCode = type(
	'number.integer >= 100 & number.integer <= 599',
)

/**
 * Domain with optional subdomain
 */
export const domain = type(
	/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
)

/**
 * URL slug (path segment)
 */
export const urlSlug = type(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

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
