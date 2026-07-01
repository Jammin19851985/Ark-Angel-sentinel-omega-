# Cybersecurity Test Specification: Fortress Security rules

This specification establishes Zero-Trust data invariants, details 12 malicious "Dirty Dozen" payload vectors, and sets up a test execution manifest.

## 1. Data Invariants
- **Log Isolation**: Activity logs can ONLY be read and created by the explicit authenticated owner matching `users/{userId}`. Updates and Deletions are strictly prohibited on logs after creation (immutable).
- **Note Isolation**: Notes can only be listed, read, created, updated, or deleted by the exact user matching `{userId}`.
- **Strict Size/Type Bounds**: Values saved in `title` must be strings no larger than 256 characters. Values saved in `body` must be strings no larger than 5,000 characters.
- **Immortal Fields**: Fields like `createdAt` of a note or `timestamp` of a log must be verified to never modify on update.
- **Strict Keys**: Document payloads must match exactly allowed schema attributes to prevent stealth injection attacks.

## 2. The "Dirty Dozen" Vulnerability Payloads

### Test Vector 1: Anonymous Write Exploits
Attempting to save a user note when request is unauthenticated (`request.auth == null`).
- Expected Output: `PERMISSION_DENIED`

### Test Vector 2: User-to-User Eavesdropping
Authenticated user `Bob` attempting to read/list notes belonging to `Alice` under `/users/Alice/notes/{noteId}`.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 3: Log Tampering (Malicious Deletion)
Authenticated user `Bob` trying to delete records under their `/users/Bob/logs/{logId}` path to scrub forensic trace logs.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 4: Log Mutation (Malicious Update)
Authenticated user `Bob` trying to overwrite message severity of log entries to obscure threat detection lines.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 5: Shadow Field Injection
Attempting to create a note matching KeepNote schema, but injecting a mock attribute `isVerifiedAdmin: true` to bypass security logic.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 6: Title Size Overload (Denial of Wallet)
Attempting to create a note where the title is 2MB in size.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 7: Body Size Overload (Denial of Wallet)
Attempting to create a note containing a 10MB body block.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 8: Note ID Character Poisoning
Attempting to write a note where `{noteId}` contains malicious escape directories (e.g. `../..%2Fsys_core`).
- Expected Output: `PERMISSION_DENIED`

### Test Vector 9: Temporal Spoofing (Client Timestamp hijacking)
Attempting to set `createdAt` in a note to a manual date-time value in the future rather than using the server timestamp `request.time`.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 10: Temporal Alteration during Update
Attempting to preserve `updatedAt` without keeping it updated, or modifying `createdAt` during a note update.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 11: Self-Role Escalation/RBAC bypass
Attempting to set user profile roles or custom attributes directly from a client SDK session.
- Expected Output: `PERMISSION_DENIED`

### Test Vector 12: List Scraping/Blanket Read Query
Attempting to run an unconstrained collectionGroup list query across notes belonging to other accounts.
- Expected Output: `PERMISSION_DENIED`
