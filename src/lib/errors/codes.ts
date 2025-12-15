/**
 * Standard validation error codes
 * Used for i18n - clients can map codes to translated messages
 */
export const ErrorCodes = {
	// Type errors
	INVALID_TYPE: 'invalid_type',
	REQUIRED: 'required',
	UNEXPECTED_KEY: 'unexpected_key',

	// String errors
	STRING_MIN: 'string_min',
	STRING_MAX: 'string_max',
	STRING_LENGTH: 'string_length',
	STRING_PATTERN: 'string_pattern',
	INVALID_EMAIL: 'invalid_email',
	INVALID_URL: 'invalid_url',
	INVALID_UUID: 'invalid_uuid',
	INVALID_DATE: 'invalid_date',
	INVALID_JSON: 'invalid_json',
	INVALID_BASE64: 'invalid_base64',
	INVALID_HEX: 'invalid_hex',
	INVALID_FORMAT: 'invalid_format',

	// Number errors
	NUMBER_MIN: 'number_min',
	NUMBER_MAX: 'number_max',
	NUMBER_RANGE: 'number_range',
	NOT_INTEGER: 'not_integer',
	NOT_POSITIVE: 'not_positive',
	NOT_NEGATIVE: 'not_negative',
	INVALID_DIVISOR: 'invalid_divisor',

	// Array errors
	ARRAY_MIN: 'array_min',
	ARRAY_MAX: 'array_max',
	ARRAY_LENGTH: 'array_length',
	ARRAY_EMPTY: 'array_empty',

	// Object errors
	OBJECT_EMPTY: 'object_empty',

	// Auth errors
	INVALID_PASSWORD: 'invalid_password',
	PASSWORD_TOO_SHORT: 'password_too_short',
	PASSWORD_NO_UPPERCASE: 'password_no_uppercase',
	PASSWORD_NO_LOWERCASE: 'password_no_lowercase',
	PASSWORD_NO_NUMBER: 'password_no_number',
	PASSWORD_NO_SPECIAL: 'password_no_special',
	PASSWORDS_DONT_MATCH: 'passwords_dont_match',

	// Financial errors
	INVALID_CREDIT_CARD: 'invalid_credit_card',
	INVALID_IBAN: 'invalid_iban',
	INVALID_BIC: 'invalid_bic',
	INVALID_CURRENCY: 'invalid_currency',
	INVALID_PRICE: 'invalid_price',

	// Network errors
	INVALID_IP: 'invalid_ip',
	INVALID_IPV4: 'invalid_ipv4',
	INVALID_IPV6: 'invalid_ipv6',
	INVALID_HOSTNAME: 'invalid_hostname',
	INVALID_PORT: 'invalid_port',
	INVALID_MAC: 'invalid_mac',

	// Identity errors
	INVALID_PHONE: 'invalid_phone',
	INVALID_SSN: 'invalid_ssn',
	INVALID_POSTAL_CODE: 'invalid_postal_code',

	// Custom errors
	CUSTOM: 'custom',
	PREDICATE: 'predicate',
	NARROW: 'narrow',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
