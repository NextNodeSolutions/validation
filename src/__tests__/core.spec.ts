/**
 * NextNode validation core functionality tests
 */

import { describe, it, expect } from 'vitest'

import { 
  NextNodeAPIKey,
  NextNodeProjectSlug,
  NextNodeUsername,
  NextNodeEmail,
  NextNodeSemVer,
  NextNodeUUID,
  createNextNodeURL,
  validateWithNextNodeFormat
} from '../validators/common.js'

describe('NextNode Common Validators', () => {
  describe('NextNodeAPIKey', () => {
    it('should accept valid NextNode API keys', () => {
      const validKeys = [
        'nk_1234567890abcdef1234567890abcdef',
        'nk_ABCDEF1234567890abcdef1234567890',
        'nk_0000000000000000000000000000000a'
      ]

      validKeys.forEach(key => {
        const result = NextNodeAPIKey(key)
        expect(result).toBe(key)
      })
    })

    it('should reject invalid API keys', () => {
      const invalidKeys = [
        'invalid-key',
        'nk_short',
        'nk_1234567890abcdef1234567890abcdefg', // too long
        'nk_1234567890abcdef1234567890abcde',  // too short
        'ak_1234567890abcdef1234567890abcdef', // wrong prefix
        'nk_1234567890abcdef1234567890abcd@f'  // invalid character
      ]

      invalidKeys.forEach(key => {
        expect(() => NextNodeAPIKey(key)).toThrow()
      })
    })
  })

  describe('NextNodeProjectSlug', () => {
    it('should accept valid project slugs', () => {
      const validSlugs = [
        'my-project',
        'test123',
        'project-name-with-dashes',
        'abc',
        'a'.repeat(50) // max length
      ]

      validSlugs.forEach(slug => {
        const result = NextNodeProjectSlug(slug)
        expect(result).toBe(slug)
      })
    })

    it('should reject invalid project slugs', () => {
      const invalidSlugs = [
        'ab', // too short
        'a'.repeat(51), // too long
        '-starts-with-dash',
        'ends-with-dash-',
        'has--double-dash',
        'HAS-UPPERCASE',
        'has_underscore',
        'has@special',
        'has space'
      ]

      invalidSlugs.forEach(slug => {
        expect(() => NextNodeProjectSlug(slug)).toThrow()
      })
    })
  })

  describe('NextNodeUsername', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'john_doe',
        'user123',
        'test_user_name',
        'abc',
        'a'.repeat(30) // max length
      ]

      validUsernames.forEach(username => {
        const result = NextNodeUsername(username)
        expect(result).toBe(username)
      })
    })

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab', // too short
        'a'.repeat(31), // too long
        '123starts_with_number',
        'admin', // reserved
        'nextnode', // reserved
        'has-dash',
        'has@special',
        'has space'
      ]

      invalidUsernames.forEach(username => {
        expect(() => NextNodeUsername(username)).toThrow()
      })
    })
  })

  describe('NextNodeEmail', () => {
    it('should accept valid business emails', () => {
      const validEmails = [
        'user@company.com',
        'john.doe@business.org',
        'test@example.co.uk'
      ]

      validEmails.forEach(email => {
        const result = NextNodeEmail(email)
        expect(result).toBe(email)
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        'user@tempmail.org', // disposable domain
        'user+tag@company.com', // plus addressing
        'user@', // incomplete
        '@domain.com', // incomplete
        'user@localhost' // no TLD
      ]

      invalidEmails.forEach(email => {
        expect(() => NextNodeEmail(email)).toThrow()
      })
    })
  })

  describe('NextNodeSemVer', () => {
    it('should accept valid semantic versions', () => {
      const validVersions = [
        '1.0.0',
        '0.1.0',
        '10.20.30',
        '1.0.0-alpha.1',
        '2.1.0-beta.2',
        '1.0.0+build.123'
      ]

      validVersions.forEach(version => {
        const result = NextNodeSemVer(version)
        expect(result).toBe(version)
      })
    })

    it('should reject invalid versions', () => {
      const invalidVersions = [
        '1.0',
        'v1.0.0',
        '1.0.0.0',
        '1.0.0-',
        '1.0.0+',
        'invalid'
      ]

      invalidVersions.forEach(version => {
        expect(() => NextNodeSemVer(version)).toThrow()
      })
    })
  })

  describe('NextNodeUUID', () => {
    it('should accept valid UUIDs', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
      ]

      validUUIDs.forEach(uuid => {
        const result = NextNodeUUID(uuid)
        expect(result).toBe(uuid)
      })
    })

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        '550e8400-e29b-41d4-a716', // too short
        '550e8400-e29b-21d4-a716-446655440000', // wrong version
        '550e8400-e29b-41d4-c716-446655440000', // wrong variant
        'invalid-uuid',
        '550e8400e29b41d4a716446655440000' // no hyphens
      ]

      invalidUUIDs.forEach(uuid => {
        expect(() => NextNodeUUID(uuid)).toThrow()
      })
    })
  })

  describe('createNextNodeURL', () => {
    it('should accept valid HTTPS URLs by default', () => {
      const validator = createNextNodeURL()
      const validURLs = [
        'https://example.com',
        'https://api.company.com/webhook',
        'https://subdomain.domain.co.uk:8080/path'
      ]

      validURLs.forEach(url => {
        const result = validator(url)
        expect(result).toBe(url)
      })
    })

    it('should reject HTTP URLs by default', () => {
      const validator = createNextNodeURL()
      expect(() => validator('http://example.com')).toThrow()
    })

    it('should allow HTTP when configured', () => {
      const validator = createNextNodeURL({ allowHttp: true })
      const result = validator('http://example.com')
      expect(result).toBe('http://example.com')
    })

    it('should reject localhost by default', () => {
      const validator = createNextNodeURL()
      const localhostURLs = [
        'https://localhost:3000',
        'https://127.0.0.1',
        'https://0.0.0.0'
      ]

      localhostURLs.forEach(url => {
        expect(() => validator(url)).toThrow()
      })
    })

    it('should allow localhost when configured', () => {
      const validator = createNextNodeURL({ allowLocalhost: true })
      const result = validator('https://localhost:3000')
      expect(result).toBe('https://localhost:3000')
    })
  })

  describe('validateWithNextNodeFormat', () => {
    it('should return success result for valid data', () => {
      const result = validateWithNextNodeFormat(NextNodeAPIKey, 'nk_1234567890abcdef1234567890abcdef')
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('nk_1234567890abcdef1234567890abcdef')
      }
    })

    it('should return failure result for invalid data', () => {
      const result = validateWithNextNodeFormat(NextNodeAPIKey, 'invalid-key')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].key).toBe('INVALID_FORMAT')
        expect(result.errors[0].value).toBe('invalid-key')
      }
    })
  })
})