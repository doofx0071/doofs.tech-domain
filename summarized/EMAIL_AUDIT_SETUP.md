# Email Service & Audit Logging System

## Overview
This document describes the email service integration with Mailgun and the comprehensive audit logging system implemented for doofs.tech.

## 🎯 Features Implemented

### 1. Audit Logging System
- **Complete Activity Tracking**: All user actions are logged (profile updates, password changes, avatar changes, logins)
- **Admin Dashboard**: View all audit logs with statistics and filtering
- **Automatic Logging**: Integrated into all mutations and actions
- **Detailed Metadata**: Captures old/new values, timestamps, IP addresses, user agents
- **Status Tracking**: Success/failed status for all actions

### 2. Email Templates
Three responsive, branded email templates:
- **Password Reset Email**: Clean code display with expiry notice
- **Welcome Email**: Onboarding with feature highlights
- **Account Activity Email**: Security notifications for important changes

All templates:
- ✅ Fully responsive (mobile-first design)
- ✅ Match doofs.tech branding (gradient header, purple theme)
- ✅ Include plain text versions
- ✅ Professional footer with links
- ✅ Security best practices

### 3. Mailgun Integration
- Direct API integration (no third-party SDK required)
- Template support for reusable email designs
- Environment variable configuration
- Error handling and logging

## 📁 File Structure

```
convex/
├── schema.ts                    # Updated with auditLogs table
├── auditLogs.ts                 # Audit logging queries and mutations
├── profile.ts                   # Updated with audit logging
├── emailService.ts              # Mailgun integration
└── email-templates/
    ├── passwordReset.ts         # Password reset email template
    ├── welcome.ts               # Welcome email template
    └── accountActivity.ts       # Account activity notification template

src/components/admin/
└── AdminAuditLogs.tsx           # Admin dashboard for viewing logs

md/
└── mailgun-docs.md              # Mailgun API documentation
```

## 🔧 Setup Instructions

### 1. Mailgun Account Setup

1. **Sign up for Mailgun**: https://www.mailgun.com
2. **Verify your domain** or use Mailgun's sandbox domain for testing
3. **Get your API key** from the Mailgun dashboard
4. **Note your domain** (e.g., `mg.yourdomain.com` or sandbox domain)

### 2. Environment Variables

Add these to your Convex environment variables:

```bash
# In Convex Dashboard > Settings > Environment Variables
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.yourdomain.com
FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to noreply@MAILGUN_DOMAIN
```

### 3. Deploy Convex Schema

```bash
npx convex deploy
```

This will create the `auditLogs` table in your database.

## 📊 Database Schema

### auditLogs Table

| Field      | Type                              | Description                                   |
| ---------- | --------------------------------- | --------------------------------------------- |
| userId     | Id<"users">                       | User who performed the action                 |
| action     | string                            | Type of action (e.g., "password_changed")     |
| details    | string (optional)                 | Human-readable description                    |
| metadata   | object (optional)                 | Additional context (old/new values, IP, etc.) |
| timestamp  | number                            | When the action occurred (milliseconds)       |
| status     | string                            | "success" or "failed"                         |

**Indexes:**
- `by_user`: Query logs for a specific user
- `by_timestamp`: Query logs chronologically
- `by_user_and_timestamp`: Combined index for user-specific chronological queries

## 🚀 Usage Examples

### Sending Password Reset Email

```typescript
import { api } from "../convex/_generated/api";
import { useAction } from "convex/react";

const sendPasswordReset = useAction(api.emailService.sendPasswordResetEmail);

// In your component
await sendPasswordReset({
  email: "user@example.com",
  userName: "John Doe",
  resetCode: "123456",
});
```

### Sending Welcome Email

```typescript
await ctx.runAction(api.emailService.sendWelcomeEmail, {
  email: user.email,
  userName: user.name,
});
```

### Sending Account Activity Notification

```typescript
await ctx.runAction(api.emailService.sendAccountActivityEmail, {
  email: user.email,
  userName: user.name,
  activityType: "password_changed",
  activityDetails: "Your password was successfully changed",
  ipAddress: "192.168.1.1",
  location: "San Francisco, CA",
  device: "Chrome on Windows",
});
```

### Viewing Audit Logs (Admin)

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Get all logs
const logs = useQuery(api.auditLogs.getAllAuditLogs, { limit: 100 });

// Get logs for specific user
const userLogs = useQuery(api.auditLogs.getAllAuditLogs, {
  userId: userId,
  limit: 50,
});

