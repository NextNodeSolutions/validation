# @nextnode/validation

## 2.1.0

### Minor Changes

- [#4](https://github.com/NextNodeSolutions/validation/pull/4) [`fde91b8`](https://github.com/NextNodeSolutions/validation/commit/fde91b84863a5b1f89241a47b333c2160f463455) Thanks [@walid-mos](https://github.com/walid-mos)! - Add `safeWebhookUrl` schema for SSRF protection
    - Validates HTTPS protocol required
    - Blocks localhost (localhost, 127.0.0.1, ::1)
    - Blocks private IP ranges (10.x, 172.16-31.x, 192.168.x)
    - Blocks cloud metadata endpoints (169.254.x.x)

## 2.0.0

### Major Changes

- [#2](https://github.com/NextNodeSolutions/validation/pull/2) [`23deac0`](https://github.com/NextNodeSolutions/validation/commit/23deac0015454c78315771925e23f5ef068df26b) Thanks [@walid-mos](https://github.com/walid-mos)! - Security and code quality improvements

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
