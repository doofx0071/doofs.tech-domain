# Feature Ideas & Roadmap

> Last updated: January 20, 2026

A living document of feature ideas for doofs.tech | Domains.

---

## ✅ Current Features (Already Implemented)

| Category | Features |
|----------|----------|
| **Auth** | GitHub OAuth, Role-based access (admin/user), Account suspension |
| **Domains** | Platform domains, User subdomains, DNS management (A, AAAA, CNAME, TXT, MX) |
| **Admin** | Dashboard, User management, Domain management, Audit logs, Settings, Analytics |
| **Client** | Dashboard, DNS Editor, API Keys, Settings, Onboarding tour |
| **API** | REST API with key authentication, Request logging, Rate limiting |
| **Notifications** | Real-time notifications system |
| **Email** | Mailgun integration, Welcome/Domain claimed emails |
| **Security** | Turnstile protection, Rate limiting, Audit logging |

---

## 🚀 High Priority Ideas

- [x] **SSL Certificate Status** - Show SSL status for each subdomain (via Cloudflare API) ✅
- [x] **Domain Verification** - TXT record verification before activating domains ✅
- [ ] **Webhook Notifications** - Send webhooks on DNS changes for automation
- [ ] **Bulk DNS Import** - Import DNS records from CSV/JSON

---

## 💡 Medium Priority Ideas

- [ ] **Custom DNS Templates** - Save/reuse DNS configurations (e.g., "Vercel Setup", "Netlify Setup")
- [ ] **Domain Analytics** - Show DNS query stats if Cloudflare Analytics API is available
- [ ] **Two-Factor Authentication (2FA)** - Add TOTP-based 2FA for account security
- [ ] **Team/Organization Support** - Allow multiple users to manage same domains
- [x] **Domain Transfer** - Transfer subdomain ownership to another user 

---

## 🎨 Nice-to-Have Ideas

- [ ] **Dark/Light Mode Toggle** - User preference for theme
- [ ] **PWA Support** - Add to home screen, offline mode
- [ ] **Changelog/Updates Page** - Public changelog for new features
- [ ] **Status Page Integration** - Show real-time Cloudflare/platform status
- [ ] **Email Inbox** - Simple catch-all inbox for subdomains

---

## 🔧 Technical Improvements

- [ ] **Add Search to Audit Logs** - Extend search functionality
- [ ] **Cron Job Monitoring** - Dashboard widget showing cron job health
- [ ] **Error Boundary Improvements** - More granular error handling
- [ ] **E2E Tests** - Add Playwright tests for critical flows

---

## 📝 Notes

_Add any additional notes or context here as you work on features._
