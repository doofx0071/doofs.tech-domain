# doofs.tech-domain AGENTS.md

## 🚀 Development Commands

| Task | Command | Description |
|------|---------|-------------|
| **Dev** | `npm run dev` | Starts the Vite development server |
| **Build** | `npm run build` | Builds the project for production |
| **Lint** | `npm run lint` | Runs ESLint for the entire project |
| **Backend** | `npx convex dev` | Starts the Convex development server |
| **Test** | N/A | No test suite currently configured |

---

## 🛠️ Code Style & Guidelines

### 📦 Imports
- **Alias**: Use `@/` for `src/` directory (e.g., `import { Button } from "@/components/ui/button"`).
- **Convex**: 
  - Import `v` from `convex/values`.
  - Import `mutation`, `query`, `action` from `./_generated/server`.
  - Import `internal`, `api` from `./_generated/api`.
- **Hooks**: Prefer named imports for hooks.
- **Components**: Group shadcn/ui imports at the top of the component section.

### 🎨 Formatting & UI
- **Styling**: Strictly use **Tailwind CSS** utility classes. Avoid inline styles or CSS modules unless absolutely necessary for external library overrides.
- **UI Components**: Built on top of **shadcn/ui** primitives found in `src/components/ui`.
- **Animations**: Use **Framer Motion** for transitions and interactive elements.
- **Icons**: Use **Lucide React** for consistent iconography.
- **Dark Mode**: Supports both light and dark themes using `next-themes` and `ThemeContext`.
- **Feedback**: Use the `Toaster` and `Sonner` components for toast notifications.

### ⌨️ TypeScript & Types
- **Configuration**: The project uses a loose TypeScript configuration (`strictNullChecks: false`, `noImplicitAny: false`) to prioritize development speed. However, try to provide types where it significantly improves DX.
- **Naming Conventions**: 
  - **Frontend**: `camelCase` for variables and functions, `PascalCase` for React components.
  - **Schema/DB**: Table names typically use `snake_case` (e.g., `dns_records`, `dns_jobs`, `platform_domains`).
  - **Files**: Components should match their export name (e.g., `MyComponent.tsx`).
- **Interfaces**: Prefer `interface` over `type` for object definitions that might be extended.
- **Global Types**: Define reusable interfaces in a `types/` directory if they span multiple modules.

### ⚠️ Error Handling
- **Backend (Convex)**: 
  - Use `throw new Error("Human-readable message")` for validation or permission failures.
  - Wrap complex Cloudflare/External API calls in `try/catch` and log errors to `auditLogs`.
- **Frontend**: 
  - **Standardized Hook**: Use the `useAsyncFeedback` hook from `src/hooks/use-async-feedback.ts` for all mutations/actions. It handles:
    - Standardized loading states.
    - Error cleaning via `formatError`.
    - Automated toast notifications (success/error).
    - Session expiration auto-redirects.
- **Utilities**: Centralized error logic in `src/lib/error-handling.ts`.
  - `formatError(error)`: Strips technical jargon (e.g., "Server Error Called by client") before display.
  - `isSessionError(error)`: Identifies if the user needs to re-authenticate.

---

## 🏗️ Architecture & Core Modules

### 📡 Real-time Backend (Convex)
- All data synchronization is handled by Convex.
- **Queries**: Read-only, automatically reactive.
- **Mutations**: Synchronous database updates.
- **Actions**: Used for side effects (Cloudflare API, Mailgun emails, Turnstile verification).

### 🌐 DNS & Cloudflare
- The platform manages subdomains on platform-owned domains (e.g., `doofs.tech`).
- **Jobs**: DNS operations are queued via `dns_jobs` and processed asynchronously to handle rate limits and retries.
- **Verification**: Domain ownership is verified via `_doofs-verify` TXT records.

### 📧 Email System
- Integrated with **Mailgun**.
- Templates are located in `convex/emailTemplates/`.
- Notifications are sent for: domain claims, contact receipts, and admin alerts.

### 🔒 Authentication
- **Provider**: Convex Auth.
- **Method**: GitHub OAuth.
- **Security**: Cloudflare Turnstile protection on critical actions like claiming domains.

---

## 🧬 Standard Patterns

### 1. Implementing a Mutation with Feedback
```tsx
const { execute, isLoading } = useAsyncFeedback(useMutation(api.dns.createRecord), {
    successMessage: "DNS record created successfully!",
    onSuccess: () => setIsOpen(false)
});

// usage
<Button onClick={() => execute({ domainId, type: "A", name: "@", content: "1.1.1.1" })} disabled={isLoading}>
    {isLoading ? <LoadingSpinner /> : "Create Record"}
</Button>
```

### 2. Convex Query with Arguments
```ts
// convex/myModule.ts
export const listItems = query({
    args: { filter: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];
        return await ctx.db.query("myTable").withIndex("by_user", q => q.eq("userId", userId)).collect();
    }
});
```

### 3. Creating an Action with External API
```ts
export const callExternalApi = action({
    args: { data: v.string() },
    handler: async (ctx, args) => {
        const response = await fetch("https://api.external.com", {
            method: "POST",
            body: JSON.stringify({ data: args.data })
        });
        if (!response.ok) throw new Error("External API failed");
        return await response.json();
    }
});
```

---

## 🤖 AI Context & Project Goals

- **Goal**: Provide free subdomains for Filipino developers to host their projects.
- **State**: The codebase is in a "disciplined but pragmatic" state. We follow patterns for consistency, but don't let strictness block features.
- **Suppression**: In `src/App.tsx`, we deliberately suppress `InvalidAccountId` console errors to avoid noise from background auth checks.
- **Environment**: Sensitive routes like the Admin Dashboard use environment-variable-based paths (e.g., `VITE_ADMIN_ROUTE`).