// Get statistics
const stats = useQuery(api.auditLogs.getAuditLogsStats, {
  timeRange: "7d", // "24h", "7d", or "30d"
});
```

## 🔐 Security Features

### Audit Logging
- **Automatic**: No manual logging needed, integrated into mutations
- **Immutable**: Logs cannot be edited once created
- **Comprehensive**: Captures all user actions
- **Timestamped**: Precise timestamps for all events
- **Metadata**: Includes before/after values for changes

### Email Security
- **No Code in URL**: Reset codes are sent via email, not URL
- **Expiry**: Codes expire after 15 minutes
- **Security Warnings**: Emails include security tips
- **Plain Text**: Fallback for email clients without HTML support

## 📝 Logged Actions

Current actions being logged:

| Action                     | Trigger                       | Details Captured      |
| -------------------------- | ----------------------------- | --------------------- |
| `login`                    | User signs in                 | IP, device, location  |
| `first_login`              | User's first sign in          | IP, device, location  |
| `password_changed`         | Password update               | Success/failure       |
| `password_change_failed`   | Failed password change        | Reason for failure    |
| `profile_updated`          | Name or profile change        | Old/new values        |
| `avatar_changed`           | Avatar/variant update         | Old/new avatar        |
| `email_changed`            | Email address update          | Old/new email         |
| `login_new_device`         | Login from unrecognized device| Device details        |

## 🎨 Email Template Customization

### Colors
All templates use the doofs.tech brand colors:
- Primary Gradient: `#667eea` → `#764ba2`
- Alert Gradient: `#f093fb` → `#f5576c`
- Background: `#f5f5f5`
- Text: `#1a1a1a`

### Customizing Templates

Edit the template files in `convex/email-templates/`:

```typescript
// Example: Change expiry time in password reset
export function generatePasswordResetEmail({
  userName,
  resetCode,
  expiryMinutes = 30, // Changed from 15 to 30
}: PasswordResetTemplateProps): string {
  // ...
}
```

## 🧪 Testing

### Test Mode (Mailgun)
For testing without sending real emails:

```typescript
// Add to your email send call
formData.append("o:testmode", "yes");
```

### Local Development
1. Use Mailgun's sandbox domain for free testing
2. Add test email addresses to authorized recipients
3. Check Mailgun dashboard for delivery logs

## 📊 Admin Dashboard

The `AdminAuditLogs` component provides:
- **Statistics Cards**: Total actions, success/failure rates, active users
- **Activity Breakdown**: Most common actions
- **Detailed Table**: All logs with filtering and sorting
- **Real-time Updates**: Convex reactive queries

To add to admin dashboard:

```typescript
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";

// In your admin dashboard
<Tabs value="audit-logs">
  <TabsContent value="audit-logs">
    <AdminAuditLogs />
  </TabsContent>
</Tabs>
```

## 🔄 Maintenance

### Cleanup Old Logs

```typescript
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";

const deleteOldLogs = useMutation(api.auditLogs.deleteOldAuditLogs);

// Delete logs older than 90 days
await deleteOldLogs({ daysToKeep: 90 });
```

Consider setting up a Convex cron job for automatic cleanup:

```typescript
// In convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.monthly(
  "cleanup-old-audit-logs",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.auditLogs.deleteOldAuditLogs,
  { daysToKeep: 90 }
);

export default crons;
```

## 🐛 Troubleshooting

### Email Not Sending

1. **Check environment variables**: Ensure `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are set
2. **Verify domain**: Make sure your Mailgun domain is verified
3. **Check Mailgun logs**: View delivery attempts in Mailgun dashboard
4. **Test mode**: Ensure `o:testmode` is not set in production

### Audit Logs Not Appearing

1. **Check schema deployment**: Run `npx convex deploy`
2. **Verify mutations**: Ensure audit logging code is in place
3. **Check permissions**: User must be authenticated
4. **Review errors**: Check Convex dashboard for function errors

### Template Rendering Issues

1. **HTML validation**: Ensure templates are valid HTML
2. **Test in multiple clients**: Gmail, Outlook, Apple Mail
3. **Use plain text**: Always provide plain text fallback
4. **Inline CSS**: Keep all styles inline for compatibility

## 📚 Additional Resources

- [Mailgun Documentation](https://documentation.mailgun.com)
- [Email Template Best Practices](https://www.mailgun.com/blog/email/transactional-html-email-templates/)
- [Convex Documentation](https://docs.convex.dev)
- [HTML Email Guide](https://templates.mailchimp.com/getting-started/html-email-basics/)

## 🎯 Next Steps

1. **Add Role-Based Access Control**: Restrict audit log viewing to admins
2. **Email Verification**: Integrate email verification flow
3. **Two-Factor Authentication**: Add 2FA with email codes
4. **Advanced Filtering**: Add date range and action type filters to admin dashboard
5. **Export Logs**: Add CSV/PDF export functionality
6. **Email Templates in Mailgun**: Upload templates to Mailgun for easier management
7. **Webhooks**: Set up Mailgun webhooks for delivery tracking

## ✅ Checklist

- [x] Audit logging schema created
- [x] Audit logging integrated into all actions
- [x] Email templates created (3 types)
- [x] Mailgun integration implemented
- [x] Admin dashboard for logs created
- [x] Documentation completed
- [ ] Environment variables configured (⚠️ TODO)
- [ ] Mailgun domain verified (⚠️ TODO)
- [ ] Test emails sent (⚠️ TODO)
- [ ] Role-based access for admin logs (⚠️ TODO)

## 📞 Support

For issues or questions:
- Check Convex logs in dashboard
- Review Mailgun delivery logs
- Check this documentation
- Contact support team

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintainer**: doofs.tech Team
