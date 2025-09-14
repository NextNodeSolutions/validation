/**
 * Data transformation patterns for validation
 * 
 * Clean and transform data during validation process
 */

import { type } from 'arktype'

import { createSuccessResult } from '@/errors/formatter.js'

import type { ValidationResult } from '@/types/index.js'

/**
 * String transformation utilities
 */
export const StringTransforms = {
  /**
   * Trims whitespace and converts to lowercase
   */
  normalize: type('string').narrow((s): s is string => typeof s === 'string').pipe(s => s.trim().toLowerCase()),

  /**
   * Trims whitespace only
   */
  trim: type('string').pipe(s => s.trim()),

  /**
   * Converts to slug format (lowercase, hyphens, no special chars)
   */
  slugify: type('string').pipe(s => 
    s.toLowerCase()
     .trim()
     .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens and spaces
     .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
     .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  ),

  /**
   * Capitalizes first letter of each word
   */
  titleCase: type('string').pipe(s =>
    s.toLowerCase()
     .split(' ')
     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
     .join(' ')
  ),

  /**
   * Removes extra whitespace (multiple spaces become single space)
   */
  collapseWhitespace: type('string').pipe(s =>
    s.trim().replace(/\s+/g, ' ')
  ),

  /**
   * Sanitizes HTML by removing tags (basic sanitization)
   */
  stripHTML: type('string').pipe(s =>
    s.replace(/<[^>]*>/g, '').trim()
  )
}

/**
 * Email transformation utilities
 */
export const EmailTransforms = {
  /**
   * Normalizes email address
   * - Lowercase
   * - Trim whitespace
   * - Remove dots in Gmail addresses (optional)
   */
  normalize: type('string').pipe(email => {
    const trimmed = email.trim().toLowerCase()
    const [local, domain] = trimmed.split('@')
    
    if (!local || !domain) return trimmed
    
    // Gmail-specific normalization (remove dots in local part)
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      const normalizedLocal = local.replace(/\./g, '').split('+')[0]
      return `${normalizedLocal}@gmail.com`
    }
    
    // Remove plus addressing for other providers
    const cleanLocal = local.split('+')[0]
    return `${cleanLocal}@${domain}`
  }),

  /**
   * Simple email normalization (just trim and lowercase)
   */
  simple: type('string').pipe(email => email.trim().toLowerCase())
}

/**
 * URL transformation utilities
 */
export const URLTransforms = {
  /**
   * Normalizes URL
   * - Trim whitespace
   * - Add https:// if no protocol
   * - Remove trailing slash
   */
  normalize: type('string').pipe(url => {
    let normalized = url.trim()
    
    // Add protocol if missing
    if (!normalized.match(/^https?:\/\//)) {
      normalized = `https://${normalized}`
    }
    
    // Remove trailing slash
    normalized = normalized.replace(/\/+$/, '')
    
    return normalized
  }),

  /**
   * Extract domain from URL
   */
  extractDomain: type('string').pipe(url => {
    try {
      const parsed = new URL(url.trim())
      return parsed.hostname.toLowerCase()
    } catch {
      return url.trim().toLowerCase()
    }
  })
}

/**
 * Phone number transformation utilities
 */
export const PhoneTransforms = {
  /**
   * Normalizes phone number to E.164 format (basic)
   */
  normalize: type('string').pipe(phone => {
    // Remove all non-digit characters except +
    const digits = phone.replace(/[^\d+]/g, '')
    
    // Add + if not present and starts with country code
    if (!digits.startsWith('+') && digits.length > 10) {
      return `+${digits}`
    }
    
    return digits
  }),

  /**
   * Remove all formatting, keep digits only
   */
  digitsOnly: type('string').pipe(phone => phone.replace(/\D/g, ''))
}

/**
 * NextNode-specific transforms
 */
export const NextNodeTransforms = {
  /**
   * Transforms user input to NextNode username format
   */
  username: type('string').pipe(username =>
    username
      .trim()
      .toLowerCase()
      .replace(/[^\w]/g, '_') // Replace non-word chars with underscore
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 30) // Limit length
  ),

  /**
   * Transforms project name to slug format
   */
  projectSlug: type('string').pipe(name =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length
  ),

  /**
   * Normalizes organization name
   */
  organizationName: type('string').pipe(name =>
    name
      .trim()
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/[^\w\s&.-]/g, '') // Keep only safe characters
      .substring(0, 100) // Limit length
  ),

  /**
   * Cleans up API key name
   */
  apiKeyName: type('string').pipe(name =>
    name
      .trim()
      .replace(/[^\w\s-]/g, '') // Keep only word chars, spaces, hyphens
      .replace(/\s+/g, ' ') // Collapse whitespace
      .substring(0, 50) // Limit length
  )
}

