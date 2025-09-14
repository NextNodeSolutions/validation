# CLAUDE.md - @nextnode/validation

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **@nextnode/validation**, a TypeScript validation library powered by ArkType for comprehensive input validation across NextNode projects. It provides environment-agnostic validation with NextNode-specific business rules.

**Key Features:**
- **ArkType-powered validation** - Ultra-fast runtime validation (20x faster than Zod)
- **Environment agnostic** - Works in Node.js, browsers, and edge workers
- **NextNode business logic** - Validators for API keys, emails, project slugs, etc.
- **TypeScript-first design** - Perfect type inference and strict typing
- **Standardized errors** - Consistent error format across all NextNode projects
- **Advanced validation patterns** - Conditional, async, and transformation utilities

## Project Structure

```
@nextnode/validation/
├── .changeset/              # Version management configuration
├── .github/workflows/       # CI/CD workflows (test, version, publish)
├── .husky/                  # Git hooks configuration
├── src/                     # Source code
│   ├── types/              # Core types and interfaces
│   ├── errors/             # Error formatting and standardization
│   ├── validators/         # NextNode business validators
│   │   ├── common.ts       # API keys, emails, slugs, etc.
│   │   └── domain.ts       # Complete domain objects
│   ├── patterns/           # Advanced validation patterns
│   │   ├── conditional.ts  # Conditional validation logic
│   │   ├── async.ts        # Async validation with caching
│   │   └── transforms.ts   # Data transformation utilities
│   ├── utils/              # Utility functions (logger)
│   ├── __tests__/          # Comprehensive test suite
│   └── index.ts            # Main export file with ArkType re-export
├── package.json            # Package configuration with ArkType dependency
├── tsconfig.json           # TypeScript config (development)
├── tsconfig.build.json     # TypeScript config (build)
├── vitest.config.ts        # Test configuration with path aliases
├── eslint.config.mjs       # ESLint configuration
└── biome.json              # Formatting configuration
```

## Development Commands

### Build & Development
```bash
pnpm build              # Build library (clean + tsc + tsc-alias)
pnpm clean              # Remove dist directory
pnpm type-check         # TypeScript validation
```

### Testing
```bash
pnpm test               # Run tests once
pnpm test:watch         # Watch mode for tests
pnpm test:coverage      # Generate coverage report
pnpm test:ui            # Open Vitest UI
```

### Code Quality
```bash
pnpm lint               # ESLint with @nextnode/eslint-plugin (auto-fix)
pnpm format             # Format with Biome
```

### Version Management & Publishing
```bash
pnpm changeset          # Create changeset for version bump
pnpm changeset:version  # Update versions from changesets
pnpm changeset:publish  # Publish to NPM registry
```

## CI/CD Workflows

The template includes modern GitHub Actions workflows following NextNode standards:

### Test Workflow (`test.yml`)
- **Trigger**: Pull requests to main/master
- **Node.js**: Version 24 (latest)
- **Quality checks**: Lint, typecheck, tests, build
- **Coverage**: Enabled by default

### Version Management (`version.yml`)
- **Trigger**: Pushes to main branch, manual dispatch
- **Function**: Creates version bump PRs using changesets
- **Auto-merge**: Enabled for automated workflow

### Auto Publish (`auto-publish.yml`)
- **Trigger**: Repository dispatch when version PR is merged
- **Function**: Automatically publishes to NPM with provenance
- **GitHub Releases**: Creates releases automatically

### Manual Publish (`manual-publish.yml`)
- **Trigger**: Manual workflow dispatch
- **Function**: Emergency publishing without version PR

### Changeset Check (`changeset-check.yml`)
- **Trigger**: Pull request creation/updates
- **Function**: Ensures changesets are added for source code changes
- **Smart detection**: Only requires changesets for actual code changes

## TypeScript Configuration

### Strict Mode Settings
- **Maximum type safety**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **ESNext modules**: Modern module resolution with bundler mode
- **Path mapping**: `@/*` aliases for clean imports
- **Build separation**: Development config with `noEmit`, separate build config

### Module System
- **ESM-only**: No CommonJS support, pure ES modules
- **Exports**: Properly configured with types and import paths
- **Extension mapping**: `.js` extensions in imports for Node.js compatibility

## Template Variables

The `template_config.json` defines replaceable variables:

### Package.json Variables
- `{{project_name}}`: Package name (e.g., `@nextnode/my-library`)
- `{{project_description}}`: Package description
- `{{project_author}}`: Author information
- `{{project_keywords}}`: Keywords array
- `{{project_license}}`: License type
- `{{project_version}}`: Initial version

### Repository Variables
- Used in changeset configuration and README updates
- Automatically replaced during template generation

## Code Quality Standards

### ESLint Configuration
- Uses `@nextnode/eslint-plugin` for consistent NextNode standards
- **Zero warnings policy**: `--max-warnings 0`
- **Auto-fix enabled**: Automatically fixes issues during lint

