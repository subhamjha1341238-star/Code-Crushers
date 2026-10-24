# Security Specification: AdaptLearn AI

## 1. Data Invariants
1. **User Profile Ownership**: A user profile document `/users/{userId}` can only be read and written by the authenticated user matching `request.auth.uid == userId`.
2. **Session Integrity**: A session `/users/{userId}/sessions/{sessionId}` must belong to the authenticated user (`userId == request.auth.uid`). Users cannot write sessions under other users' accounts.
3. **Roadmap Security**: Saved skill roadmaps `/users/{userId}/roadmaps/{roadmapId}` are private to the owning user (`userId == request.auth.uid`).
4. **ID Sanitization**: All document IDs (`userId`, `sessionId`, `roadmapId`) must be valid alphanumeric strings under 128 characters without traversal or injection characters.
5. **String Boundary Limits**: All string fields are constrained to max lengths to guard against resource exhaustion (Denial of Wallet).
6. **Default Deny**: All unspecified paths are closed by default with `allow read, write: if false;`.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated Read**: Request to `/users/abc` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Cross-User Profile Hijack**: Authenticated user `alice` attempts to write `/users/bob` -> `PERMISSION_DENIED`.
3. **Cross-User Session Poisoning**: User `alice` attempts to create `/users/bob/sessions/sess-1` -> `PERMISSION_DENIED`.
4. **Oversized String Injection**: Payload with a 100KB `displayName` -> `PERMISSION_DENIED`.
5. **Path Poisoning with Junk Chars**: Document ID with invalid characters `userId: ../admin` -> `PERMISSION_DENIED`.
6. **Oversized Roadmap Payload**: Roadmap diagram string greater than 8,000 characters -> `PERMISSION_DENIED`.
7. **Ghost Field Injection**: Attempting to write undeclared administrative fields like `role: "admin"` -> `PERMISSION_DENIED`.
8. **Blanket Query Scraping**: Attempting to list all users collection across root -> `PERMISSION_DENIED`.
9. **Unauthenticated Session Creation**: Anonymous caller writes to `/users/any/sessions/1` -> `PERMISSION_DENIED`.
10. **Negative Metric Tampering**: Writing negative streak or focus score values -> `PERMISSION_DENIED`.
11. **Immutability Breach**: Updating `uid` or `userId` to a different UID on update -> `PERMISSION_DENIED`.
12. **Root Collection Write**: Attempting to create documents in arbitrary collections like `/admin_secrets` -> `PERMISSION_DENIED`.
