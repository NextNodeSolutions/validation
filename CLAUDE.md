# CLAUDE.md - @nextnode/validation

This file provides guidance to Claude Code when working with the validation library.

## Project Overview

`@nextnode/validation` is a TypeScript validation library powered by **ArkType** for comprehensive input validation on both frontend and backend in NextNode projects.

**Key Features:**
- ArkType-powered validation with full TypeScript type inference
- Pre-built validators (email, URL, UUID, credit card, phone, etc.)
- React Hook Form integration via `arktypeResolver`
- Server middleware for Hono, Express, and Fastify
- Structured error format for i18n support
- Tree-shakeable exports

## Project Structure

```
src/
├── index.ts                    # Main exports (type, v, schemas)
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
│   │   ├── common.ts           # email, url, uuid, date, json, base64
│   │   ├── auth.ts             # password, username, login/register
│   │   ├── financial.ts        # creditCard, price, iban, bic
│   │   ├── network.ts          # ip, hostname, port, macAddress
│   │   ├── identity.ts         # phone, ssn, postalCode, age
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
│   └── logger.ts               # Scoped loggers
└── __tests__/                  # Test files
```

## Development Commands

```bash
pnpm build              # Build library
pnpm test               # Run tests (119 tests)
pnpm test:watch         # Watch mode
pnpm test:coverage      # Coverage report
pnpm type-check         # TypeScript validation
pnpm lint               # ESLint with auto-fix
pnpm format             # Biome formatting
```

## Key Types

```typescript
// Structured error format
interface ValidationIssue {
  path: ReadonlyArray<string | number>  // ['user', 'email']
  code: string                          // 'invalid_email'
  message: string                       // 'must be a valid email'
  expected?: string
  actual?: string
}

// Discriminated union result
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; issues: readonly ValidationIssue[] }

// Schema wrapper
interface Schema<T> {
  validate(data: unknown): ValidationResult<T>
  parse(data: unknown): T              // throws ValidationError
  safeParse(data: unknown): ValidationResult<T>
}
```

## Usage Patterns

### Direct ArkType Usage

```typescript
import { type } from '@nextnode/validation'

const userSchema = type({
  email: 'string.email',
  age: 'number >= 0',
  'nickname?': 'string'  // Optional with ?
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
  email: 'string.email'
})

const result = schema.safeParse(data)
if (result.success) {
  // result.data is typed
}
```

### Pre-built Schemas

```typescript
import { schemas, authSchemas, financialSchemas } from '@nextnode/validation'

// Use directly
const isValid = schemas.email('test@example.com')

// Compose
const paymentSchema = type({
  email: schemas.email,
  amount: financialSchemas.price
})
```

### React Hook Form

```typescript
import { arktypeResolver } from '@nextnode/validation/react-hook-form'

const { register, handleSubmit } = useForm({
  resolver: arktypeResolver(schema)
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
fastify.post('/users', { preHandler: fastifyValidator('body', schema) }, handler)
```

## Error Codes

Error codes are defined in `src/lib/errors/codes.ts` for i18n support:

- `invalid_type`, `required`, `unexpected_key`
- `string_min`, `string_max`, `invalid_email`, `invalid_url`, `invalid_uuid`
- `number_min`, `number_max`, `not_integer`, `not_positive`
- `invalid_credit_card`, `invalid_iban`, `invalid_phone`
- And more...

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
- `arktype` - Core validation library
- `@nextnode/logger` - Logging

**Peer (optional):**
- `react-hook-form` - For resolver
- `hono`, `express`, `fastify` - For middleware

## Testing

Tests are in `src/__tests__/`:
- `core.spec.ts` - Validation engine tests
- `schemas.spec.ts` - Pre-built schema tests
- `resolver.spec.ts` - React Hook Form resolver tests
- `middleware.spec.ts` - Server middleware tests

All tests use Vitest with proper mocking for logger.

## Architecture Notes

1. **ArkType string syntax**: Uses TypeScript-like strings (`'string.email'`, `'number >= 0'`)
2. **Composition over inheritance**: Schemas compose via ArkType's type system
3. **DI pattern**: ErrorFormatter interface for customization
4. **Tree-shakeable**: Separate export paths for integrations
5. **Framework-agnostic middleware**: Core logic in `middleware/core.ts`
