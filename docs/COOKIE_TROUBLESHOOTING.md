# Cookie Troubleshooting Guide

## Problem: Cookies Not Persisting in Browser

If cookies are being set in the response but not persisting in the browser, this is usually due to cross-origin cookie issues.

## Root Cause

When your frontend (`localhost:3000`) makes requests to your backend (`127.0.0.1:8000`), browsers treat them as **different origins** even though they're both localhost. This causes cookies to be blocked due to:

1. **SameSite Policy**: Cookies with `SameSite=Lax` are blocked in cross-origin requests
2. **Domain Mismatch**: Cookies set for `127.0.0.1` won't be accessible from `localhost` and vice versa
3. **CORS Restrictions**: Even with proper CORS headers, browsers have strict cookie policies

## Solution: Next.js API Rewrites

We've configured Next.js to proxy API requests through the same origin, which ensures cookies work correctly.

### How It Works

1. Frontend makes request to `/api/auth/signin` (same origin)
2. Next.js rewrites it to `http://127.0.0.1:8000/api/auth/signin`
3. Cookies are set for the same origin (`localhost:3000`)
4. Cookies persist correctly!

### Configuration

The `next.config.ts` file includes rewrites:

```typescript
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
    },
  ];
}
```

### Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Alternative Solutions

### Option 1: Use Same Domain for Both

Run both frontend and backend on the same domain:

- Frontend: `http://127.0.0.1:3000`
- Backend: `http://127.0.0.1:8000`

Or:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

**Important**: Use the same domain (either `localhost` or `127.0.0.1`) for both.

### Option 2: Backend Cookie Configuration

If you can't use Next.js rewrites, configure your backend to set cookies with:

```python
# For development (HTTP)
response.set_cookie(
    'access_token',
    token,
    httponly=True,
    samesite='None',  # Allow cross-origin
    secure=False,     # Only for HTTP in development
    domain=None,      # Let browser handle domain
    path='/',
    max_age=3600
)

# For production (HTTPS)
response.set_cookie(
    'access_token',
    token,
    httponly=True,
    samesite='None',
    secure=True,      # Required for SameSite=None
    domain=None,
    path='/',
    max_age=3600
)
```

### Option 3: CORS Configuration

Ensure your backend has proper CORS configuration:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,  # CRITICAL: Must be True for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Key Points**:

- `allow_credentials=True` is **required** for cookies
- `allow_origins` must include your frontend URL (not `*`)

## Verification

### Check Cookies in Browser

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → `http://localhost:3000`
4. You should see `access_token` and `refresh_token`

### Check Network Tab

1. Open Developer Tools → **Network** tab
2. Make a signin request
3. Click on the request → **Cookies** tab
4. Check **Response Cookies** - should show cookies being set
5. Check **Request Cookies** in subsequent requests - should show cookies being sent

## Common Issues

### Issue: Cookies Still Not Persisting

**Solution**: Restart your Next.js dev server after changing `next.config.ts`

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Issue: Cookies Work in Postman/Swagger But Not Browser

**Reason**: Postman/Swagger don't enforce SameSite policies like browsers do.

**Solution**: Use Next.js rewrites (already configured) or ensure same domain.

### Issue: Cookies Persist But Requests Fail

**Reason**: Backend might not be accepting cookies from the proxied request.

**Solution**: Ensure backend CORS allows credentials and the origin matches.

## Testing

1. **Sign In**: Should set cookies
2. **Check Application Tab**: Cookies should be visible
3. **Make Authenticated Request**: Cookies should be sent automatically
4. **Refresh Page**: Cookies should persist
5. **Sign Out**: Cookies should be cleared

## Production Considerations

In production, if frontend and backend are on different domains:

1. Use HTTPS (required for `SameSite=None; Secure`)
2. Configure backend with:
   - `SameSite=None`
   - `Secure=True`
   - Proper CORS with `allow_credentials=True`
3. Or use Next.js API routes as a proxy (recommended)

## Still Having Issues?

1. Check browser console for CORS errors
2. Check Network tab for cookie headers
3. Verify backend CORS configuration
4. Ensure `credentials: "include"` is set in fetch requests (already done)
5. Try clearing all cookies and testing again
