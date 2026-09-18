# Master Headless Contractor PWA

This is the reference deployment package proven with Demo9. The contractor website platform owns **all visible HTML and CSS**. The PWA package supplies installation metadata, service-worker behavior, push subscription logic, and the shared multi-contractor Netlify/Supabase backend.

## Proven Demo9 layout

- Customer page: `https://demo9.myhvacweb.com/app-download`
- Contractor ID: `demo9-hvac`
- Static PWA assets: `/app/`
- Service worker: `/app-sw.js`
- Service-worker scope: `/`
- Manifest start URL: `/app-download`
- Central admin: Netlify `/admin/`

The root service worker is required because the CMS page URL is not a physical upload directory. The supplied service worker does not cache or rewrite the normal website; it is used for push events and notification clicks.

## Contractor website files

Upload:

- `/app/app-pwa.js`
- `/app/app.webmanifest`
- `/app/icon-192.png`
- `/app/icon-512.png`
- `/app-sw.js` at the site root

There is intentionally no contractor `index.html` or `styles.css`.

## HTML hooks

Use `WEBSITE-PLATFORM-SNIPPET.html` as the reference. Available hooks:

- `data-pwa-install` — install/add-to-home-screen action
- `data-pwa-notifications` — enable Web Push
- `data-pwa-label` — recommended child span for dynamic button text
- `data-pwa-notification-status` — optional status text
- `data-pwa-install-help` — optional manual install instructions

When the app is running as an installed PWA, the install button changes to **✓ Added to Home Screen** and becomes disabled. When a valid push subscription exists with notification permission granted, the notification button changes to **✓ Notifications Enabled** and becomes disabled.

Use `data-pwa-label` inside styled buttons so the script changes only the text and leaves Bootstrap glyphicons/custom markup intact.

## Central platform

The `platform/` directory contains the shared Netlify Functions and multi-contractor admin. When updating the existing GitHub project, deploy the **contents** of `platform/` at the repository root; do not create a nested `/platform/` directory.

The production `public/` directory only needs the current `admin/` sender. Old single-contractor demo files such as `public/admin.html`, `public/admin.js`, `public/app.js`, `public/sw.js`, and the old customer demo should not be kept.

Required Netlify environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` (secret)
- `VAPID_SUBJECT`
- `ADMIN_SECRET` (secret)
- `ALLOWED_ORIGINS`
- `ALLOWED_CONTRACTOR_IDS`

For multiple contractors, the final two values are comma-separated lists.

## Per-client changes

1. Create the customer app page in your website platform.
2. Choose a unique contractor ID.
3. Add the website origin and contractor ID to Netlify.
4. Customize the manifest (`name`, `short_name`, `description`, `start_url`, colors).
5. Replace both icons.
6. Add the snippet/config to the CMS page.
7. Test install, push subscription, Supabase row, and a targeted notification from `/admin/`.

## Installed-state note

Installed-state detection is strongest while the customer is using the installed PWA. The script also records successful browser install events when supported. Browsers do not provide one universal API that lets an ordinary webpage reliably enumerate every installed PWA, so a browser tab may not always be able to detect an installation performed manually on every platform.

## Security

Never place `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, or `ADMIN_SECRET` in contractor website code. Those remain server-side in Netlify.
