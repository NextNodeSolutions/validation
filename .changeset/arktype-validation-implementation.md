---
"@nextnode/validation": major
---

Initial release of NextNode validation library powered by ArkType

## 🚀 New Features

### Core Validation System
- **ArkType integration** - Ultra-fast runtime validation (20x faster than Zod)
- **Environment agnostic** - Works in Node.js, browsers, and edge workers
- **TypeScript-first** - Perfect type inference and strict typing
- **Standardized errors** - Consistent `{ key, reason, path?, value? }` format

### NextNode Business Validators
- `NextNodeAPIKey` - Validates API keys with `nk_xxxxx` format
- `NextNodeEmail` - Business email validation (no disposable domains, no plus addressing)
- `NextNodeProjectSlug` - Project slug validation (3-50 chars, lowercase, hyphens)
- `NextNodeUsername` - Username validation (3-30 chars, not reserved)
- `NextNodeUUID` - UUID v4 validation
- `NextNodeSemVer` - Semantic version validation
- `createNextNodeURL()` - Configurable URL validation with security rules

### Domain Object Validators
- `NextNodeUser` - Complete user object validation
- `NextNodeProject` - Project object validation
- `NextNodeOrganization` - Organization object validation
- `NextNodeAPIKeyObject` - API key with metadata validation
- `NextNodePackage` - Package/library object validation
- `NextNodeEnvironment` - Environment configuration validation
- `NextNodeWebhook` - Webhook configuration validation
- `NextNodeAnalyticsEvent` - Analytics event validation

### Advanced Validation Patterns

#### Conditional Validation
- `validateIf()` - Conditional field validation
- `requireAtLeastOne()` - Require one of multiple fields
- `requireExactlyOne()` - Require exactly one field
- `requireWhen()` - Field dependency validation
- `validateProjectSettings()` - Project settings based on visibility
- `validateDeploymentConfig()` - Deployment config based on environment

#### Async Validation with Caching
- `withCache()` - Add intelligent caching to async validators
- `validateUniqueUsername()` - Username uniqueness check (10min cache)
- `validateEmailDomain()` - Email domain validation (1hr cache)
- `validateUniqueProjectSlug()` - Project slug uniqueness per organization
- `validateAPIKeyPermissions()` - Permission validation against user roles
- `validateWebhookURL()` - Webhook URL accessibility check
- `combineAsyncValidators()` - Combine multiple async validators

#### Data Transformations
- `StringTransforms` - String manipulation (slugify, titleCase, normalize, etc.)
- `EmailTransforms` - Email normalization (Gmail dot removal, plus addressing)
- `NextNodeTransforms` - NextNode-specific transforms (username, slug, org name)
- `ArrayTransforms` - Array utilities (unique, compact, trimStrings)
- `ObjectTransforms` - Object cleaning (removeEmpty, trimStrings, deepClean)
- `transformFormData()` - Clean form submissions

### Error Handling
- Standardized `ValidationError` type with error codes
- `ValidationResult<T>` union type for consistent return values
- Error formatting utilities for debugging and logging
- Error key extraction for i18n lookup by consumers

### Development Features
- Comprehensive test suite with real NextNode use cases
- Path aliases configuration for clean imports
- Complete TypeScript strict mode configuration
- ESLint integration with @nextnode/eslint-plugin
- Automated CI/CD with changesets and NPM publishing

## 📋 Initial Release

This is the initial release of @nextnode/validation with a complete validation system:
- Built on ArkType for ultra-fast runtime validation
- NextNode-specific business validators and domain objects
- Advanced validation patterns (conditional, async, transforms)
- Standardized error format for consistent handling
- Environment-agnostic design for universal compatibility

## 🔧 Usage

```typescript
import { NextNodeAPIKey, NextNodeEmail, NextNodeUser } from '@nextnode/validation'

// Basic validation
const apiKey = NextNodeAPIKey('nk_1234567890abcdef1234567890abcdef')
const email = NextNodeEmail('user@company.com')

// Domain object validation
const user = NextNodeUser({
  id: '550e8400-e29b-41d4-a716-446655440000',
  username: 'john_doe',
  email: 'john@company.com'
})
```

## 📚 Documentation

- Complete README with usage examples and API reference
- Updated CLAUDE.md with architecture and design decisions
- Comprehensive JSDoc comments throughout codebase