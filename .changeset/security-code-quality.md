---
'@nextnode/validation': major
---

Security and code quality improvements

**Breaking Changes:**

- Removed exported types: `MiddlewareConfig`, `ErrorHandler`, `ErrorHandlerContext` from middleware
- Deleted `src/lib/errors/types.ts` (types now exported from `core/types.ts`)

**Security:**

- Added ReDoS protection to `ipv6` schema (39-char length limit)
- Added ReDoS protection to `semver` schema (256-char length limit)
- Added `@security` PII documentation to identity schemas (`ssnUS`, `ssnFR`, `nationalId`, `passportNumber`)

**Improvements:**

- Added singleton `defaultErrorFormatter` export for better performance
- Simplified type re-export chain
