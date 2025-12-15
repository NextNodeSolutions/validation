/**
 * Pre-built validation schemas
 */

export type { PasswordRequirements } from './auth.js'
// Auth
export {
	apiKey,
	apiKeyWithPrefix,
	authEmail,
	authSchemas,
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
// Financial (percentage re-exported from common)
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
// Network (url re-exported from common)
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
