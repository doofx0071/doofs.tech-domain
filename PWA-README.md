# PWA Implementation Guide

This project includes full Progressive Web App (PWA) support with automatic dark/light mode detection and theme synchronization.

## Features

- **Automatic Theme Detection**: PWA automatically detects and follows system dark/light mode preferences
- **Install Prompt**: Users are prompted to install the app after visiting multiple times
- **Offline Support**: Service worker caches assets and API responses for offline use
- **Update Notifications**: Users are notified when a new version is available
- **App Badging**: Badge API support for showing notification counts (on supported browsers)
- **Dynamic Theme Color**: Browser chrome color updates with theme changes

## Files Added/Modified

### Configuration
- `vite.config.ts` - Added `vite-plugin-pwa` with comprehensive configuration
- `index.html` - Added PWA meta tags, theme-color, and icons
- `tsconfig.json` - Already supports path aliases

### Components
- `src/hooks/usePWA.ts` - Hook for PWA status and install functionality
- `src/components/PWAInstallPrompt.tsx` - Install prompt dialog
- `src/components/PWAUpdatePrompt.tsx` - Service worker update dialog
- `src/lib/pwa-utils.ts` - PWA utility functions (badges, etc.)

### Context Updates
- `src/context/ThemeContext.tsx` - Enhanced to sync theme-color meta tag with PWA

### App Integration
- `src/App.tsx` - Integrated PWA components and added standalone mode detection

### Type Declarations
- `src/vite-env.d.ts` - Added PWA type declarations

### Assets
- `public/pwa/` - Directory containing PWA icons in multiple sizes
- `public/pwa/mask-icon.svg` - Safari pinned tab icon

## PWA Icons

The following icon sizes are used:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Currently using the light mode logo for all icons. For better PWA experience, consider generating proper square icons with padding.

## How It Works

### Theme Synchronization

The PWA automatically synchronizes with the system theme:

1. **ThemeContext** now supports three modes: `light`, `dark`, `system`
2. When theme changes, the `theme-color` meta tag is updated automatically
3. This affects the browser chrome color on mobile devices
4. The manifest is configured with both light and dark theme colors

### Install Prompt

- Shows after 5 seconds of page load (configurable via `delay` prop)
- Tracks dismissals in localStorage (max 3 prompts by default)
- Provides "Don't show again" option
- Uses the system's beforeinstallprompt event

### Service Worker

- **Auto-update**: Service worker checks for updates automatically
- **Runtime caching**: API calls and images are cached with different strategies
- **Offline ready**: Users see a notification when app is ready for offline use
- **Update prompt**: Users are prompted when a new version is available

### App Badging

Use the utility functions in `src/lib/pwa-utils.ts`:

```typescript
import { setAppBadge, clearAppBadge } from "@/lib/pwa-utils";

// Set badge count
setAppBadge(5);

// Clear badge
clearAppBadge();
```

## Usage

### In Components

```tsx
import { usePWA } from "@/hooks/usePWA";

function MyComponent() {
  const { isInstallable, install, isStandalone, needRefresh, updateServiceWorker } = usePWA();

  return (
    <div>
      {isInstallable && (
        <button onClick={install}>Install App</button>
      )}
      {needRefresh && (
        <button onClick={updateServiceWorker}>Update Available</button>
      )}
    </div>
  );
}
```

### Theme Switching

The theme context now supports `system` mode which automatically follows OS preferences:

```tsx
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <button onClick={() => setTheme("system")}>
      Current: {resolvedTheme} (Mode: {theme})
    </button>
  );
}
```

## Testing

### Development
1. Run `npm run dev`
2. Open Chrome DevTools → Application → Service Workers
3. Check "Update on reload" for easier testing
4. Look for "Install" icon in address bar

### Production Build
1. Run `npm run build`
2. Serve the `dist` folder (e.g., `npx serve dist`)
3. Open in browser and look for install prompt
4. Test offline functionality by disconnecting network

### Lighthouse Audit
Run Chrome Lighthouse with PWA category to verify implementation.

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Basic PWA support (no install prompt)
- **Safari (iOS)**: Full support (Add to Home Screen)
- **Safari (macOS)**: Full support (macOS 14+)

## Security Notes

- Service workers only work on HTTPS (except localhost)
- Manifest must be served from same origin
- Icons should be from same origin or properly CORS-enabled
- The app requires HTTPS in production for PWA features

## Customization

### Changing Install Delay
Edit `src/App.tsx`:
```tsx
<PWAInstallPrompt delay={10000} maxPrompts={5} />
```

### Changing Caching Strategy
Edit `vite.config.ts` workbox configuration:
```typescript
runtimeCaching: [
  {
    urlPattern: /your-api/,
    handler: "NetworkFirst", // or "CacheFirst", "StaleWhileRevalidate"
  },
]
```

### Adding Splash Screens
For iOS, add more link tags to `index.html`:
```html
<link rel="apple-touch-startup-image" href="/pwa/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
```

## Known Issues

1. **iOS Theme Color**: Safari on iOS doesn't dynamically update theme-color. Use `apple-mobile-web-app-status-bar-style` instead.
2. **Firefox Install**: Firefox doesn't support the beforeinstallprompt event. Users must manually add to home screen.
3. **Icon Generation**: Currently using same logo for all sizes. Consider using tools like `pwa-asset-generator` for proper icons.

## Resources

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Badging API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API)