### Formatting
- **Biome**: Fast alternative to Prettier
- **No errors on unmatched**: Handles various file types gracefully
- **Pre-commit hooks**: Automatic formatting before commits

### Testing
- **Vitest**: Modern test runner with built-in TypeScript support
- **Coverage reporting**: V8 provider for accurate coverage
- **UI testing**: Interactive test interface available

## Dependency Management

### Development Dependencies
- **@nextnode/eslint-plugin**: Shared linting rules
- **@biomejs/biome**: Modern formatting and linting
- **@vitest/coverage-v8**: Test coverage reporting
- **@changesets/cli**: Version management system
- **typescript**, **tsc-alias**: TypeScript compilation with path mapping
- **husky**, **lint-staged**: Git hooks and pre-commit checks

### Production Dependencies
- **@nextnode/logger**: Lightweight logging library with scope-based organization
- **arktype**: Ultra-fast runtime type validation library (20x faster than Zod)
- Zero other dependencies for maximum compatibility and performance

## Validation Architecture

### Core Design Principles

1. **Not a wrapper** - Adds real value to ArkType, doesn't just wrap it
2. **NextNode-specific** - Business logic validators for NextNode domain objects
3. **Environment agnostic** - No Node.js or browser dependencies
4. **Standardized errors** - Consistent format: `{ key, reason, path?, value? }`
5. **Consumer i18n** - Error keys only, no embedded internationalization

### Validation Layers

#### 1. Common Validators (`validators/common.ts`)
Business-specific validators with NextNode rules:
```typescript
// API Key validation with NextNode format
NextNodeAPIKey('nk_1234567890abcdef1234567890abcdef')

// Email validation with business rules (no disposable domains)
NextNodeEmail('user@company.com') 

// Project slug validation with NextNode conventions
NextNodeProjectSlug('my-awesome-project')
```

#### 2. Domain Objects (`validators/domain.ts`)
Complete business objects for NextNode ecosystem:
```typescript
// User object with all NextNode user fields
NextNodeUser({ id, username, email, role, status })

// Project object with NextNode project structure
NextNodeProject({ id, name, slug, description, visibility })
```

#### 3. Advanced Patterns (`patterns/`)
- **Conditional**: Field-dependent validation logic
- **Async**: Database/API validation with caching
- **Transforms**: Data cleaning and normalization

## Error Handling System

Standardized error format across all NextNode projects:

```typescript
type ValidationError = {
  key: ValidationErrorCode    // For i18n lookup by consumer
  reason: string             // Technical description for debugging
  path?: string              // Field path in nested objects
  value?: unknown           // The value that failed validation
}

type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }
```

### Error Keys
Predefined error codes for consistent handling:
- `INVALID_EMAIL`, `INVALID_API_KEY`, `INVALID_UUID`
- `REQUIRED_FIELD`, `FIELD_TOO_SHORT`, `FIELD_TOO_LONG`
- `ASYNC_VALIDATION_FAILED`, `CONDITIONAL_VALIDATION_FAILED`

## Logging System

Includes logging for validation operations using `@nextnode/logger`:

### Logger Structure

```typescript
// Main loggers available
import { 
  logger,        // Main library logger
  apiLogger,     // API-specific operations
  coreLogger,    // Core functionality
  utilsLogger,   // Utility functions
  logDebug,      // Debug helper
  logApiResponse,// API response helper
  logError       // Error helper with context
} from './utils/logger.js'
```

### Usage Examples

#### Basic Logging
```typescript
import { coreLogger } from '../utils/logger.js'

export const createClient = (options: ClientConfig) => {
  coreLogger.info('Creating client instance', { 
    hasApiKey: Boolean(options.apiKey) 
  })
  
  // ... implementation
  
  coreLogger.info('Client created successfully')
}
```

#### Error Logging with Context
```typescript
import { logError } from '../utils/logger.js'

try {
  // ... some operation
} catch (error) {
  logError(error, { 
    operation: 'data-processing',
    userId: user.id,
    timestamp: Date.now()
  })
  throw error
}
```

#### API Logging
```typescript
import { logApiResponse } from '../utils/logger.js'

// Log API responses with status and optional data
logApiResponse('POST', '/api/users', 201, { userId: 123 })
logApiResponse('GET', '/api/health', 200)
```

#### Debug Logging
```typescript
import { logDebug } from '../utils/logger.js'

// Log complex objects for debugging
logDebug('Configuration loaded', { 
  config, 
  environment: process.env.NODE_ENV 
})
```

### Logger Features

- **Environment-aware**: Automatically formats for development (console) and production (JSON)
- **Scoped prefixes**: Each logger has a specific prefix for easy filtering
- **Location tracking**: Automatically captures call location in development
- **Zero dependencies**: Lightweight with no external dependencies
- **Type-safe**: Full TypeScript support with proper types
- **Request tracking**: Automatic request ID generation for distributed tracing

### Logging Best Practices

1. **Use appropriate log levels**:
   - `info`: Normal operation events
   - `warn`: Warning conditions that should be noted
   - `error`: Error conditions that require attention

