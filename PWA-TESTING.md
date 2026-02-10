# PWA Testing & Verification Guide

## ✅ Build Status

- **Build**: ✅ Passes with 36 precached entries (3,081 KiB)
- **Service Worker**: ✅ Generated (dist/sw.js)
- **Manifest**: ✅ Generated with icons & screenshots (dist/manifest.webmanifest)
- **PWA Icons**: ✅ 8 sizes (72-512px) with safe zones
- **PWA Screenshots**: ✅ Wide (1280x720) & Narrow (750x1334)

---

## 🧪 Manual Testing Checklist

### 1. Chrome/Edge DevTools Verification

1. Build the project: `npm run build`
2. Run dev server: `npm run dev`
3. Open browser DevTools (F12)
4. Go to **Application > Service Workers** tab
5. Verify:
   - [ ] Service Worker is registered (active)
   - [ ] Scope is `/`
   - [ ] Status shows "activated and running"

### 2. Manifest Verification

1. In DevTools, go to **Application > Manifest**
2. Verify the manifest loads correctly:
   - [ ] Name: "doofs | Free Domains for Developers"
   - [ ] Short name: "doofs"
   - [ ] Icons: 8 entries (72-512px)
   - [ ] Screenshots: 2 entries (wide & narrow)
   - [ ] Theme color: Shows primary blue
   - [ ] Display: "standalone"

### 3. PWA Install Prompt

1. Open in a Chrome/Edge Chromium browser
2. Wait 5 seconds for the install prompt to appear
3. Verify the dialog:
   - [ ] Dialog shows with "Install doofs App" title
   - [ ] Shows logo and description
   - [ ] Dark mode toggle works (logo switches)
   - [ ] "Install" button is clickable
   - [ ] "Not now" and "Don't show again" buttons work
   - [ ] Prompt doesn't show again after dismissing 3 times

### 4. Theme Color Sync (CRITICAL)

1. Open DevTools > Elements
2. Find `<meta name="theme-color">` tag
3. Switch theme (dark/light mode in app)
4. Verify:
   - [ ] Meta tag content changes immediately
   - [ ] Light mode: `#ffffff` (white)
   - [ ] Dark mode: `#0f172a` (dark slate)
   - [ ] Browser chrome color updates in real-time

### 5. Offline Functionality

1. Open DevTools > Application > Service Workers
2. Check "Offline" checkbox
3. Verify:
   - [ ] App still loads (shows cached content)
   - [ ] Navigation still works
   - [ ] Static assets load (images, CSS, JS)
   - [ ] API calls fail gracefully with offline message

### 6. Update Notification

1. In one tab, open the dev site (localhost:8081)
2. Modify `src/App.tsx` (add a comment or small change)
3. Save and rebuild (`npm run build`)
4. In the browser tab, DevTools will detect the change
5. Verify:
   - [ ] "Update Available" dialog appears
   - [ ] "Update Now" button refreshes with new version

---

## 🔍 Lighthouse PWA Audit

### Run Audit

```bash
# Option 1: Chrome DevTools
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Generate report" for PWA

# Option 2: CLI
npm install -g lighthouse
lighthouse http://localhost:8081 --view --chrome-flags="--headless"
```

### Expected Results

- **PWA Audit Score**: 90+
- **Service Worker**: ✅ Registered
- **Manifest**: ✅ Valid
- **HTTPS**: ⚠️ Localhost only (pass in production)
- **Icons**: ✅ Found and valid
- **Screenshots**: ✅ Found and valid
- **Display Mode**: ✅ Standalone
- **Theme Color**: ✅ Present

### Known Issues

1. **HTTPS Warning**: Only appears on localhost. Will pass on production domain.
2. **Large Bundle**: 1.6MB main chunk (can be optimized with code splitting)

---

## 📱 Real Device Testing

### Android (Chrome)

