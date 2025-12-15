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
	role: "'admin' | 'user'",
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
	email: 'string.email',
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
	schemas, // Common: email, url, uuid, date, json, slug, semver, etc.
	authSchemas, // Auth: strongPassword, username, loginSchema, jwtToken, apiKey
	financialSchemas, // Financial: creditCard, price, iban, bic, currencyCode
	networkSchemas, // Network: ipv4, ipv6, port, hostname, macAddress, domain
	identitySchemas, // Identity: phoneE164, ssnUS, postalCodeFR, age, birthDate
} from '@nextnode/validation'

// Use pre-built validators
const isValidEmail = schemas.email('test@example.com')
const isValidCard = financialSchemas.creditCard('4532015112830366')

// Compose with custom schemas
const paymentSchema = type({
	email: schemas.email,
	amount: financialSchemas.price,
	cardNumber: financialSchemas.creditCard,
})

// Use factory functions for configurable validators
import { createPasswordSchema, createApiKey } from '@nextnode/validation'

const customPassword = createPasswordSchema({
	minLength: 12,
	requireUppercase: true,
	requireSpecialChars: true,
})

const myApiKey = createApiKey('api') // Validates api_XXXXXXXXXX...
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

## TanStack Form Integration

TanStack Form natively supports ArkType via the [Standard Schema](https://github.com/standard-schema/standard-schema) specification. No adapter needed - use `type()` directly:

```typescript
import { useForm } from '@tanstack/react-form'
import { type } from '@nextnode/validation'

const schema = type({
  email: 'string.email',
  password: 'string >= 8'
})

function LoginForm() {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: {
      onChange: schema
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    }
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="email">
        {(field) => (
          <>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map(err => <span key={err}>{err}</span>)}
          </>
        )}
      </form.Field>
      <button type="submit">Submit</button>
    </form>
  )
}
```

> **Note**: Use raw ArkType (`type()`) with TanStack Form. The `v.schema()` wrapper is designed for React Hook Form integration.

## Server Middleware

### Hono

```typescript
import { Hono } from 'hono'
import { type } from '@nextnode/validation'
import { honoValidator } from '@nextnode/validation/middleware/hono'

const app = new Hono()

const userSchema = type({
	email: 'string.email',
	name: 'string >= 1',
})

app.post('/users', honoValidator('body', userSchema), c => {
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
	name: 'string >= 1',
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
	name: 'string >= 1',
})

fastify.post(
	'/users',
	{
		preHandler: fastifyValidator('body', userSchema),
	},
	(request, reply) => {
		const user = request.validated
		reply.send({ user })
	},
)
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
	path: ReadonlyArray<string | number> // ['user', 'email']
	code: string // 'invalid_email'
	message: string // 'must be a valid email'
	expected?: string // 'valid email format'
	actual?: string // 'invalid-email'
}
```

## Custom Validators

```typescript
import { type } from '@nextnode/validation'

// Regex pattern
const slugSchema = type(/^[a-z0-9-]+$/)

// Custom validation with narrow()
const evenNumber = type('number').narrow(n => n % 2 === 0)

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

| Export                   | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `type`                   | ArkType's type function for schema definitions                  |
| `Type`                   | ArkType's Type (for type annotations)                           |
| `v`                      | Validation engine instance (`v.schema`, `v.define`, `v.object`) |
| `createValidationEngine` | Factory to create custom engine with config                     |
| `ValidationError`        | Error class thrown by `parse()`                                 |
| `Infer`                  | Type utility to infer schema type                               |
| `schemas`                | Common validators (email, url, uuid, slug, semver, etc.)        |
| `authSchemas`            | Authentication schemas (password, username, JWT, API keys)      |
| `financialSchemas`       | Financial validators (credit card, IBAN, BIC, price)            |
| `networkSchemas`         | Network validators (IP, port, hostname, MAC)                    |
| `identitySchemas`        | Identity validators (phone, SSN, postal codes, age)             |
| `ErrorCodes`             | Error code constants for i18n                                   |

### Factory Functions

| Export                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `createPasswordSchema` | Create password validator with custom requirements |
| `createApiKey`         | Create API key validator with custom prefix        |
| `stringLength`         | Create string length validator                     |
| `numberRange`          | Create number range validator                      |

### Sub-path Exports

| Path                                      | Description              |
| ----------------------------------------- | ------------------------ |
| `@nextnode/validation/react-hook-form`    | React Hook Form resolver |
| `@nextnode/validation/middleware`         | All middleware adapters  |
| `@nextnode/validation/middleware/hono`    | Hono middleware          |
| `@nextnode/validation/middleware/express` | Express middleware       |
| `@nextnode/validation/middleware/fastify` | Fastify middleware       |
| `@nextnode/validation/schemas`            | Pre-built schemas only   |

### Pre-built Schema Reference

**Common (`schemas`)**: `email`, `url`, `uuid`, `date`, `json`, `base64`, `alphanumeric`, `slug`, `semver`, `integer`, `positive`, `nonNegative`, `percentage`, `boolean`, `nonEmptyString`

**Auth (`authSchemas`)**: `username`, `passwordBasic`, `strongPassword`, `authEmail`, `jwtToken`, `apiKey`, `loginSchema`, `registerSchema`, `passwordResetSchema`, `passwordResetRequestSchema`

**Financial (`financialSchemas`)**: `creditCard`, `iban`, `bic`, `price`, `amount`, `currencyCode`, `taxIdUS`, `taxIdFR`

**Network (`networkSchemas`)**: `ip`, `ipv4`, `ipv6`, `hostname`, `domain`, `port`, `macAddress`, `urlSlug`, `httpMethod`, `httpStatusCode`

**Identity (`identitySchemas`)**: `phoneE164`, `phoneFlexible`, `zipCodeUS`, `postalCodeFR`, `postalCodeUK`, `postalCodeCA`, `ssnUS`, `ssnFR`, `age`, `birthDate`, `personName`, `singleName`, `gender`, `title`, `nationalId`, `passportNumber`

## Complete Exports Reference

### Core Engine

| Export                   | Type     | Description                        |
| ------------------------ | -------- | ---------------------------------- |
| `type`                   | Function | ArkType type constructor           |
| `Type`                   | Type     | ArkType generic type               |
| `v`                      | Object   | Default validation engine instance |
| `createValidationEngine` | Function | Factory for custom engine          |
| `ValidationError`        | Class    | Error thrown by `parse()`          |
| `isWrappedSchema`        | Function | Type guard for Schema objects      |
| `Infer`                  | Type     | Infer TypeScript type from schema  |

### Types

| Export                   | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `Schema<T>`              | Schema wrapper with `safeParse()`, `parse()` methods |
| `SchemaFactory`          | Factory function type                                |
| `SchemaMetadata`         | Optional metadata for schemas                        |
| `ValidationEngineConfig` | Engine configuration options                         |
| `ValidationIssue`        | Single validation error                              |
| `ValidationResult<T>`    | Discriminated union: success or issues               |
| `ErrorFormatter`         | Interface for custom error formatting                |
| `ErrorFormatterConfig`   | Formatter configuration                              |
| `ErrorCode`              | Union type of all error codes                        |

### Error Handling

| Export                  | Type     | Description                   |
| ----------------------- | -------- | ----------------------------- |
| `ErrorCodes`            | Object   | Constants for all error codes |
| `DefaultErrorFormatter` | Class    | Default formatter             |
| `createErrorFormatter`  | Function | Factory for custom formatter  |

### Factory Functions

| Export                 | Signature                                        | Description                   |
| ---------------------- | ------------------------------------------------ | ----------------------------- |
| `createPasswordSchema` | `(requirements: PasswordRequirements) => Schema` | Custom password validator     |
| `createApiKey`         | `(prefix: string) => Schema`                     | API key validator with prefix |
| `apiKeyWithPrefix`     | `(prefix: string) => Schema`                     | Alias for `createApiKey`      |
| `stringLength`         | `(min: number, max: number) => Schema`           | String length range validator |
| `numberRange`          | `(min: number, max: number) => Schema`           | Number range validator        |

### React Hook Form (`@nextnode/validation/react-hook-form`)

| Export                   | Type     | Description                  |
| ------------------------ | -------- | ---------------------------- |
| `arktypeResolver`        | Function | Resolver for React Hook Form |
| `ArktypeResolver`        | Type     | Resolver function type       |
| `ArktypeResolverOptions` | Type     | Resolver options             |
| `FieldError`             | Type     | Single field error           |
| `FieldErrors`            | Type     | Map of field errors          |
| `ResolverResult`         | Type     | Resolver return type         |

### Server Middleware (`@nextnode/validation/middleware`)

| Export                    | Type     | Description                                  |
| ------------------------- | -------- | -------------------------------------------- |
| `validateData`            | Function | Core validation function                     |
| `createErrorResponse`     | Function | Error response builder                       |
| `honoValidator`           | Function | Hono middleware                              |
| `getValidated`            | Function | Hono helper to get data                      |
| `expressValidator`        | Function | Express middleware                           |
| `fastifyValidator`        | Function | Fastify preHandler                           |
| `ValidationTarget`        | Type     | `'body' \| 'query' \| 'params' \| 'headers'` |
| `MiddlewareConfig`        | Type     | Common middleware config                     |
| `ErrorHandler`            | Type     | Custom error handler function                |
| `ErrorHandlerContext`     | Type     | Context passed to error handler              |
| `ValidationErrorResponse` | Type     | Standard error response format               |
| `HonoValidatorOptions`    | Type     | Hono-specific options                        |
| `ExpressValidatorOptions` | Type     | Express-specific options                     |
| `FastifyValidatorOptions` | Type     | Fastify-specific options                     |

## Error Codes Reference

All error codes are available via `ErrorCodes` constant for i18n mapping.

### Type Errors

| Code             | Value            | Description            |
| ---------------- | ---------------- | ---------------------- |
| `INVALID_TYPE`   | `invalid_type`   | Wrong type             |
| `REQUIRED`       | `required`       | Missing required field |
| `UNEXPECTED_KEY` | `unexpected_key` | Unknown property       |

### String Errors

| Code             | Value            | Description             |
| ---------------- | ---------------- | ----------------------- |
| `STRING_MIN`     | `string_min`     | Below minimum length    |
| `STRING_MAX`     | `string_max`     | Above maximum length    |
| `STRING_LENGTH`  | `string_length`  | Exact length mismatch   |
| `STRING_PATTERN` | `string_pattern` | Regex pattern failure   |
| `INVALID_EMAIL`  | `invalid_email`  | Invalid email format    |
| `INVALID_URL`    | `invalid_url`    | Invalid URL format      |
| `INVALID_UUID`   | `invalid_uuid`   | Invalid UUID format     |
| `INVALID_DATE`   | `invalid_date`   | Invalid date format     |
| `INVALID_JSON`   | `invalid_json`   | Invalid JSON            |
| `INVALID_BASE64` | `invalid_base64` | Invalid base64 encoding |
| `INVALID_HEX`    | `invalid_hex`    | Invalid hex string      |
| `INVALID_FORMAT` | `invalid_format` | Generic format error    |

### Number Errors

| Code              | Value             | Description               |
| ----------------- | ----------------- | ------------------------- |
| `NUMBER_MIN`      | `number_min`      | Below minimum value       |
| `NUMBER_MAX`      | `number_max`      | Above maximum value       |
| `NUMBER_RANGE`    | `number_range`    | Outside allowed range     |
| `NOT_INTEGER`     | `not_integer`     | Not an integer            |
| `NOT_POSITIVE`    | `not_positive`    | Not a positive number     |
| `NOT_NEGATIVE`    | `not_negative`    | Not a negative number     |
| `INVALID_DIVISOR` | `invalid_divisor` | Not divisible by expected |

### Array Errors

| Code           | Value          | Description             |
| -------------- | -------------- | ----------------------- |
| `ARRAY_MIN`    | `array_min`    | Below minimum items     |
| `ARRAY_MAX`    | `array_max`    | Above maximum items     |
| `ARRAY_LENGTH` | `array_length` | Exact length mismatch   |
| `ARRAY_EMPTY`  | `array_empty`  | Array must not be empty |

### Object Errors

| Code           | Value          | Description              |
| -------------- | -------------- | ------------------------ |
| `OBJECT_EMPTY` | `object_empty` | Object must not be empty |

### Auth Errors

| Code                    | Value                   | Description               |
| ----------------------- | ----------------------- | ------------------------- |
| `INVALID_PASSWORD`      | `invalid_password`      | Generic password error    |
| `PASSWORD_TOO_SHORT`    | `password_too_short`    | Below minimum length      |
| `PASSWORD_NO_UPPERCASE` | `password_no_uppercase` | Missing uppercase letter  |
| `PASSWORD_NO_LOWERCASE` | `password_no_lowercase` | Missing lowercase letter  |
| `PASSWORD_NO_NUMBER`    | `password_no_number`    | Missing number            |
| `PASSWORD_NO_SPECIAL`   | `password_no_special`   | Missing special character |
| `PASSWORDS_DONT_MATCH`  | `passwords_dont_match`  | Passwords don't match     |

### Financial Errors

| Code                  | Value                 | Description                |
| --------------------- | --------------------- | -------------------------- |
| `INVALID_CREDIT_CARD` | `invalid_credit_card` | Invalid credit card number |
| `INVALID_IBAN`        | `invalid_iban`        | Invalid IBAN               |
| `INVALID_BIC`         | `invalid_bic`         | Invalid BIC/SWIFT code     |
| `INVALID_CURRENCY`    | `invalid_currency`    | Invalid currency code      |
| `INVALID_PRICE`       | `invalid_price`       | Invalid price format       |

### Network Errors

| Code               | Value              | Description          |
| ------------------ | ------------------ | -------------------- |
| `INVALID_IP`       | `invalid_ip`       | Invalid IP address   |
| `INVALID_IPV4`     | `invalid_ipv4`     | Invalid IPv4 address |
| `INVALID_IPV6`     | `invalid_ipv6`     | Invalid IPv6 address |
| `INVALID_HOSTNAME` | `invalid_hostname` | Invalid hostname     |
| `INVALID_PORT`     | `invalid_port`     | Invalid port number  |
| `INVALID_MAC`      | `invalid_mac`      | Invalid MAC address  |

### Identity Errors

| Code                  | Value                 | Description             |
| --------------------- | --------------------- | ----------------------- |
| `INVALID_PHONE`       | `invalid_phone`       | Invalid phone number    |
| `INVALID_SSN`         | `invalid_ssn`         | Invalid SSN             |
| `INVALID_POSTAL_CODE` | `invalid_postal_code` | Invalid postal/zip code |

### Custom Errors

| Code        | Value       | Description                 |
| ----------- | ----------- | --------------------------- |
| `CUSTOM`    | `custom`    | Custom validation error     |
| `PREDICATE` | `predicate` | Predicate validation failed |
| `NARROW`    | `narrow`    | Narrow refinement failed    |

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
