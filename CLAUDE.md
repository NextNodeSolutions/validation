# CLAUDE.md - @nextnode/validation

This file provides guidance to Claude Code when working with the validation library.

## Project Overview

`@nextnode/validation` is a TypeScript validation library powered by **ArkType** for comprehensive input validation on both frontend and backend in NextNode projects.

**Key Features:**

- ArkType-powered validation with full TypeScript type inference
- Pre-built validators (50+ schemas: email, URL, UUID, credit card, phone, passwords, etc.)
- React Hook Form integration via `arktypeResolver`
- Server middleware for Hono, Express, and Fastify
- Structured error format with error codes for i18n support
- Factory functions for configurable validators
- Tree-shakeable exports

## Project Structure

```
src/
├── index.ts                    # Main exports (type, Type, v, schemas)
├── lib/
│   ├── core/
│   │   ├── engine.ts           # Validation engine (v.schema, v.define, v.object)
│   │   ├── types.ts            # ValidationResult, ValidationIssue, Schema
│   │   └── index.ts
│   ├── errors/
│   │   ├── formatter.ts        # DefaultErrorFormatter
│   │   ├── codes.ts            # ErrorCodes constants
│   │   ├── types.ts            # Error types
│   │   └── index.ts
│   ├── schemas/
│   │   ├── common.ts           # email, url, uuid, date, json, base64, slug, semver
│   │   ├── auth.ts             # password, username, login/register, jwtToken, apiKey
│   │   ├── financial.ts        # creditCard, price, iban, bic, currencyCode
│   │   ├── network.ts          # ip, hostname, port, macAddress, domain
│   │   ├── identity.ts         # phone, ssn, postalCode, age, birthDate
│   │   └── index.ts
│   └── index.ts
├── integrations/
│   ├── react-hook-form/
│   │   ├── resolver.ts         # arktypeResolver
│   │   ├── types.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── core.ts             # validateData, createErrorResponse
│   │   ├── hono.ts             # honoValidator
│   │   ├── express.ts          # expressValidator
│   │   ├── fastify.ts          # fastifyValidator
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
├── utils/
│   ├── logger.ts               # Scoped loggers (coreLogger, middlewareLogger, etc.)
│   └── index.ts
└── __tests__/                  # Test files (119 tests)
    ├── core.spec.ts
    ├── schemas.spec.ts
    ├── resolver.spec.ts
    ├── middleware.spec.ts
    ├── logger.spec.ts
    ├── utils.spec.ts
    └── setup.ts
```

## Development Commands

```bash
pnpm build              # Build library
pnpm test               # Run tests (119 tests)
pnpm test:watch         # Watch mode
pnpm test:coverage      # Coverage report
pnpm type-check         # TypeScript validation
pnpm lint               # Biome linting with auto-fix
pnpm format             # Biome formatting
```

## Key Types

```typescript
// Structured error format
interface ValidationIssue {
	path: ReadonlyArray<string | number> // ['user', 'email']
	code: string // 'invalid_email'
	message: string // 'must be a valid email'
	expected?: string
	actual?: string
}

// Discriminated union result
type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; issues: readonly ValidationIssue[] }

// Schema wrapper
interface Schema<T> {
	_type: Type<T> // Underlying ArkType
	meta?: SchemaMetadata
	validate(data: unknown): ValidationResult<T>
	parse(data: unknown): T // throws ValidationError
	safeParse(data: unknown): ValidationResult<T>
}

// Engine config
interface ValidationEngineConfig {
	errorFormatter?: ErrorFormatter
	debug?: boolean
	stripUnknown?: boolean
}
```

## Usage Patterns

### Direct ArkType Usage

```typescript
import { type } from '@nextnode/validation'

const userSchema = type({
	email: 'string.email',
	age: 'number >= 0',
	'nickname?': 'string', // Optional with ?
})

const result = userSchema(data)
if (result instanceof type.errors) {
	console.error(result.summary)
}
```

### Validation Engine

```typescript
import { v } from '@nextnode/validation'

// Create schema with safeParse/parse methods
const schema = v.object<{ email: string }>({
	email: 'string.email',
})

const result = schema.safeParse(data)
if (result.success) {
	// result.data is typed
}

// Or use parse() which throws ValidationError
try {
	const data = schema.parse(input)
} catch (e) {
	if (e instanceof ValidationError) {
		console.error(e.issues)
	}
}
```

