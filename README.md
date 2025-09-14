# @nextnode/validation

A TypeScript validation library powered by ArkType for comprehensive input validation on both frontend and backend in NextNode projects.

## Features

- 🚀 **Ultra-fast validation** - Built on ArkType (20x faster than Zod)
- 🌐 **Environment agnostic** - Works in Node.js, browsers, edge workers
- 🎯 **NextNode-specific** - Business validators for API keys, slugs, emails
- 📝 **TypeScript-first** - Perfect type inference and strict typing
- 🔧 **No i18n bloat** - Error keys only, consumer handles localization
- ⚡ **Advanced patterns** - Conditional, async, and transformation utilities

## Installation

```bash
pnpm add @nextnode/validation
```

## Quick Start

### Basic NextNode Validators

```typescript
import { 
  NextNodeAPIKey, 
  NextNodeEmail, 
  NextNodeProjectSlug,
  type ValidationResult 
} from '@nextnode/validation'

// Validate NextNode API keys
const apiKey = NextNodeAPIKey('nk_1234567890abcdef1234567890abcdef') // ✓

// Validate business emails (no disposable domains, no plus addressing)
const email = NextNodeEmail('user@company.com') // ✓

// Validate project slugs (lowercase, hyphens, 3-50 chars)
const slug = NextNodeProjectSlug('my-awesome-project') // ✓
```

### Domain Object Validation

```typescript
import { NextNodeUser, NextNodeProject } from '@nextnode/validation'

// Validate complete user objects
const user = NextNodeUser({
  id: '550e8400-e29b-41d4-a716-446655440000',
  username: 'john_doe',
  email: 'john@company.com',
  role: 'admin',
  status: 'active'
}) // ✓

// Validate project objects
const project = NextNodeProject({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'My Project',
  slug: 'my-project',
  description: 'A great project',
  visibility: 'public'
}) // ✓
```

### Error Handling

```typescript
import { validateWithNextNodeFormat } from '@nextnode/validation'

const result = validateWithNextNodeFormat(NextNodeAPIKey, 'invalid-key')

if (!result.success) {
  // Standardized error format for all NextNode projects
  result.errors.forEach(error => {
    console.log(`Error: ${error.key}`) // e.g., 'INVALID_FORMAT'
    console.log(`Reason: ${error.reason}`) // Technical description
    console.log(`Path: ${error.path}`) // Field path (if applicable)
  })
}
```

## Advanced Usage

### Conditional Validation

```typescript
import { 
  validateIf, 
  requireAtLeastOne, 
  validateProjectSettings 
} from '@nextnode/validation'

// Validate based on conditions
const conditionalValidator = validateIf(
  (data) => data.type === 'premium',
  PremiumSubscriptionValidator,
  'subscription'
)

// Require at least one contact method
const contactValidator = requireAtLeastOne('email', 'phone')

// NextNode project settings validation based on visibility
const projectData = {
  visibility: 'public',
  description: 'This is a public project', // Required for public projects
  tags: ['typescript', 'validation']
}
const result = validateProjectSettings(projectData)
```

### Async Validation with Caching

```typescript
import { 
  validateUniqueUsername,
  validateEmailDomain,
  withCache 
} from '@nextnode/validation'

// Built-in async validators with intelligent caching
const usernameResult = await validateUniqueUsername('john_doe') // Cached 10min
const domainResult = await validateEmailDomain('user@company.com') // Cached 1hr

// Create custom async validator with caching
const customValidator = withCache(async (value: string) => {
  // Your async validation logic
  const exists = await checkDatabase(value)
  return exists ? 
    { success: false, errors: [{ key: 'ALREADY_EXISTS', reason: 'Value exists' }] } :
    { success: true, data: value }
}, {
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  cacheKeyFn: (value) => `custom:${value}`
})
```

### Data Transformations

```typescript
import { 
  StringTransforms, 
  EmailTransforms,
  NextNodeTransforms,
  transformFormData 
} from '@nextnode/validation'

// String transformations
const slug = StringTransforms.slugify('Hello World! @#$') // → 'hello-world'
const title = StringTransforms.titleCase('hello world') // → 'Hello World'

// Email normalization
const email = EmailTransforms.normalize('Test.Email+tag@gmail.com') 
// → 'testemail@gmail.com'

// NextNode-specific transforms
const username = NextNodeTransforms.username('John Doe!') // → 'john_doe'
const projectSlug = NextNodeTransforms.projectSlug('My Awesome Project!') 
// → 'my-awesome-project'

// Form data cleaning
const cleanData = transformFormData({
  name: '  John Doe  ',
  email: 'john@example.com  ',
  tags: ['  tag1  ', '', '  tag2  '],
  empty: ''
})
// → { name: 'John Doe', email: 'john@example.com', tags: ['tag1', 'tag2'] }
```

## Direct ArkType Usage

Access ArkType directly for custom validation:

```typescript
import { type } from '@nextnode/validation'

// Create custom validators using ArkType syntax
const CustomValidator = type({
  name: 'string',
  age: 'number',
  email: 'email' // Built-in ArkType email validator
}).narrow(obj => obj.age >= 18) // Add custom constraints

const result = CustomValidator({
  name: 'John',
  age: 25,
  email: 'john@example.com'
})
```

## API Reference

### Core Validators

- `NextNodeAPIKey` - Validates API keys (`nk_xxxxx`)
- `NextNodeEmail` - Business email validation (no disposable/plus addressing)
- `NextNodeProjectSlug` - Project slug validation
- `NextNodeUsername` - Username validation (not reserved)
- `NextNodeUUID` - UUID v4 validation
- `NextNodeSemVer` - Semantic version validation
- `createNextNodeURL()` - Configurable URL validation

### Domain Objects

- `NextNodeUser` - Complete user object
- `NextNodeProject` - Project object
- `NextNodeOrganization` - Organization object
- `NextNodeAPIKeyObject` - API key with metadata
- `NextNodePackage` - Package/library object
- `NextNodeEnvironment` - Environment configuration
- `NextNodeWebhook` - Webhook configuration
- `NextNodeAnalyticsEvent` - Analytics event

### Advanced Patterns

#### Conditional
- `validateIf()` - Conditional validation
- `requireAtLeastOne()` - Require one of multiple fields
- `requireExactlyOne()` - Require exactly one field
- `requireWhen()` - Field dependency validation

#### Async
- `withCache()` - Add caching to async validators
- `validateUniqueUsername()` - Username uniqueness check
- `validateEmailDomain()` - Email domain validation
- `combineAsyncValidators()` - Combine multiple async validators

#### Transforms
- `StringTransforms` - String manipulation utilities
- `EmailTransforms` - Email normalization
- `NextNodeTransforms` - NextNode-specific transforms
- `transformFormData()` - Clean form submissions

### Error Types

```typescript
type ValidationError = {
  key: ValidationErrorCode    // For i18n lookup
  reason: string             // Technical description
  path?: string              // Field path
  value?: unknown           // Failed value
}

type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test              # Run tests
pnpm test:coverage     # With coverage
pnpm test:watch        # Watch mode
```

### Linting & Formatting

```bash
pnpm lint              # ESLint with auto-fix
pnpm format            # Biome formatting
pnpm type-check        # TypeScript validation
```

### Publishing

```bash
pnpm changeset         # Create changeset
pnpm changeset:version # Update versions
pnpm changeset:publish # Publish to NPM
```

## License

MIT
