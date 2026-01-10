# Admin Account Setup Guide

## Quick Start (3 Methods)

### Method 1: Using AdminSetup Component (Easiest)

1. **Add the AdminSetup component to a route:**

```tsx
// In your App.tsx or router file
import AdminSetup from "@/components/admin/AdminSetup";

// Add a temporary route
<Route path="/setup-admin" element={<AdminSetup />} />
```

2. **Navigate to the setup page:**
   - Go to `http://localhost:5173/setup-admin`
   - Click "Make Me Admin" button
   - You'll become the first admin

3. **Remove the route after setup:**
   - Once you're admin, remove the `/setup-admin` route for security

---

### Method 2: Using Convex Dashboard (Quick)

1. **Open Convex Dashboard:**
   - Go to https://dashboard.convex.dev
   - Select your project: `ceaseless-opossum-708`

2. **Find your user ID:**
   - Go to "Data" tab
   - Click on "users" table
   - Find your account (by email)
   - Copy the `_id` value (e.g., `j97abc123...`)

3. **Run mutation:**
   - Go to "Functions" tab
   - Find `admin:makeUserAdmin`
   - Click "Run"
   - Enter:
     ```json
     {
       "userId": "j97abc123..." 
     }
     ```
   - Click "Run Function"

---

### Method 3: Using Code (Programmatic)

Create a one-time setup script:

```typescript
// In your console or a test component
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// In a component or console
const makeMeAdmin = useMutation(api.admin.makeMeAdmin);

// Call it
await makeMeAdmin();
```

---

## Verification

After setup, verify you're admin:

```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function CheckAdmin() {
  const isAdmin = useQuery(api.admin.isAdmin);
  return <div>Admin status: {isAdmin ? "✅ Yes" : "❌ No"}</div>;
}
```

---

## Admin Features Now Available

Once you're admin, you can:

### 1. View Audit Logs
```tsx
// Add to your admin dashboard routes
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";

<Route path="/admin/logs" element={<AdminAuditLogs />} />
```

### 2. Manage Users
```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function AdminUsers() {
  const users = useQuery(api.admin.getAllUsers, { limit: 100 });
  
  return (
    <div>
      {users?.map(user => (
        <div key={user._id}>
          {user.name} - {user.email} - {user.role}
        </div>
      ))}
    </div>
  );
}
```

### 3. Promote Other Users to Admin
```tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function PromoteUser() {
  const makeAdmin = useMutation(api.admin.makeUserAdmin);
  
  const handlePromote = async (userId: string) => {
    await makeAdmin({ userId });
  };
  
  return <button onClick={() => handlePromote("j97...")}>Make Admin</button>;
}
```

---

## Security Notes

### Important Protections in Place:

✅ **First Admin Protection**: Only works when no admin exists
✅ **Last Admin Protection**: Can't remove the last admin
✅ **Authentication Required**: All admin functions require login
✅ **Role-Based Access**: Audit logs only accessible to admins

### Best Practices:

1. **Remove Setup Component**: After creating first admin, remove or hide the AdminSetup component
2. **Use Environment Variables**: For production, consider using environment variables for admin emails
3. **Enable MFA**: Consider adding multi-factor authentication for admin accounts
4. **Monitor Audit Logs**: Regularly review admin actions in audit logs

---

## Troubleshooting

### "Admin already exists" error
- Someone already became admin
- Contact the existing admin to promote you
- Check Convex dashboard "users" table to see who is admin (role: "admin")

### "You must be logged in" error
- Make sure you're authenticated
- Check if your session is valid
- Try logging out and back in

### Can't access admin dashboard
- Verify you're admin: use `api.admin.isAdmin` query
- Check browser console for errors
- Ensure you deployed latest schema changes

---

## Database Schema

The users table now has a `role` field:

```typescript
role: v.optional(v.union(v.literal("admin"), v.literal("user")))
```

Possible values:
- `"admin"` - Full admin access
- `"user"` - Regular user (default)
- `undefined` - Legacy users (treated as regular user)

---

## Available Admin Functions

### Queries (Read)
- `api.admin.isAdmin` - Check if current user is admin
- `api.admin.getAllAdmins` - List all admin users
- `api.admin.getAllUsers` - List all users (with limit)
- `api.auditLogs.getAllAuditLogs` - View all audit logs (admin only)
- `api.auditLogs.getAuditLogsStats` - Get audit statistics

### Mutations (Write)
- `api.admin.makeMeAdmin` - Make yourself admin (first admin only)
- `api.admin.makeUserAdmin` - Promote user to admin
- `api.admin.removeAdmin` - Remove admin role from user

---

## Example: Complete Admin Dashboard

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";

export default function AdminDashboard() {
  const isAdmin = useQuery(api.admin.isAdmin);
  const users = useQuery(api.admin.getAllUsers);
  const makeAdmin = useMutation(api.admin.makeUserAdmin);
  
  if (!isAdmin) {
    return <div>Access Denied: Admin Only</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* User Management */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="space-y-2">
          {users?.map(user => (
            <div key={user._id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">Role: {user.role || "user"}</p>
              </div>
              {user.role !== "admin" && (
                <button 
                  onClick={() => makeAdmin({ userId: user._id })}
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Make Admin
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Audit Logs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
        <AdminAuditLogs />
      </section>
    </div>
  );
}
```

---

## Next Steps

After creating your admin account:

1. ✅ Deploy schema changes: `npx convex deploy`
2. ✅ Create your admin account using one of the methods above
3. ✅ Test admin access to audit logs
4. ✅ Add admin dashboard to your routes
5. ✅ Remove or secure the admin setup component
6. 🔄 Consider adding more admin features as needed

---

**Your admin system is now ready!** 🚀
