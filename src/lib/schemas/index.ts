/**
 * Pre-built validation schemas
 */

// Common
export {
	alphanumeric,
	base64,
	boolean,
	date,
	email,
	integer,
	json,
	nonEmptyString,
	nonNegative,
	numberRange,
	percentage,
	positive,
	schemas,
	semver,
	slug,
	stringLength,
	url,
	uuid,
} from './common.js'

// Auth
export {
	apiKey,
	authEmail,
	authSchemas,
	createApiKey,
	createPasswordSchema,
	jwtToken,
	loginSchema,
	passwordBasic,
	passwordResetRequestSchema,
	passwordResetSchema,
	registerSchema,
	strongPassword,
	username,
} from './auth.js'
export type { PasswordRequirements } from './auth.js'

// Financial
export {
	amount,
	bic,
	creditCard,
	currencyCode,
	financialSchemas,
	iban,
	price,
	taxIdFR,
	taxIdUS,
} from './financial.js'
// Note: percentage is already exported from common

// Network
export {
	domain,
	hostname,
	httpMethod,
	httpStatusCode,
	ip,
	ipv4,
	ipv6,
	macAddress,
	networkSchemas,
	port,
	urlSlug,
} from './network.js'
// Note: url is already exported from common

// Identity
export {
	age,
	birthDate,
	gender,
	identitySchemas,
	nationalId,
	passportNumber,
	personName,
	phoneE164,
	phoneFlexible,
	postalCodeCA,
	postalCodeFR,
	postalCodeUK,
	singleName,
	ssnFR,
	ssnUS,
	title,
	zipCodeUS,
} from './identity.js'