### Pre-built Schemas

```typescript
import { schemas, authSchemas, financialSchemas } from '@nextnode/validation'

// Use directly
const isValid = schemas.email('test@example.com')

// Compose with type()
import { type } from '@nextnode/validation'
const paymentSchema = type({
	email: schemas.email,
	amount: financialSchemas.price,
})
```

### Factory Functions

```typescript
import {
	createPasswordSchema,
	createApiKey,
	stringLength,
	numberRange,
} from '@nextnode/validation'

// Custom password requirements
const password = createPasswordSchema({
	minLength: 12,
	requireUppercase: true,
	requireLowercase: true,
	requireNumbers: true,
	requireSpecialChars: true,
})

// Custom API key prefix
const apiKey = createApiKey('prod') // prod_XXXXXXXX...

// String length range
const name = stringLength(2, 50)

// Number range
const age = numberRange(0, 120)
```

### React Hook Form

```typescript
import { arktypeResolver } from '@nextnode/validation/react-hook-form'

const { register, handleSubmit } = useForm({
	resolver: arktypeResolver(schema),
})
```

### TanStack Form (Native Support)

TanStack Form supports Standard Schema - use `type()` directly (no adapter needed):

```typescript
import { useForm } from '@tanstack/react-form'
import { type } from '@nextnode/validation'

const schema = type({ email: 'string.email' })

const form = useForm({
	validators: { onChange: schema },
})
```

### Server Middleware

```typescript
// Hono
import { honoValidator } from '@nextnode/validation/middleware/hono'
app.post('/users', honoValidator('body', schema), handler)

// Express
import { expressValidator } from '@nextnode/validation/middleware/express'
app.post('/users', expressValidator('body', schema), handler)

// Fastify
import { fastifyValidator } from '@nextnode/validation/middleware/fastify'
fastify.post(
	'/users',
	{ preHandler: fastifyValidator('body', schema) },
	handler,
)
```

## Complete Exports Reference

### Main Export (`@nextnode/validation`)

#### Core Engine

```typescript
// ArkType re-exports
export { type } // Type constructor function
export type { Type } // Generic type

// Validation engine
export { v } // Default engine instance
export { createValidationEngine } // Factory function
export { ValidationError } // Error class for parse()
export { isWrappedSchema } // Type guard

// Types
export type { Schema } // Schema wrapper interface
export type { SchemaFactory }
export type { SchemaMetadata }
export type { ValidationEngineConfig }
export type { ValidationIssue }
export type { ValidationResult }
export type { Infer } // Type inference helper
```

#### Error Handling

```typescript
export { ErrorCodes } // 38 error code constants
export { DefaultErrorFormatter } // Default formatter class
export { createErrorFormatter } // Factory function
export type { ErrorCode } // Union of all codes
export type { ErrorFormatter }
export type { ErrorFormatterConfig }
```

#### Pre-built Schemas (68 total)

```typescript
// Common (16)
export { schemas } // Aggregated object
export { email, url, uuid, date, json, base64, slug, semver }
export { boolean, integer, positive, nonNegative, percentage }
export { nonEmptyString, alphanumeric }
export { stringLength } // Factory: (min, max) => Schema
export { numberRange } // Factory: (min, max) => Schema

// Auth (11)
export { authSchemas } // Aggregated object
export { authEmail, username }
export { passwordBasic, strongPassword }
export { createPasswordSchema } // Factory with PasswordRequirements
export { jwtToken, apiKey, apiKeyWithPrefix }
export { loginSchema, registerSchema }
export { passwordResetSchema, passwordResetRequestSchema }
export type { PasswordRequirements }

// Financial (9)
export { financialSchemas } // Aggregated object
export { creditCard, iban, bic, currencyCode }
export { price, amount }
export { taxIdUS, taxIdFR }

// Identity (18)
export { identitySchemas } // Aggregated object
export { phoneE164, phoneFlexible }
export { ssnUS, ssnFR, nationalId, passportNumber }
export { zipCodeUS, postalCodeFR, postalCodeUK, postalCodeCA }
export { age, birthDate, gender, title }
export { personName, singleName }

// Network (12)
export { networkSchemas } // Aggregated object
export { ip, ipv4, ipv6 }
export { hostname, domain, port }
export { macAddress, urlSlug }
export { httpMethod, httpStatusCode }
```

### React Hook Form (`@nextnode/validation/react-hook-form`)

