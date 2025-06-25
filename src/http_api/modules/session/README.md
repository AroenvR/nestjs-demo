# API Authentication & Token Management

This document describes the authentication flow, token handling, and route protection policies for our API.

## Routes Overview

| Route                 | Public / Protected | Authentication Mechanism                                     |
| --------------------- | ------------------ | ------------------------------------------------------------ |
| **POST /auth/login**   | Public             | None. Validates credentials and issues tokens.               |
| **POST /auth/refresh** | Protected          | Requires valid `refresh_token` HttpOnly cookie.             |
| **POST /auth/logout**  | Public             | Always clears cookies; parses & revokes token if present.   |
| **All other routes**   | Protected          | Requires `Authorization: Bearer <accessToken>` **or** `X-Swagger-API-Key` header. Cookies are ignored. |

---

## 1. POST /auth/login

- **Public endpoint**; no token or cookie required.

- On success:
  1. Issues an encrypted **JWT access token** (short-lived).  
  2. Sets a **`refresh_token`** as an HttpOnly, Secure, SameSite cookie.  
  3. Returns JSON payload:
```json
    {
      "accessToken": "<jwt>"
    }
```
---

## 2. POST /auth/refresh

- **Protected endpoint**; no `Authorization` header.  
- Reads **only** the `refresh_token` cookie.  
- On valid & unexpired cookie:
  1. Rotates the refresh token (invalidate old, set new cookie).  
  2. Issues a fresh **access token**.  
  3. Returns JSON payload:
```json
    {
      "accessToken": "<new-jwt>"
    }
```

- On missing/invalid cookie: responds `401 Unauthorized`.

---

## 3. POST /auth/logout

- **Public endpoint**; no guard.  
- Always clears the `refresh_token` cookie.  
- If a valid refresh token (or expired one) is present in the cookie:
  1. Parses it (ignoring expiration).  
  2. Revokes all server-side refresh-token records for that user.  
- Returns NO_CONTENT
---

## 4. All Other Routes

- **Protected endpoints**.  
- **Ignore** any cookies.  
- Require **one of two headers** on every request:  
  1. `Authorization: Bearer <accessToken>`  
  2. `X-Swagger-API-Key: <your-swagger-api-key>`  
- Returns `401 Unauthorized` if a header is missing, invalid, or expired.

---

## 5. Token & Cookie Lifecycle

1. **Login** (`POST /auth/login`)  
   - Client calls with credentials.  
   - Server responds with:
     - JSON `{ "accessToken": "<jwt>" }`  
     - HttpOnly cookie `refresh_token=<token>; Secure; SameSite=Strict; Max-Age=7d`

2. **Using the API**  
   - Client includes `Authorization: Bearer <accessToken>` OR `X-Swagger-API-Key` on every request.  
   - If a request returns `401 Unauthorized` (access token expired):
     1. Client immediately calls **`POST /auth/refresh`**.  
     2. On success, client replaces in-memory `accessToken` and retries the original request.

3. **Logout** (`POST /auth/logout`)  
   - Client calls (no tokens required).  
   - Server revokes refresh tokens (if present) and clears the cookie.

---

## 6. Security Notes

- **Access Tokens**  
  - Signed & encrypted using an environment variable set on startup.  
  - Short-lived (e.g. 15 minutes) to minimize risk if leaked.

- **Refresh Tokens**  
  - Stored as HttpOnly cookie.  
  - Rotated on each use and persisted (hashed) in the database for revocation.

- **Swagger API Key**  
  - Required for all protected routes to enable secure testing via Swagger UI.  
  - Sent in the `X-Swagger-API-Key` header.

- **Cookie Settings**  
  - `HttpOnly`, `Secure`, `SameSite=Strict` to prevent XSS/CSRF attacks.