2. **Include relevant context**:
   - Always provide meaningful context objects
   - Include user IDs, request IDs, or operation identifiers
   - Add timing information for performance monitoring

3. **Use specialized loggers**:
   - `coreLogger` for main library functionality
   - `apiLogger` for HTTP/API operations
   - `utilsLogger` for utility functions

4. **Error handling**:
   - Always use `logError` for caught exceptions
   - Include original error and relevant context
   - Don't log the same error multiple times in the call stack

### Testing Logging

The template includes comprehensive logger tests with mocking:

```typescript
// Mock the logger in tests
vi.mock('../utils/logger.js', () => ({
  coreLogger: { info: vi.fn() },
  logError: vi.fn()
}))

// Test that logging occurs
expect(coreLogger.info).toHaveBeenCalledWith('Expected message', { data })
```

## Release Management

### Automated Workflow
1. **Development**: Create feature branches, implement changes
2. **Changeset**: Run `pnpm changeset` to describe changes
3. **Pull Request**: Create PR, automated checks run
4. **Merge**: Version management creates version PR automatically
5. **Auto-publish**: Version PR merge triggers NPM publishing

### Manual Workflow
- Use manual-publish workflow for emergency releases
- Changeset check ensures proper version tracking
- GitHub releases created automatically with changelog

## Template Usage

### From Template Generator
```bash
# Using NextNode project generator
project-generator new library my-awesome-library
```

### Manual Setup
1. Copy template files to new directory
2. Replace template variables in package.json, README.md
3. Update changeset configuration with correct repository
4. Initialize git repository and push to GitHub
5. Configure NPM_TOKEN secret for publishing

## Best Practices

### Code Organization
- **lib/**: Core library functionality, organized by feature
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Shared utility functions and helpers
- **index.ts**: Single entry point with clean exports

### Documentation
- **README.md**: User-facing documentation with examples
- **CHANGELOG.md**: Generated automatically by changesets
- **API documentation**: Consider TypeDoc for complex libraries

### Testing Strategy
- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test module interactions
- **Type tests**: Ensure TypeScript types work correctly
- **Coverage**: Aim for >80% coverage on new code

### Version Management
- **Semantic versioning**: Following semver standards
- **Conventional commits**: Use conventional commit messages
- **Changesets**: Always create changesets for changes affecting users
- **Breaking changes**: Clearly document in changeset descriptions

## Environment Requirements

- **Node.js**: >=24.0.0 (latest LTS)
- **pnpm**: 10.11.0+ (specified in packageManager)
- **TypeScript**: 5.0+ for modern language features
- **Git**: For version control and hooks

## Usage Patterns

### Basic Validation
```typescript
import { NextNodeAPIKey, NextNodeEmail } from '@nextnode/validation'

// Direct ArkType usage - throws on invalid
const apiKey = NextNodeAPIKey('nk_1234...') // Valid key

// NextNode format - returns result object
const result = validateWithNextNodeFormat(NextNodeEmail, 'invalid')
if (!result.success) {
  result.errors.forEach(err => console.log(err.key, err.reason))
}
```

### Advanced Patterns
```typescript
import { 
  requireAtLeastOne, 
  validateUniqueUsername,
  StringTransforms 
} from '@nextnode/validation'

// Conditional validation
const contactValidator = requireAtLeastOne('email', 'phone')

// Async validation with caching
const usernameResult = await validateUniqueUsername('john_doe')

// Data transformation
const slug = StringTransforms.slugify('Hello World!')
```

### Custom Validators
```typescript
import { type, createValidationError } from '@nextnode/validation'

// Direct ArkType usage for custom business logic
const CustomValidator = type('string').narrow(s => {
  return s.startsWith('custom_') && s.length >= 10
})
```

## Design Decisions

### Why ArkType?
- **Performance**: 20x faster than Zod, 2000x faster than Yup
- **DX**: 1:1 TypeScript mapping with excellent inference
- **Size**: Lightweight with tree-shaking support
- **Future-proof**: Built on set theory, extensible architecture

### Why Not Just Use ArkType Directly?
- **Business Logic**: NextNode-specific validation rules
- **Error Standardization**: Consistent format across all projects
- **Advanced Patterns**: Conditional, async, transform utilities
- **Domain Knowledge**: Pre-built validators for NextNode objects

### Error Format Rationale
- **Key-only errors**: Consumer handles i18n, no bloat
- **Structured data**: `{ key, reason, path?, value? }` for debugging
- **Consistent format**: Same across all NextNode validation

## Integration Notes

This library incorporates patterns from other NextNode libraries:
- **@nextnode/logger**: Logging conventions and structure
- **@nextnode/config-manager**: TypeScript strict patterns
- **ArkType ecosystem**: Latest validation performance and DX

### Migration from Other Validators
- **From Zod**: Similar API but much faster, better inference
- **From Joi**: More TypeScript-friendly, environment agnostic
- **From Yup**: Significantly better performance and types