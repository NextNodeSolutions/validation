/**
 * Conditional validation patterns for complex business logic
 * 
 * Validates fields based on other field values or external conditions
 */

import { type } from 'arktype'
import type { ValidationResult, ValidationError } from '@/types/index.js'
import { createFailureResult, createSuccessResult, createValidationError } from '@/errors/formatter.js'

/**
 * Validates a field only if a condition is met
 */
export const validateIf = <T>(
  condition: (data: any) => boolean,
  validator: any,
  fieldPath: string
) => {
  return (data: any): ValidationResult<T> => {
    if (!condition(data)) {
      // Condition not met, validation passes
      return createSuccessResult(data)
    }
    
    const fieldValue = getNestedValue(data, fieldPath)
    const result = validator(fieldValue)
    
    if (result instanceof validator.constructor.errors) {
      return createFailureResult([
        createValidationError(
          'CONDITIONAL_VALIDATION_FAILED',
          `Conditional validation failed for ${fieldPath}: ${result.summary}`,
          fieldPath,
          fieldValue
        )
      ])
    }
    
    return createSuccessResult(data)
  }
}

/**
 * Validates that at least one of the specified fields is present
 */
export const requireAtLeastOne = <T extends Record<string, any>>(
  ...fieldPaths: (keyof T)[]
) => {
  return (data: T): ValidationResult<T> => {
    const hasAtLeastOne = fieldPaths.some(path => {
      const value = getNestedValue(data, path as string)
      return value !== undefined && value !== null && value !== ''
    })
    
    if (!hasAtLeastOne) {
      return createFailureResult([
        createValidationError(
          'REQUIRED_FIELD',
          `At least one of these fields is required: ${fieldPaths.join(', ')}`,
          fieldPaths.join('|')
        )
      ])
    }
    
    return createSuccessResult(data)
  }
}

/**
 * Validates that only one of the specified fields is present
 */
export const requireExactlyOne = <T extends Record<string, any>>(
  ...fieldPaths: (keyof T)[]
) => {
  return (data: T): ValidationResult<T> => {
    const presentFields = fieldPaths.filter(path => {
      const value = getNestedValue(data, path as string)
      return value !== undefined && value !== null && value !== ''
    })
    
    if (presentFields.length === 0) {
      return createFailureResult([
        createValidationError(
          'REQUIRED_FIELD',
          `Exactly one of these fields is required: ${fieldPaths.join(', ')}`,
          fieldPaths.join('|')
        )
      ])
    }
    
    if (presentFields.length > 1) {
      return createFailureResult([
        createValidationError(
          'INVALID_FORMAT',
          `Only one of these fields is allowed: ${presentFields.join(', ')}`,
          presentFields.join('|')
        )
      ])
    }
    
    return createSuccessResult(data)
  }
}

/**
 * Validates field dependencies (if field A is present, field B must be present)
 */
export const requireWhen = <T extends Record<string, any>>(
  dependentField: keyof T,
  requiredField: keyof T
) => {
  return (data: T): ValidationResult<T> => {
    const dependentValue = getNestedValue(data, dependentField as string)
    const requiredValue = getNestedValue(data, requiredField as string)
    
    const hasDependentField = dependentValue !== undefined && dependentValue !== null && dependentValue !== ''
    const hasRequiredField = requiredValue !== undefined && requiredValue !== null && requiredValue !== ''
    
    if (hasDependentField && !hasRequiredField) {
      return createFailureResult([
        createValidationError(
          'DEPENDENCY_CHECK_FAILED',
          `Field ${String(requiredField)} is required when ${String(dependentField)} is provided`,
          String(requiredField)
        )
      ])
    }
    
    return createSuccessResult(data)
  }
}

/**
 * Validates based on enum/string value of another field
 */
export const validateBasedOnField = <T extends Record<string, any>>(
  conditionField: keyof T,
  validators: Record<string, any>
) => {
  return (data: T): ValidationResult<T> => {
    const conditionValue = getNestedValue(data, conditionField as string)
    
    if (typeof conditionValue !== 'string') {
      return createFailureResult([
        createValidationError(
          'INVALID_FORMAT',
          `Condition field ${String(conditionField)} must be a string`,
          String(conditionField),
          conditionValue
        )
      ])
    }
    
    const validator = validators[conditionValue]
    if (!validator) {
      // No specific validator for this value, validation passes
      return createSuccessResult(data)
    }
    
    const result = validator(data)
    
    if (result instanceof validator.constructor.errors) {
      return createFailureResult([
        createValidationError(
          'CONDITIONAL_VALIDATION_FAILED',
          `Validation failed for condition ${conditionValue}: ${result.summary}`,
          String(conditionField),
          data
        )
      ])
    }
    
    return createSuccessResult(data)
  }
}

/**
 * NextNode-specific conditional validators
 */

/**
 * Validates NextNode project settings based on visibility
 */
export const validateProjectSettings = validateBasedOnField('visibility', {
  'public': type({
    visibility: "'public'",
    description: 'string >= 10', // Public projects need good descriptions
    'tags?': 'string[]'
  }),
  'private': type({
    visibility: "'private'",
    'allowedUsers?': 'string[]' // Private projects can have allowed users
  }),
  'internal': type({
    visibility: "'internal'",
    organizationId: 'string' // Internal projects must belong to an organization
  })
})

/**
 * Validates deployment configuration based on environment
 */
export const validateDeploymentConfig = validateBasedOnField('environment', {
  'production': type({
    environment: "'production'",
    replicas: 'number >= 2', // Production needs redundancy
    monitoring: 'boolean',
    backups: 'boolean'
  }),
  'staging': type({
    environment: "'staging'",
    'replicas?': 'number >= 1'
  }),
  'development': type({
    environment: "'development'",
    'debugMode?': 'boolean'
  })
})

/**
 * Validates API key permissions based on scope
 */
export const validateAPIKeyPermissions = (data: any): ValidationResult<any> => {
  const scope = data.scope
  const permissions = data.permissions || []
  
  const scopePermissions: Record<string, string[]> = {
    'read': ['projects:read', 'users:read'],
    'write': ['projects:read', 'projects:write', 'users:read'],
    'admin': ['projects:*', 'users:*', 'organizations:*']
  }
  
  const allowedPermissions = scopePermissions[scope] || []
  
  // Check if all permissions are allowed for this scope
  const invalidPermissions = permissions.filter((perm: string) => {
    return !allowedPermissions.some(allowed => {
      if (allowed.endsWith('*')) {
        const prefix = allowed.slice(0, -1)
        return perm.startsWith(prefix)
      }
      return allowed === perm
    })
  })
  
  if (invalidPermissions.length > 0) {
    return createFailureResult([
      createValidationError(
        'INVALID_FORMAT',
        `Invalid permissions for scope ${scope}: ${invalidPermissions.join(', ')}`,
        'permissions',
        invalidPermissions
      )
    ])
  }
  
  return createSuccessResult(data)
}

/**
 * Helper function to get nested object values by path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}