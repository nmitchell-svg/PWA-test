# Contractor PWA Push Notification Demo

This version adds **real Web Push notifications** to the contractor PWA demo.

## What is included

- Installable PWA
- Customer-facing **Enable Notifications** button
- Service worker push listener
- Supabase table for browser/device subscriptions
- Netlify Function to save subscriptions
- Netlify Function to send push notifications
- Simple contractor admin sender at `/admin.html`
- Stale subscription cleanup for 404/410 push endpoints

---

## 1. Create the Supabase table

Open your Supabase SQL editor and run:

`supabase/push_subscriptions.sql`

The browser never talks directly to Supabase in this demo. Netlify Functions use the Supabase service-role key on the server.

---

## 2. Generate your VAPID keys

On your computer, inside this project folder:

```bash
npm install
npm run generate:vapid
```

Copy the two generated keys.

**Never commit the VAPID private key to Git.**

---

## 3. Add Netlify environment variables

In your Netlify site, add these environment variables and make sure they are available to Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` — example: `mailto:you@yourdomain.com`
- `ADMIN_SECRET` — choose a strong random password

Use `.env.example` as a reference.

After adding/changing environment variables, redeploy the site.

---

## 4. Deploy

Because this demo includes Netlify Functions, deploy it through a Git-connected Netlify site or the Netlify CLI rather than using a static-only drag-and-drop deployment.

The included `netlify.toml` uses:

- Publish folder: `public`
- Functions folder: `netlify/functions`

---

## 5. Test the full flow

### On your phone

1. Open the deployed HTTPS URL.
2. Install the PWA.
3. Open the installed app.
4. Tap **Enable Notifications**.
5. Allow notification permission.

### On your computer

1. Open:
   `https://YOUR-SITE.netlify.app/admin.html`
2. Enter the same value you configured as `ADMIN_SECRET`.
3. Edit the title/message.
4. Click **Send Push Notification**.
5. The subscribed phone should receive the notification.

---

## iPhone

For iPhone/iPad, install the PWA to the Home Screen first:

Safari → Share → Add to Home Screen

Then open the installed Home Screen app and tap **Enable Notifications**.

---

## Customize the contractor

The demo currently uses:

`contractorId = smith-hvac`

Change that in `public/app.js` and in the admin page if you want a different demo company.

You can also update:

- Company name
- Phone number
- Logo/icons
- App colors
- Promotional copy
- Notification copy
- Destination links

---

## Production notes

This is intentionally a small sales/demo implementation.

Before turning it into a multi-contractor production product, add:

- Real contractor authentication instead of one shared `ADMIN_SECRET`
- Contractor/user ownership in the database
- Notification preferences/categories
- Unsubscribe controls
- Rate limiting
- Send history/audit log
- Segmentation
- Scheduled sends
- Consent/privacy copy appropriate for your business