/**
 * Array transformation utilities
 */
export const ArrayTransforms = {
  /**
   * Removes duplicates from array
   */
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],

  /**
   * Filters out empty/null/undefined values
   */
  compact: <T>(arr: (T | null | undefined)[]): T[] => 
    arr.filter(item => item !== null && item !== undefined) as T[],

  /**
   * Trims string values in array
   */
  trimStrings: (arr: string[]): string[] => 
    arr.map(s => s.trim()).filter(s => s.length > 0),

  /**
   * Sorts array and removes duplicates
   */
  sortUnique: <T>(arr: T[]): T[] => 
    [...new Set(arr)].sort()
}

/**
 * Object transformation utilities
 */
export const ObjectTransforms = {
  /**
   * Removes keys with null/undefined values
   */
  removeEmpty: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key as keyof T] = value
      }
    }
    return cleaned
  },

  /**
   * Trims all string values in object
   */
  trimStrings: <T extends Record<string, any>>(obj: T): T => {
    const result = { ...obj }
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string') {
        (result as any)[key] = value.trim()
      }
    }
    return result
  },

  /**
   * Deep clone and clean object
   */
  deepClean: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.map(item => ObjectTransforms.deepClean(item)) as T
    }
    
    const cleaned = {} as T
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (trimmed.length > 0) {
            (cleaned as any)[key] = trimmed
          }
        } else {
          (cleaned as any)[key] = ObjectTransforms.deepClean(value)
        }
      }
    }
    return cleaned
  }
}

/**
 * Creates a transform-then-validate pipeline
 */
export const transformThenValidate = <T, U>(
  transform: (value: T) => U,
  validator: any
) => (value: T): ValidationResult<U> => {
    try {
      const transformed = transform(value)
      const result = validator(transformed)
      
      if (result instanceof validator.constructor.errors) {
        // Handle ArkType error
        return {
          success: false,
          errors: [{
            key: 'INVALID_FORMAT' as const,
            reason: result.summary || 'Validation failed after transformation',
            value: transformed
          }]
        }
      }
      
      return createSuccessResult(result)
    } catch (error) {
      return {
        success: false,
        errors: [{
          key: 'INVALID_FORMAT' as const,
          reason: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          value
        }]
      }
    }
  }

/**
 * NextNode form data transformer
 * Cleans up common form submission issues
 */
export const transformFormData = <T extends Record<string, any>>(data: T): T => {
  const transformed = { ...data }
  
  // Trim all string values
  for (const [key, value] of Object.entries(transformed)) {
    if (typeof value === 'string') {
      (transformed as any)[key] = value.trim()
      
      // Convert empty strings to undefined
      if ((transformed as any)[key] === '') {
        delete (transformed as any)[key]
      }
    }
    
    // Clean arrays
    if (Array.isArray(value)) {
      (transformed as any)[key] = ArrayTransforms.compact(
        value.map(item => typeof item === 'string' ? item.trim() : item)
      ).filter(item => typeof item !== 'string' || item.length > 0)
      
      // Remove empty arrays
      if ((transformed as any)[key].length === 0) {
        delete (transformed as any)[key]
      }
    }
  }
  
  return transformed
}