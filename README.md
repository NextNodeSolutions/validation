# @nextnode/validation

A TypeScript validation library powered by ArkType for comprehensive input validation on both frontend and backend in NextNode projects.

## Features

- **ArkType-powered**: Full TypeScript type inference with string-based schema definitions
- **Pre-built validators**: Email, URL, UUID, credit card, phone, passwords, and 50+ more
- **React Hook Form integration**: Ready-to-use resolver
- **Server middleware**: Hono, Express, and Fastify adapters
- **Structured errors**: Path-based error format with error codes for i18n support
- **Tree-shakeable**: Import only what you need
- **Factory functions**: Create configurable validators (passwords, API keys, etc.)

## Installation

```bash
pnpm add @nextnode/validation
```

**Peer dependencies** (install as needed):
```bash
# React Hook Form integration
pnpm add react-hook-form

# Server middleware
pnpm add hono      # or express / fastify
```

## Quick Start

### Basic Validation

```typescript
import { type } from '@nextnode/validation'

// Define schema using ArkType string syntax
const userSchema = type({
  email: 'string.email',
  age: 'number >= 0',
  role: "'admin' | 'user'"
})

// Validate data
const result = userSchema({ email: 'test@example.com', age: 25, role: 'user' })

if (result instanceof type.errors) {
  console.error(result.summary)
} else {
  console.log('Valid user:', result)
}
```

### Using the Validation Engine

```typescript
import { v } from '@nextnode/validation'

// Create schemas with the validation engine
const schema = v.object<{ name: string; email: string }>({
  name: 'string >= 1',
  email: 'string.email'
})

// Safe parsing (returns result object)
const result = schema.safeParse({ name: 'John', email: 'john@example.com' })

if (result.success) {
  console.log(result.data) // Typed as { name: string; email: string }
} else {
  console.log(result.issues) // Array of ValidationIssue
}

// Throws on invalid data
const data = schema.parse(input)
```

### Pre-built Schemas

```typescript
import {
  schemas,           // Common: email, url, uuid, date, json, slug, semver, etc.
  authSchemas,       // Auth: strongPassword, username, loginSchema, jwtToken, apiKey
  financialSchemas,  // Financial: creditCard, price, iban, bic, currencyCode
  networkSchemas,    // Network: ipv4, ipv6, port, hostname, macAddress, domain
  identitySchemas    // Identity: phoneE164, ssnUS, postalCodeFR, age, birthDate
} from '@nextnode/validation'

// Use pre-built validators
const isValidEmail = schemas.email('test@example.com')
const isValidCard = financialSchemas.creditCard('4532015112830366')

// Compose with custom schemas
const paymentSchema = type({
  email: schemas.email,
  amount: financialSchemas.price,
  cardNumber: financialSchemas.creditCard
})

// Use factory functions for configurable validators
import { createPasswordSchema, createApiKey } from '@nextnode/validation'

const customPassword = createPasswordSchema({
  minLength: 12,
  requireUppercase: true,
  requireSpecialChars: true
})

const myApiKey = createApiKey('api')  // Validates api_XXXXXXXXXX...
```

## React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form'
import { type } from '@nextnode/validation'
import { arktypeResolver } from '@nextnode/validation/react-hook-form'

