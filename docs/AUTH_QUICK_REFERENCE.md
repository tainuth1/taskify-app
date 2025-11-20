# Authentication Quick Reference

Quick reference guide for using authentication in Taskify.

## Import Statements

```typescript
// Redux actions
import {
  signUpAsync,
  signInAsync,
  signOutAsync,
  getCurrentUserAsync,
} from "@/features/auth/authSlice";

// API client for authenticated requests
import { apiClient } from "@/services/apiClient";

// Redux hooks
import { useAppDispatch, useAppSelector } from "@/store";
```

## Common Patterns

### Sign Up

```typescript
const dispatch = useAppDispatch();

const handleSignup = async () => {
  const result = await dispatch(
    signUpAsync({
      name: "johndoe",
      email: "john@example.com",
      password: "SecurePass123",
    })
  );

  if (signUpAsync.fulfilled.match(result)) {
    router.push("/workspace");
  }
};
```

### Sign In

```typescript
const dispatch = useAppDispatch();

const handleSignin = async () => {
  const result = await dispatch(
    signInAsync({
      email: "john@example.com",
      password: "SecurePass123",
    })
  );

  if (signInAsync.fulfilled.match(result)) {
    router.push("/workspace");
  }
};
```

### Sign Out

```typescript
const dispatch = useAppDispatch();
const router = useRouter();

const handleSignout = async () => {
  await dispatch(signOutAsync());
  router.push("/login");
};
```

### Access Auth State

```typescript
const { user, isAuthenticated, isLoading, error } = useAppSelector(
  (state) => state.auth
);
```

### Make Authenticated API Request

```typescript
// GET request
const tasks = await apiClient("/api/tasks", { method: "GET" });

// POST request
const newTask = await apiClient("/api/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "New Task" }),
});
```

## State Properties

- `user` - Current user data (null if not authenticated)
- `isAuthenticated` - Boolean indicating auth status
- `isLoading` - Boolean indicating if auth operation is in progress
- `isVerifying` - Boolean indicating if verifying auth on mount
- `error` - Error message string (null if no error)

## Protected Routes

Routes under `app/(workspaces)/` are automatically protected. The layout will:

1. Verify authentication on mount
2. Redirect to `/login` if not authenticated
3. Show loading state during verification

## Token Refresh

Token refresh happens automatically when:

- A 401 error is encountered
- The API client intercepts the error
- Tokens are refreshed in the background
- Original request is retried

No manual intervention needed!
