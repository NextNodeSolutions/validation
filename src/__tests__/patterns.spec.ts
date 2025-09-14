/**
 * Advanced validation patterns tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { 
  validateIf,
  requireAtLeastOne,
  requireExactlyOne,
  requireWhen,
  validateBasedOnField,
  validateProjectSettings,
  validateDeploymentConfig,
  validateAPIKeyPermissions
} from '../patterns/conditional.js'
import {
  withCache,
  validateUniqueUsername,
  validateEmailDomain,
  combineAsyncValidators,
  clearValidationCache
} from '../patterns/async.js'
import {
  StringTransforms,
  EmailTransforms,
  NextNodeTransforms,
  transformThenValidate,
  transformFormData
} from '../patterns/transforms.js'

describe('Validation Patterns', () => {
  beforeEach(() => {
    clearValidationCache()
  })

  describe('Conditional Validation', () => {
    describe('validateIf', () => {
      it('should validate when condition is met', () => {
        const validator = validateIf(
          (data) => data.type === 'premium',
          { narrow: () => true }, // Mock validator
          'subscription'
        )

        const data = { type: 'premium', subscription: 'pro' }
        const result = validator(data)

        expect(result.success).toBe(true)
      })

      it('should skip validation when condition is not met', () => {
        const validator = validateIf(
          (data) => data.type === 'premium',
          { narrow: () => false }, // Mock validator that would fail
          'subscription'
        )

        const data = { type: 'basic', subscription: 'invalid' }
        const result = validator(data)

        expect(result.success).toBe(true) // Should pass because condition not met
      })
    })

    describe('requireAtLeastOne', () => {
      it('should pass when at least one field is present', () => {
        const validator = requireAtLeastOne('email', 'phone')
        const data = { email: 'test@example.com' }
        
        const result = validator(data)
        expect(result.success).toBe(true)
      })

      it('should fail when no required fields are present', () => {
        const validator = requireAtLeastOne('email', 'phone')
        const data = { name: 'John' }
        
        const result = validator(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('REQUIRED_FIELD')
        }
      })
    })

    describe('requireExactlyOne', () => {
      it('should pass when exactly one field is present', () => {
        const validator = requireExactlyOne('password', 'socialAuth')
        const data = { password: 'secret123' }
        
        const result = validator(data)
        expect(result.success).toBe(true)
      })

      it('should fail when multiple fields are present', () => {
        const validator = requireExactlyOne('password', 'socialAuth')
        const data = { password: 'secret123', socialAuth: 'google' }
        
        const result = validator(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('INVALID_FORMAT')
        }
      })

      it('should fail when no fields are present', () => {
        const validator = requireExactlyOne('password', 'socialAuth')
        const data = { name: 'John' }
        
        const result = validator(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('REQUIRED_FIELD')
        }
      })
    })

    describe('requireWhen', () => {
      it('should pass when dependent field is present and required field exists', () => {
        const validator = requireWhen('hasAddress', 'address')
        const data = { hasAddress: true, address: '123 Main St' }
        
        const result = validator(data)
        expect(result.success).toBe(true)
      })

      it('should fail when dependent field is present but required field is missing', () => {
        const validator = requireWhen('hasAddress', 'address')
        const data = { hasAddress: true }
        
        const result = validator(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('DEPENDENCY_CHECK_FAILED')
        }
      })

      it('should pass when dependent field is not present', () => {
        const validator = requireWhen('hasAddress', 'address')
        const data = { name: 'John' }
        
        const result = validator(data)
        expect(result.success).toBe(true)
      })
    })

    describe('NextNode specific validators', () => {
      describe('validateProjectSettings', () => {
        it('should validate public project settings', () => {
          const data = {
            visibility: 'public',
            description: 'This is a public project with good description',
            tags: ['typescript', 'validation']
          }
          
          const result = validateProjectSettings(data)
          expect(result.success).toBe(true)
        })

        it('should validate private project settings', () => {
          const data = {
            visibility: 'private',
            allowedUsers: ['user1', 'user2']
          }
          
          const result = validateProjectSettings(data)
          expect(result.success).toBe(true)
        })

        it('should validate internal project settings', () => {
          const data = {
            visibility: 'internal',
            organizationId: '550e8400-e29b-41d4-a716-446655440000'
          }
          
          const result = validateProjectSettings(data)
          expect(result.success).toBe(true)
        })
      })

      describe('validateAPIKeyPermissions', () => {
        it('should validate valid permissions for read scope', () => {
          const data = {
            scope: 'read',
            permissions: ['projects:read', 'users:read']
          }
          
          const result = validateAPIKeyPermissions(data)
          expect(result.success).toBe(true)
        })

        it('should reject invalid permissions for read scope', () => {
          const data = {
            scope: 'read',
            permissions: ['projects:write', 'users:delete']
          }
          
          const result = validateAPIKeyPermissions(data)
          expect(result.success).toBe(false)
        })

        it('should validate admin permissions', () => {
          const data = {
            scope: 'admin',
            permissions: ['projects:read', 'projects:write', 'users:delete', 'organizations:manage']
          }
          
          const result = validateAPIKeyPermissions(data)
          expect(result.success).toBe(true)
        })
      })
    })
  })

  describe('Async Validation', () => {
    describe('withCache', () => {
      it('should cache validation results', async () => {
        let callCount = 0
        const mockValidator = vi.fn(async (value: string) => {
          callCount++
          return { success: true, data: value }
        })

        const cachedValidator = withCache(mockValidator, { cacheTtl: 1000 })

        // First call
        await cachedValidator('test')
        expect(callCount).toBe(1)

        // Second call should use cache
        await cachedValidator('test')
        expect(callCount).toBe(1)

        // Different value should not use cache
        await cachedValidator('different')
        expect(callCount).toBe(2)
      })

      it('should handle validation errors', async () => {
        const errorValidator = vi.fn(async () => {
          throw new Error('Validation failed')
        })

        const cachedValidator = withCache(errorValidator)
        const result = await cachedValidator('test')

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('ASYNC_VALIDATION_FAILED')
        }
      })
    })

    describe('validateUniqueUsername', () => {
      it('should reject reserved usernames', async () => {
        const result = await validateUniqueUsername('admin')
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('INVALID_USERNAME')
          expect(result.errors[0].reason).toContain('reserved')
        }
      })

      it('should validate available usernames', async () => {
        // This will sometimes pass and sometimes fail due to random logic
        // In real implementation, you'd mock the service call
        const result = await validateUniqueUsername('available_user')
        
        // Result will vary, but structure should be consistent
        if (result.success) {
          expect(result.data).toBe('available_user')
        } else {
          expect(result.errors[0].key).toBe('INVALID_USERNAME')
        }
      })
    })

    describe('validateEmailDomain', () => {
      it('should reject blocked domains', async () => {
        const result = await validateEmailDomain('user@tempmail.org')
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors[0].key).toBe('INVALID_EMAIL')
          expect(result.errors[0].reason).toContain('not allowed')
        }
      })

      it('should validate allowed domains', async () => {
        const result = await validateEmailDomain('user@company.com')
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe('user@company.com')
        }
      })
    })

    describe('combineAsyncValidators', () => {
      it('should combine multiple async validators', async () => {
        const validator1 = vi.fn(async (value: string) => ({ success: true, data: value }))
        const validator2 = vi.fn(async (value: string) => ({ success: true, data: value }))

        const combinedValidator = combineAsyncValidators([validator1, validator2])
        const result = await combinedValidator('test')

        expect(result.success).toBe(true)
        expect(validator1).toHaveBeenCalledWith('test')
        expect(validator2).toHaveBeenCalledWith('test')
      })

      it('should fail if any validator fails', async () => {
        const validator1 = vi.fn(async () => ({ success: true, data: 'test' }))
        const validator2 = vi.fn(async () => ({ 
          success: false, 
          errors: [{ key: 'INVALID_FORMAT' as const, reason: 'Failed' }] 
        }))

        const combinedValidator = combineAsyncValidators([validator1, validator2])
        const result = await combinedValidator('test')

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors).toHaveLength(1)
        }
      })
    })
  })

  describe('Transformations', () => {
    describe('StringTransforms', () => {
      it('should normalize strings', () => {
        expect(StringTransforms.normalize('  HELLO WORLD  ')).toBe('hello world')
      })

      it('should trim strings', () => {
        expect(StringTransforms.trim('  hello  ')).toBe('hello')
      })

      it('should slugify strings', () => {
        expect(StringTransforms.slugify('Hello World! @#$')).toBe('hello-world')
      })

      it('should convert to title case', () => {
        expect(StringTransforms.titleCase('hello world')).toBe('Hello World')
      })

      it('should collapse whitespace', () => {
        expect(StringTransforms.collapseWhitespace('hello    world')).toBe('hello world')
      })

      it('should strip HTML', () => {
        expect(StringTransforms.stripHTML('<p>Hello <b>World</b></p>')).toBe('Hello World')
      })
    })

    describe('EmailTransforms', () => {
      it('should normalize Gmail addresses', () => {
        expect(EmailTransforms.normalize('test.email+tag@gmail.com')).toBe('testemail@gmail.com')
      })

      it('should handle non-Gmail addresses', () => {
        expect(EmailTransforms.normalize('test.email+tag@company.com')).toBe('test.email@company.com')
      })

      it('should simple normalize emails', () => {
        expect(EmailTransforms.simple('  TEST@COMPANY.COM  ')).toBe('test@company.com')
      })
    })

    describe('NextNodeTransforms', () => {
      it('should transform usernames', () => {
        expect(NextNodeTransforms.username('John Doe!')).toBe('john_doe')
        expect(NextNodeTransforms.username('___test___')).toBe('test')
        expect(NextNodeTransforms.username('a'.repeat(40))).toHaveLength(30) // max length
      })

      it('should transform project slugs', () => {
        expect(NextNodeTransforms.projectSlug('My Awesome Project!')).toBe('my-awesome-project')
        expect(NextNodeTransforms.projectSlug('test__project')).toBe('test-project')
      })

      it('should normalize organization names', () => {
        expect(NextNodeTransforms.organizationName('NextNode   Solutions & Co.')).toBe('NextNode Solutions & Co.')
      })

      it('should clean API key names', () => {
        expect(NextNodeTransforms.apiKeyName('Production API Key!')).toBe('Production API Key')
      })
    })

    describe('transformThenValidate', () => {
      it('should transform then validate successfully', () => {
        const mockValidator = vi.fn((value: string) => value.toLowerCase())
        const pipeline = transformThenValidate((s: string) => s.trim(), mockValidator)
        
        const result = pipeline('  HELLO  ')
        
        expect(result.success).toBe(true)
        expect(mockValidator).toHaveBeenCalledWith('HELLO')
      })

      it('should handle transformation errors', () => {
        const errorTransform = () => { throw new Error('Transform failed') }
        const mockValidator = vi.fn()
        
        const pipeline = transformThenValidate(errorTransform, mockValidator)
        const result = pipeline('test')
        
        expect(result.success).toBe(false)
        expect(mockValidator).not.toHaveBeenCalled()
      })
    })

    describe('transformFormData', () => {
      it('should clean form data', () => {
        const formData = {
          name: '  John Doe  ',
          email: 'john@example.com  ',
          tags: ['  tag1  ', '', '  tag2  '],
          empty: '',
          phone: '  ',
          description: 'A description'
        }

        const cleaned = transformFormData(formData)

        expect(cleaned).toEqual({
          name: 'John Doe',
          email: 'john@example.com',
          tags: ['tag1', 'tag2'],
          description: 'A description'
        })
      })

      it('should remove empty fields', () => {
        const formData = {
          name: '',
          email: '   ',
          validField: 'value'
        }

        const cleaned = transformFormData(formData)

        expect(cleaned).toEqual({
          validField: 'value'
        })
      })
    })
  })
})