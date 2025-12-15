---
'@nextnode/validation': minor
---

Add `safeWebhookUrl` schema for SSRF protection

- Validates HTTPS protocol required
- Blocks localhost (localhost, 127.0.0.1, ::1)
- Blocks private IP ranges (10.x, 172.16-31.x, 192.168.x)
- Blocks cloud metadata endpoints (169.254.x.x)