```typescript
export { arktypeResolver } // Resolver function
export type { ArktypeResolver }
export type { ArktypeResolverOptions }
export type { FieldError }
export type { FieldErrors }
export type { ResolverResult }
```

### Server Middleware (`@nextnode/validation/middleware`)

```typescript
// Core
export { validateData } // Core validation function
export { createErrorResponse } // Error response builder

// Hono
export { honoValidator } // Hono middleware
export { getValidated } // Helper to get validated data
export type { HonoValidatorOptions }

// Express
export { expressValidator } // Express middleware
export type { ExpressValidatorOptions }

// Fastify
export { fastifyValidator } // Fastify preHandler
export type { FastifyValidatorOptions }

// Types
export type { ValidationTarget } // 'body' | 'query' | 'params' | 'headers'
export type { MiddlewareConfig }
export type { ErrorHandler }
export type { ErrorHandlerContext }
export type { ValidationErrorResponse }
export type { FrameworkAdapter }
```

## Error Codes Reference (38 codes)

Error codes in `src/lib/errors/codes.ts` for i18n:

| Category  | Codes                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type      | `invalid_type`, `required`, `unexpected_key`                                                                                                                                                     |
| String    | `string_min`, `string_max`, `string_length`, `string_pattern`, `invalid_email`, `invalid_url`, `invalid_uuid`, `invalid_date`, `invalid_json`, `invalid_base64`, `invalid_hex`, `invalid_format` |
| Number    | `number_min`, `number_max`, `number_range`, `not_integer`, `not_positive`, `not_negative`, `invalid_divisor`                                                                                     |
| Array     | `array_min`, `array_max`, `array_length`, `array_empty`                                                                                                                                          |
| Object    | `object_empty`                                                                                                                                                                                   |
| Auth      | `invalid_password`, `password_too_short`, `password_no_uppercase`, `password_no_lowercase`, `password_no_number`, `password_no_special`, `passwords_dont_match`                                  |
| Financial | `invalid_credit_card`, `invalid_iban`, `invalid_bic`, `invalid_currency`, `invalid_price`                                                                                                        |
| Network   | `invalid_ip`, `invalid_ipv4`, `invalid_ipv6`, `invalid_hostname`, `invalid_port`, `invalid_mac`                                                                                                  |
| Identity  | `invalid_phone`, `invalid_ssn`, `invalid_postal_code`                                                                                                                                            |
| Custom    | `custom`, `predicate`, `narrow`                                                                                                                                                                  |

## Package Exports

```json
{
	".": "./dist/index.js",
	"./react-hook-form": "./dist/integrations/react-hook-form/index.js",
	"./middleware": "./dist/integrations/middleware/index.js",
	"./middleware/hono": "./dist/integrations/middleware/hono.js",
	"./middleware/express": "./dist/integrations/middleware/express.js",
	"./middleware/fastify": "./dist/integrations/middleware/fastify.js",
	"./schemas": "./dist/lib/schemas/index.js"
}
```

## Dependencies

**Production:**

- `arktype` ^2.1.28 - Core validation library
- `@nextnode/logger` ^0.3.0 - Logging

**Peer (optional):**

- `react-hook-form` ^7.0.0 - For resolver
- `hono` ^4.0.0 - For Hono middleware
- `express` ^4.0.0 || ^5.0.0 - For Express middleware
- `fastify` ^4.0.0 || ^5.0.0 - For Fastify middleware

## Testing

Tests are in `src/__tests__/`:

- `core.spec.ts` - Validation engine tests
- `schemas.spec.ts` - Pre-built schema tests
- `resolver.spec.ts` - React Hook Form resolver tests
- `middleware.spec.ts` - Server middleware tests
- `logger.spec.ts` - Logger tests
- `utils.spec.ts` - Utility tests

All tests use Vitest with proper mocking for logger.

## Architecture Notes

1. **ArkType string syntax**: Uses TypeScript-like strings (`'string.email'`, `'number >= 0'`)
2. **Composition over inheritance**: Schemas compose via ArkType's type system
3. **DI pattern**: ErrorFormatter interface for customization
4. **Tree-shakeable**: Separate export paths for integrations
5. **Framework-agnostic middleware**: Core logic in `middleware/core.ts`, adapters in separate files
6. **Factory pattern**: `createValidationEngine`, `createPasswordSchema`, `createApiKey` for configurability
