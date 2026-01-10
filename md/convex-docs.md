# Convex Database & Backend Documentation

## Overview
Convex is a backend platform for building TypeScript fullstack apps with a database, serverless functions, and file storage. It provides queries, mutations, and actions for building robust applications.

---

## Queries

### Query Functions
Queries fetch data from the database and return results to the client.

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTaskList = query({
  args: { taskListId: v.id("taskLists") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .order("desc")
      .take(100);
    return tasks;
  },
});
```

### Query Context
The `QueryCtx` object provides access to:
- `db`: Database read operations
- `storage`: File storage URLs
- `auth`: Authentication information

### Query Features
- **Caching**: Results are automatically cached
- **Reactivity**: Clients can subscribe to receive updates
- **Consistency**: All reads happen at the same logical timestamp
- **Deterministic**: Queries must be deterministic (no third-party API calls)

---

## Mutations

### Mutation Functions
Mutations insert, update, and remove data from the database.

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", { text: args.text });
    return newTaskId;
  },
});
```

### Mutation Context
The `MutationCtx` object provides:
- `db`: Full database read/write operations
- `storage`: File upload URLs
- `auth`: Authentication checks
- `scheduler`: Schedule future functions

### Mutation Features
- **Transactional**: All reads/writes happen together
- **Ordered**: Mutations execute in order on the client
- **Atomic**: All writes succeed or all fail

---

## Authentication

### Getting User Identity
```typescript
export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const { tokenIdentifier, name, email } = identity;
    // Use authenticated user info
  },
});
```

### Auth Configuration
Convex supports multiple authentication providers through OpenID Connect (OAuth/JWT):
- **Clerk**: Great for Next.js and React Native
- **Auth0**: Established provider with more features
- **WorkOS AuthKit**: Built for B2B apps
- **Custom Auth**: Any OpenID Connect-compatible provider
- **Convex Auth**: Built-in auth library for React apps (beta)

### Auth Config File
```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: 'convex',
    },
  ],
};
```

---

## Database

### Schema Definition
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.id("users"),
    body: v.string(),
  }),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
```

### Writing Data
```typescript
// Insert
const newTaskId = await ctx.db.insert("tasks", { text: args.text });

// Update
await ctx.db.patch(taskId, { completed: true });

// Delete
await ctx.db.delete(taskId);
```

### Reading Data
```typescript
// Get single document
const task = await ctx.db.get(taskId);

// Query all
const tasks = await ctx.db.query("tasks").collect();

// Filter
const tasks = await ctx.db
  .query("tasks")
  .filter((q) => q.eq(q.field("completed"), false))
  .collect();

// With index
const user = await ctx.db
  .query("users")
  .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenId))
  .unique();
```

---

## Storing Users in Database

### Users Table Schema
```typescript
users: defineTable({
  name: v.string(),
  tokenIdentifier: v.string(),
}).index("by_token", ["tokenIdentifier"]),
```

### Store User Mutation
```typescript
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
```

### Store User in React
```typescript
import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}
```

---

## Client Integration

### React Hooks
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  // Fetch data
  const data = useQuery(api.myFunctions.sum, { a: 1, b: 2 });

  // Mutation
  const mutateSomething = useMutation(api.myFunctions.mutateSomething);
  
  const handleClick = () => {
    mutateSomething({ a: 1, b: 2 });
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### Setup with Provider
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL!);

function App() {
  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <YourApp />
      </ConvexProvider>
    </ClerkProvider>
  );
}
```

---

## Actions

Actions allow you to call third-party APIs (non-deterministic operations).

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const myAction = action({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch("https://en.wikipedia.org/...");
    const data = await response.json();
    return data;
  },
});
```

---

## File Storage

### Upload URLs
```typescript
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Store References
```typescript
export const uploadFile = mutation({
  args: { storageId: v.string(), fileName: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
    });
  },
});
```

---

## Error Handling

### Common Issues
1. **`ctx.auth.getUserIdentity()` returns null**: User not authenticated when query/mutation runs
2. **String replacement failures**: Whitespace/formatting mismatches
3. **Read/write limit errors**: Too much data read/written in one transaction

### Debugging Authentication
1. Add logging: `console.log("server identity", await ctx.auth.getUserIdentity());`
2. Check dashboard logs at `dashboard.convex.dev/deployment/logs`
3. Verify auth config at dashboard Settings > Authentication
4. Check JWT token at `https://jwt.io/`
5. Verify `iss` (domain) and `aud` (app ID) match configuration

---

## Limits
- Read/write size limits per transaction
- Check dashboard for current limits
- See official documentation for details

---

## Convex Auth (Beta)

Built-in authentication library for React apps with password, social, and OTP support.

```typescript
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
```

---

## Key Takeaways
- **Queries**: Read-only, cached, reactive
- **Mutations**: Write data, transactional, ordered
- **Actions**: Call external APIs
- **Authentication**: Multiple provider support via OpenID Connect
- **Database**: Schema-defined, with indexes for performance
- **Client**: Easy React integration with hooks

For more details, visit: https://docs.convex.dev/