const loginSchema = type({
  email: 'string.email',
  password: 'string >= 8'
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: arktypeResolver(loginSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

## Server Middleware

### Hono

```typescript
import { Hono } from 'hono'
import { type } from '@nextnode/validation'
import { honoValidator } from '@nextnode/validation/middleware/hono'

const app = new Hono()

const userSchema = type({
  email: 'string.email',
  name: 'string >= 1'
})

app.post('/users', honoValidator('body', userSchema), (c) => {
  const user = c.get('validated')
  return c.json({ user })
})
```

### Express

```typescript
import express from 'express'
import { type } from '@nextnode/validation'
import { expressValidator } from '@nextnode/validation/middleware/express'

const app = express()
app.use(express.json())

const userSchema = type({
  email: 'string.email',
  name: 'string >= 1'
})

app.post('/users', expressValidator('body', userSchema), (req, res) => {
  const user = req.validated
  res.json({ user })
})
```

### Fastify

```typescript
import Fastify from 'fastify'
import { type } from '@nextnode/validation'
import { fastifyValidator } from '@nextnode/validation/middleware/fastify'

const fastify = Fastify()

const userSchema = type({
  email: 'string.email',
  name: 'string >= 1'
})

fastify.post('/users', {
  preHandler: fastifyValidator('body', userSchema)
}, (request, reply) => {
  const user = request.validated
  reply.send({ user })
})
```

## Validation Targets

All middleware adapters support validating different parts of the request:

```typescript
// Validate request body
honoValidator('body', schema)

// Validate query parameters
honoValidator('query', schema)

// Validate route parameters
honoValidator('params', schema)

// Validate headers
honoValidator('headers', schema)
```

## Error Format

Validation errors follow a structured format for easy i18n:

```typescript
interface ValidationIssue {
  path: ReadonlyArray<string | number>  // ['user', 'email']
  code: string                          // 'invalid_email'
  message: string                       // 'must be a valid email'
  expected?: string                     // 'valid email format'
  actual?: string                       // 'invalid-email'
}
```

## Custom Validators

```typescript
import { type } from '@nextnode/validation'

// Regex pattern
const slugSchema = type(/^[a-z0-9-]+$/)

// Custom validation with narrow()
const evenNumber = type('number').narrow((n) => n % 2 === 0)

// Complex validation
const passwordSchema = type('string >= 8').narrow((pwd, ctx) => {
  if (!/[A-Z]/.test(pwd)) {
    return ctx.reject({ expected: 'uppercase letter required' })
  }
  if (!/[0-9]/.test(pwd)) {
    return ctx.reject({ expected: 'number required' })
  }
  return true
})
```

## API Reference

### Main Exports

| Export | Description |
|--------|-------------|
| `type` | ArkType's type function for schema definitions |
| `Type` | ArkType's Type (for type annotations) |
| `v` | Validation engine instance (`v.schema`, `v.define`, `v.object`) |
| `createValidationEngine` | Factory to create custom engine with config |
| `ValidationError` | Error class thrown by `parse()` |
| `Infer` | Type utility to infer schema type |
| `schemas` | Common validators (email, url, uuid, slug, semver, etc.) |
| `authSchemas` | Authentication schemas (password, username, JWT, API keys) |
| `financialSchemas` | Financial validators (credit card, IBAN, BIC, price) |
| `networkSchemas` | Network validators (IP, port, hostname, MAC) |
| `identitySchemas` | Identity validators (phone, SSN, postal codes, age) |
| `ErrorCodes` | Error code constants for i18n |

### Factory Functions

| Export | Description |
|--------|-------------|
| `createPasswordSchema` | Create password validator with custom requirements |
| `createApiKey` | Create API key validator with custom prefix |
| `stringLength` | Create string length validator |
| `numberRange` | Create number range validator |

### Sub-path Exports

| Path | Description |
|------|-------------|
| `@nextnode/validation/react-hook-form` | React Hook Form resolver |
| `@nextnode/validation/middleware` | All middleware adapters |
| `@nextnode/validation/middleware/hono` | Hono middleware |
| `@nextnode/validation/middleware/express` | Express middleware |
| `@nextnode/validation/middleware/fastify` | Fastify middleware |
| `@nextnode/validation/schemas` | Pre-built schemas only |

### Pre-built Schema Reference

**Common (`schemas`)**: `email`, `url`, `uuid`, `date`, `json`, `base64`, `alphanumeric`, `slug`, `semver`, `integer`, `positive`, `nonNegative`, `percentage`, `boolean`, `nonEmptyString`

**Auth (`authSchemas`)**: `username`, `passwordBasic`, `strongPassword`, `authEmail`, `jwtToken`, `apiKey`, `loginSchema`, `registerSchema`, `passwordResetSchema`, `passwordResetRequestSchema`

**Financial (`financialSchemas`)**: `creditCard`, `iban`, `bic`, `price`, `amount`, `currencyCode`, `taxIdUS`, `taxIdFR`

**Network (`networkSchemas`)**: `ip`, `ipv4`, `ipv6`, `hostname`, `domain`, `port`, `macAddress`, `urlSlug`, `httpMethod`, `httpStatusCode`

**Identity (`identitySchemas`)**: `phoneE164`, `phoneFlexible`, `zipCodeUS`, `postalCodeFR`, `postalCodeUK`, `postalCodeCA`, `ssnUS`, `ssnFR`, `age`, `birthDate`, `personName`, `singleName`, `gender`, `title`, `nationalId`, `passportNumber`

## Development

```bash
# Install dependencies
pnpm install

# Run tests (119 tests)
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Type check
pnpm type-check

# Lint and format
pnpm lint
pnpm format

# Build
pnpm build
```

## Requirements

- Node.js >= 24.0.0
- pnpm 10+

## License

MIT
