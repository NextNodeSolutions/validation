/**
 * NextNode domain validators tests
 */

import { describe, it, expect } from 'vitest'
import { 
  NextNodeUser,
  NextNodeProject,
  NextNodeAPIKeyObject,
  NextNodePackage,
  NextNodeEnvironment,
  NextNodeOrganization
} from '../validators/domain.js'

describe('NextNode Domain Validators', () => {
  describe('NextNodeUser', () => {
    it('should accept valid user object', () => {
      const validUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'john_doe',
        email: 'john@company.com',
        role: 'admin' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodeUser(validUser)
      expect(result).toEqual(validUser)
    })

    it('should accept minimal user object', () => {
      const minimalUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'john_doe',
        email: 'john@company.com'
      }

      const result = NextNodeUser(minimalUser)
      expect(result).toEqual(minimalUser)
    })

    it('should reject invalid user object', () => {
      const invalidUsers = [
        {
          // Missing required fields
          username: 'john_doe'
        },
        {
          id: 'invalid-uuid',
          username: 'john_doe',
          email: 'john@company.com'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          username: 'ab', // too short
          email: 'john@company.com'
        }
      ]

      invalidUsers.forEach(user => {
        expect(() => NextNodeUser(user)).toThrow()
      })
    })
  })

  describe('NextNodeProject', () => {
    it('should accept valid project object', () => {
      const validProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My Awesome Project',
        slug: 'my-awesome-project',
        description: 'A great project description',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'active' as const,
        visibility: 'public' as const,
        tags: ['typescript', 'validation'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodeProject(validProject)
      expect(result).toEqual(validProject)
    })

    it('should accept minimal project object', () => {
      const minimalProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Project',
        slug: 'project',
        description: 'A project'
      }

      const result = NextNodeProject(minimalProject)
      expect(result).toEqual(minimalProject)
    })

    it('should reject invalid project object', () => {
      const invalidProjects = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'ab', // too short
          slug: 'project',
          description: 'A project'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Project',
          slug: 'INVALID-SLUG', // uppercase
          description: 'A project'
        }
      ]

      invalidProjects.forEach(project => {
        expect(() => NextNodeProject(project)).toThrow()
      })
    })
  })

  describe('NextNodeAPIKeyObject', () => {
    it('should accept valid API key object', () => {
      const validAPIKey = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'nk_1234567890abcdef1234567890abcdef',
        name: 'Production API Key',
        projectId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        permissions: ['projects:read', 'projects:write'],
        expiresAt: new Date(),
        lastUsedAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodeAPIKeyObject(validAPIKey)
      expect(result).toEqual(validAPIKey)
    })

    it('should accept minimal API key object', () => {
      const minimalAPIKey = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'nk_1234567890abcdef1234567890abcdef',
        name: 'API Key'
      }

      const result = NextNodeAPIKeyObject(minimalAPIKey)
      expect(result).toEqual(minimalAPIKey)
    })

    it('should reject invalid API key object', () => {
      expect(() => NextNodeAPIKeyObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'invalid-key', // invalid format
        name: 'API Key'
      })).toThrow()
    })
  })

  describe('NextNodePackage', () => {
    it('should accept valid package object', () => {
      const validPackage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '@nextnode/validation',
        version: '1.0.0',
        description: 'A validation library for NextNode',
        author: 'NextNode Solutions',
        repository: 'https://github.com/nextnode/validation',
        dependencies: {
          'arktype': '^2.1.0'
        },
        devDependencies: {
          'vitest': '^3.0.0'
        },
        tags: ['validation', 'typescript'],
        license: 'MIT',
        isPublic: true,
        downloads: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodePackage(validPackage)
      expect(result).toEqual(validPackage)
    })

    it('should reject invalid version', () => {
      expect(() => NextNodePackage({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '@nextnode/validation',
        version: 'invalid-version', // invalid semver
        description: 'A validation library for NextNode'
      })).toThrow()
    })
  })

  describe('NextNodeEnvironment', () => {
    it('should accept valid environment object', () => {
      const validEnvironment = {
        name: 'production' as const,
        variables: {
          'NODE_ENV': 'production',
          'API_URL': 'https://api.nextnode.com'
        },
        secrets: ['database-password', 'jwt-secret'],
        allowedOrigins: ['https://nextnode.com', 'https://app.nextnode.com'],
        rateLimits: {
          requests: 1000,
          window: 60000
        },
        features: {
          'analytics': true,
          'debug': false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodeEnvironment(validEnvironment)
      expect(result).toEqual(validEnvironment)
    })

    it('should accept minimal environment object', () => {
      const minimalEnvironment = {
        name: 'development' as const
      }

      const result = NextNodeEnvironment(minimalEnvironment)
      expect(result).toEqual(minimalEnvironment)
    })

    it('should reject invalid environment name', () => {
      expect(() => NextNodeEnvironment({
        name: 'invalid' as any // not in allowed values
      })).toThrow()
    })
  })

  describe('NextNodeOrganization', () => {
    it('should accept valid organization object', () => {
      const validOrganization = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'NextNode Solutions',
        slug: 'nextnode-solutions',
        description: 'A software development company',
        website: 'https://nextnode.com',
        billing: {
          plan: 'enterprise' as const,
          subscriptionId: 'sub_123456',
          status: 'active' as const
        },
        settings: {
          'allowPublicProjects': true,
          'maxMembers': 100
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = NextNodeOrganization(validOrganization)
      expect(result).toEqual(validOrganization)
    })

    it('should accept minimal organization object', () => {
      const minimalOrganization = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'NextNode',
        slug: 'nextnode'
      }

      const result = NextNodeOrganization(minimalOrganization)
      expect(result).toEqual(minimalOrganization)
    })

    it('should reject invalid organization', () => {
      expect(() => NextNodeOrganization({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A', // too short
        slug: 'nextnode'
      })).toThrow()
    })
  })
})