1. Build and deploy to server (or use ngrok for localhost)
2. Open on Android Chrome
3. Verify:
   - [ ] "Install app" prompt appears in address bar
   - [ ] Can add to home screen
   - [ ] App opens in standalone mode
   - [ ] Offline works

### iOS (Safari)

1. Open on iPhone Safari
2. Tap Share menu → "Add to Home Screen"
3. Verify:
   - [ ] Icon displays correctly
   - [ ] App name shows as "doofs"
   - [ ] Opens in full-screen standalone mode
   - [ ] Status bar styling works

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] HTTPS is enabled (required for PWA)
- [ ] Service worker caching strategy is appropriate
- [ ] Icons have correct dimensions and safe zones
- [ ] Screenshots represent app features accurately
- [ ] Theme colors match brand (light/dark)
- [ ] Manifest start_url is correct
- [ ] Lighthouse audit score ≥ 90

### Vercel Deployment

```bash
# Build creates dist folder with service worker
npm run build

# Vercel automatically:
# - Serves HTTPS
# - Minifies service worker
# - Sets correct cache headers
# - Enables gzip compression
```

### Self-hosted Deployment

1. Ensure HTTPS is enabled (PWA requirement)
2. Set correct cache headers:
   ```
   Service Worker (sw.js): Cache-Control: no-cache
   Manifest: Cache-Control: no-cache
   Assets: Cache-Control: max-age=31536000
   ```
3. Verify manifest.webmanifest is served with `application/manifest+json` MIME type
4. Icons must be accessible from the same origin

---

## 🐛 Troubleshooting

### Service Worker Not Registering

**Problem**: "Service Worker registration failed"

**Solutions**:
1. Ensure HTTPS (except localhost)
2. Check DevTools > Application > Service Workers for error message
3. Verify sw.js is generated in dist folder
4. Clear browser cache: DevTools > Application > Clear storage

### Install Prompt Not Showing

**Problem**: Dialog doesn't appear after 5 seconds

**Reasons**:
- App is already installed → Check with `window.matchMedia("(display-mode: standalone)").matches`
- Prompt was dismissed 3 times → Clear localStorage: `localStorage.removeItem("pwa-install-prompt-count")`
- Not on HTTPS → PWA only works on HTTPS (except localhost)
- Browser doesn't support PWA → Try Chrome, Edge, or Firefox
- Not installable criteria met → Run Lighthouse audit to see why

**Test Fix**:
```javascript
// In browser console
localStorage.removeItem("pwa-install-prompt-count");
location.reload();
```

### Theme Color Not Updating

**Problem**: Browser chrome color doesn't change when theme toggles

**Solutions**:
1. Verify ThemeContext is properly setting the meta tag:
   ```javascript
   // Check in console
   document.querySelector('meta[name="theme-color"]').getAttribute('content')
   ```
2. Ensure theme provider is wrapping all content in App.tsx
3. Restart dev server: `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Offline Page Shows Blank

**Problem**: When offline, app shows blank white page

**Solutions**:
1. Verify service worker is active (see DevTools)
2. Check that index.html is being precached
3. Ensure API calls have error handling
4. Consider creating offline fallback page

---

## 📚 Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web App Manifest Spec](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Lighthouse PWA Audit](https://web.dev/lighthouse-pwa/)

---

## 📝 Test Results Log

Date: {DATE}
Tester: {NAME}

### DevTools Verification
- [ ] Service Worker: PASS / FAIL
- [ ] Manifest: PASS / FAIL
- [ ] Icons: PASS / FAIL
- [ ] Screenshots: PASS / FAIL

### Install Prompt
- [ ] Dialog appears: YES / NO
- [ ] Install works: YES / NO
- [ ] Don't show works: YES / NO

### Theme Color
- [ ] Light mode: ✓
- [ ] Dark mode: ✓
- [ ] Realtime sync: ✓

### Lighthouse Score
- Score: ____ / 100
- Timestamp: ____

### Notes
- ...
