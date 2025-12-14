/**
 * Pre-built schemas tests
 */

import { describe, expect, it } from 'vitest'

import {
	age,
	// Auth
	authSchemas,
	createApiKey,
	createPasswordSchema,
	creditCard,
	currencyCode,
	date,
	email,
	// Financial
	financialSchemas,
	hostname,
	// Identity
	identitySchemas,
	ipv4,
	ipv6,
	json,
	loginSchema,
	macAddress,
	// Network
	networkSchemas,
	phoneE164,
	phoneFlexible,
	port,
	postalCodeFR,
	price,
	registerSchema,
	// Common
	schemas,
	semver,
	slug,
	ssnUS,
	strongPassword,
	url,
	username,
	uuid,
	zipCodeUS,
} from '../lib/schemas/index.js'

describe('Pre-built Schemas', () => {
	describe('Common Schemas', () => {
		describe('email', () => {
			it('should accept valid emails', () => {
				const validEmails = [
					'test@example.com',
					'user.name@domain.org',
					'user+tag@example.co.uk',
				]

				validEmails.forEach(e => {
					const result = email.safeParse(e)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid emails', () => {
				const invalidEmails = [
					'invalid',
					'@domain.com',
					'user@',
					'spaces here@example.com',
				]

				invalidEmails.forEach(e => {
					const result = email.safeParse(e)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('url', () => {
			it('should accept valid URLs', () => {
				const validUrls = [
					'https://example.com',
					'http://localhost:3000',
					'https://sub.domain.org/path?query=1',
				]

				validUrls.forEach(u => {
					const result = url.safeParse(u)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid URLs', () => {
				// ArkType's string.url accepts various URL schemes
				const invalidUrls = ['not-a-url', 'just some text']

				invalidUrls.forEach(u => {
					const result = url.safeParse(u)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('uuid', () => {
			it('should accept valid UUIDs', () => {
				const validUuids = [
					'550e8400-e29b-41d4-a716-446655440000',
					'6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				]

				validUuids.forEach(u => {
					const result = uuid.safeParse(u)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid UUIDs', () => {
				const invalidUuids = [
					'not-a-uuid',
					'550e8400-e29b-41d4-a716',
					'12345',
				]

				invalidUuids.forEach(u => {
					const result = uuid.safeParse(u)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('date (ISO)', () => {
			it('should accept valid ISO dates', () => {
				const validDates = ['2024-01-15', '2023-12-31', '2000-06-30']

				validDates.forEach(d => {
					const result = date.safeParse(d)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('json', () => {
			it('should accept valid JSON strings', () => {
				const validJson = [
					'{}',
					'{"key":"value"}',
					'[]',
					'[1,2,3]',
					'"string"',
				]

				validJson.forEach(j => {
					const result = json.safeParse(j)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid JSON', () => {
				const invalidJson = [
					'{invalid}',
					"{'key': 'value'}",
					'undefined',
				]

				invalidJson.forEach(j => {
					const result = json.safeParse(j)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('semver', () => {
			it('should accept valid semver versions', () => {
				const validVersions = ['1.0.0', '2.1.3', '0.0.1', '10.20.30']

				validVersions.forEach(v => {
					const result = semver.safeParse(v)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('slug', () => {
			it('should accept valid slugs', () => {
				const validSlugs = ['my-slug', 'post-123', 'a-b-c']

				validSlugs.forEach(s => {
					const result = slug.safeParse(s)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid slugs', () => {
				const invalidSlugs = [
					'Has Spaces',
					'UPPERCASE',
					'special!chars',
				]

				invalidSlugs.forEach(s => {
					const result = slug.safeParse(s)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('schemas collection', () => {
			it('should export all common schemas', () => {
				expect(schemas.email).toBeDefined()
				expect(schemas.url).toBeDefined()
				expect(schemas.uuid).toBeDefined()
				expect(schemas.date).toBeDefined()
			})
		})
	})

	describe('Auth Schemas', () => {
		describe('strongPassword', () => {
			it('should accept valid strong passwords', () => {
				const validPasswords = [
					'Password123!',
					'MyStr0ng@Pass',
					'Complex1!Pass',
				]

				validPasswords.forEach(p => {
					const result = strongPassword.safeParse(p)
					expect(result.success).toBe(true)
				})
			})

			it('should reject weak passwords', () => {
				const weakPasswords = [
					'short1!', // too short
					'nouppercase1!', // no uppercase
					'NOLOWERCASE1!', // no lowercase
					'NoNumbers!', // no number
					'NoSpecial123', // no special char
				]

				weakPasswords.forEach(p => {
					const result = strongPassword.safeParse(p)
					expect(result.success).toBe(false)
				})
			})

			it('should collect ALL errors by default (not fail-fast)', () => {
				// Password with multiple issues: too short, no uppercase, no number, no special
				const result = strongPassword.safeParse('abc')

				expect(result.success).toBe(false)
				if (!result.success) {
					// Should have multiple issues
					expect(result.issues.length).toBeGreaterThan(1)
					const codes = result.issues.map(i => i.code)
					expect(codes).toContain('string_min')
				}
			})
		})

		describe('createPasswordSchema', () => {
			it('should collect all errors when failFast is false (default)', () => {
				const schema = createPasswordSchema({
					minLength: 8,
					requireUppercase: true,
					requireNumbers: true,
					requireSpecialChars: true,
				})

				const result = schema.safeParse('abc')

				expect(result.success).toBe(false)
				if (!result.success) {
					// Should have multiple issues
					expect(result.issues.length).toBeGreaterThan(1)
				}
			})

			it('should stop at first error when failFast is true', () => {
				const schema = createPasswordSchema({
					minLength: 8,
					requireUppercase: true,
					requireNumbers: true,
					requireSpecialChars: true,
					failFast: true,
				})

				const result = schema.safeParse('abc')

				expect(result.success).toBe(false)
				if (!result.success) {
					// Should only have the first error (length)
					expect(result.issues.length).toBe(1)
					expect(result.issues[0]?.code).toBe('string_min')
				}
			})
		})

		describe('username', () => {
			it('should accept valid usernames', () => {
				const validUsernames = ['john_doe', 'user123', 'testuser']

				validUsernames.forEach(u => {
					const result = username.safeParse(u)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid usernames', () => {
				const invalidUsernames = ['ab', 'user with spaces', 'user@name']

				invalidUsernames.forEach(u => {
					const result = username.safeParse(u)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('loginSchema', () => {
			it('should validate login data', () => {
				const validLogin = {
					email: 'user@example.com',
					password: 'password123',
				}
				const result = loginSchema.safeParse(validLogin)

				expect(result.success).toBe(true)
			})

			it('should reject missing fields', () => {
				const invalidLogin = { email: 'user@example.com' }
				const result = loginSchema.safeParse(invalidLogin)

				expect(result.success).toBe(false)
			})
		})

		describe('registerSchema', () => {
			it('should validate registration data', () => {
				const validRegister = {
					email: 'new@example.com',
					password: 'SecurePass123!',
					confirmPassword: 'SecurePass123!',
					username: 'newuser',
				}
				const result = registerSchema.safeParse(validRegister)

				expect(result.success).toBe(true)
			})
		})

		describe('authSchemas collection', () => {
			it('should export all auth schemas', () => {
				expect(authSchemas.loginSchema).toBeDefined()
				expect(authSchemas.registerSchema).toBeDefined()
				expect(authSchemas.strongPassword).toBeDefined()
				expect(authSchemas.username).toBeDefined()
			})
		})

		describe('createApiKey', () => {
			it('should throw on invalid prefix with regex metacharacters', () => {
				expect(() => createApiKey('.*')).toThrow(
					'API key prefix must contain only alphanumeric characters or underscores',
				)
				expect(() => createApiKey('prefix(test)')).toThrow()
				expect(() => createApiKey('a+b')).toThrow()
				expect(() => createApiKey('test$')).toThrow()
				expect(() => createApiKey('bad^prefix')).toThrow()
			})

			it('should accept valid alphanumeric prefixes', () => {
				expect(() => createApiKey('sk')).not.toThrow()
				expect(() => createApiKey('prod_api')).not.toThrow()
				expect(() => createApiKey('test123')).not.toThrow()
				expect(() => createApiKey('API_KEY_V2')).not.toThrow()
			})

			it('should validate API keys with custom prefix', () => {
				const customApiKey = createApiKey('prod')
				const validKey = `prod_${'A'.repeat(32)}`
				const invalidKey = `sk_${'A'.repeat(32)}`

				expect(customApiKey.safeParse(validKey).success).toBe(true)
				expect(customApiKey.safeParse(invalidKey).success).toBe(false)
			})
		})
	})

	describe('Financial Schemas', () => {
		describe('creditCard', () => {
			it('should accept valid credit card numbers (Luhn)', () => {
				// Test numbers that pass Luhn algorithm
				const validCards = [
					'4532015112830366', // Visa
					'5425233430109903', // Mastercard
				]

				validCards.forEach(card => {
					const result = creditCard.safeParse(card)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid credit card numbers', () => {
				const invalidCards = [
					'1234567890123456', // Invalid Luhn
					'12345', // Too short
					'abcdefghijklmnop', // Not numbers
				]

				invalidCards.forEach(card => {
					const result = creditCard.safeParse(card)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('price', () => {
			it('should accept valid prices', () => {
				// Price must be > 0, so 0 is not valid
				const validPrices = [0.01, 9.99, 100, 1000.5]

				validPrices.forEach(p => {
					const result = price.safeParse(p)
					expect(result.success).toBe(true)
				})
			})

			it('should reject zero and negative prices', () => {
				const invalidPrices = [0, -10]

				invalidPrices.forEach(p => {
					const result = price.safeParse(p)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('currencyCode', () => {
			it('should accept valid currency codes', () => {
				const validCodes = ['USD', 'EUR', 'GBP', 'JPY']

				validCodes.forEach(code => {
					const result = currencyCode.safeParse(code)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid currency codes', () => {
				const invalidCodes = ['US', 'EURO', 'usd', '123']

				invalidCodes.forEach(code => {
					const result = currencyCode.safeParse(code)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('financialSchemas collection', () => {
			it('should export all financial schemas', () => {
				expect(financialSchemas.creditCard).toBeDefined()
				expect(financialSchemas.price).toBeDefined()
				expect(financialSchemas.currencyCode).toBeDefined()
			})
		})
	})

	describe('Network Schemas', () => {
		describe('ipv4', () => {
			it('should accept valid IPv4 addresses', () => {
				const validIps = [
					'192.168.1.1',
					'10.0.0.1',
					'255.255.255.0',
					'0.0.0.0',
				]

				validIps.forEach(ip => {
					const result = ipv4.safeParse(ip)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid IPv4 addresses', () => {
				const invalidIps = [
					'256.1.1.1',
					'192.168.1',
					'not.an.ip.address',
					'192.168.1.1.1',
				]

				invalidIps.forEach(ip => {
					const result = ipv4.safeParse(ip)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('ipv6', () => {
			it('should accept valid IPv6 addresses', () => {
				const validIps = [
					'2001:0db8:85a3:0000:0000:8a2e:0370:7334',
					'::1',
					'fe80::1',
				]

				validIps.forEach(ip => {
					const result = ipv6.safeParse(ip)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('hostname', () => {
			it('should accept valid hostnames', () => {
				const validHostnames = [
					'example.com',
					'sub.domain.org',
					'localhost',
				]

				validHostnames.forEach(h => {
					const result = hostname.safeParse(h)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('port', () => {
			it('should accept valid port numbers', () => {
				const validPorts = [80, 443, 8080, 3000, 1, 65535]

				validPorts.forEach(p => {
					const result = port.safeParse(p)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid port numbers', () => {
				const invalidPorts = [0, 65536, -1, 100000]

				invalidPorts.forEach(p => {
					const result = port.safeParse(p)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('macAddress', () => {
			it('should accept valid MAC addresses', () => {
				const validMacs = ['00:1A:2B:3C:4D:5E', 'AA:BB:CC:DD:EE:FF']

				validMacs.forEach(mac => {
					const result = macAddress.safeParse(mac)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('networkSchemas collection', () => {
			it('should export all network schemas', () => {
				expect(networkSchemas.ipv4).toBeDefined()
				expect(networkSchemas.ipv6).toBeDefined()
				expect(networkSchemas.hostname).toBeDefined()
				expect(networkSchemas.port).toBeDefined()
			})
		})
	})

	describe('Identity Schemas', () => {
		describe('phoneE164', () => {
			it('should accept valid E.164 phone numbers', () => {
				const validPhones = [
					'+14155551234',
					'+33612345678',
					'+447911123456',
				]

				validPhones.forEach(phone => {
					const result = phoneE164.safeParse(phone)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid phone formats', () => {
				const invalidPhones = ['4155551234', '(415) 555-1234', '+1']

				invalidPhones.forEach(phone => {
					const result = phoneE164.safeParse(phone)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('phoneFlexible', () => {
			it('should accept various phone formats', () => {
				const validPhones = [
					'+1 (415) 555-1234',
					'415-555-1234',
					'4155551234',
				]

				validPhones.forEach(phone => {
					const result = phoneFlexible.safeParse(phone)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('zipCodeUS', () => {
			it('should accept valid US zip codes', () => {
				const validZips = ['12345', '12345-6789']

				validZips.forEach(zip => {
					const result = zipCodeUS.safeParse(zip)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid zip codes', () => {
				const invalidZips = ['1234', '123456', 'ABCDE']

				invalidZips.forEach(zip => {
					const result = zipCodeUS.safeParse(zip)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('postalCodeFR', () => {
			it('should accept valid French postal codes', () => {
				const validCodes = ['75001', '33000', '13001']

				validCodes.forEach(code => {
					const result = postalCodeFR.safeParse(code)
					expect(result.success).toBe(true)
				})
			})
		})

		describe('ssnUS', () => {
			it('should accept valid US SSN format', () => {
				const validSsns = ['123-45-6789', '000-00-0000']

				validSsns.forEach(ssn => {
					const result = ssnUS.safeParse(ssn)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid SSN formats', () => {
				const invalidSsns = ['123456789', '123-456-789', '12-345-6789']

				invalidSsns.forEach(ssn => {
					const result = ssnUS.safeParse(ssn)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('age', () => {
			it('should accept valid ages', () => {
				// Age allows 0-150
				const validAges = [0, 18, 65, 120, 150]

				validAges.forEach(a => {
					const result = age.safeParse(a)
					expect(result.success).toBe(true)
				})
			})

			it('should reject invalid ages', () => {
				// Ages must be 0-150
				const invalidAges = [-1, 151, 200]

				invalidAges.forEach(a => {
					const result = age.safeParse(a)
					expect(result.success).toBe(false)
				})
			})
		})

		describe('identitySchemas collection', () => {
			it('should export all identity schemas', () => {
				expect(identitySchemas.phoneE164).toBeDefined()
				expect(identitySchemas.phoneFlexible).toBeDefined()
				expect(identitySchemas.zipCodeUS).toBeDefined()
				expect(identitySchemas.age).toBeDefined()
			})
		})
	})
})
