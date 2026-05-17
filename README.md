# Onyxhawk Cleaning Service — PWA

A Progressive Web App (PWA) for booking cleaning services, built for GitHub Pages deployment.

---

## 🚀 Deploy to GitHub Pages (Step-by-Step)

### Option A — New Repo (Recommended)

1. Go to https://github.com/new
2. Name the repo: `onyxhawks-app`
3. Set it to **Public**, click **Create repository**
4. Upload all files from this folder (drag & drop the files in GitHub's web UI)
5. Go to **Settings → Pages → Source → Deploy from branch → main / root**
6. Your app will be live at:
   `https://shaddie1.github.io/onyxhawks-app/`

### Option B — Using Git CLI

```bash
git init
git add .
git commit -m "Initial Onyxhawk PWA"
git remote add origin https://github.com/shaddie1/onyxhawks-app.git
git push -u origin main
```

Then enable GitHub Pages in repo Settings.

---

## ⚙️ Configuration

Edit the `CONFIG` block at the top of `index.html`:

```javascript
const CONFIG = {
  businessName:  'Onyxhawk Cleaning Service',
  phone:         '+254 700 000 000',   // ← your actual phone number
  whatsapp:      '254700000000',        // ← digits only, no + or spaces
  website:       'https://shaddie1.github.io/onyxhawks-cleaning-service',
  ANTHROPIC_KEY: '',   // ← paste your key for live Hawk AI chat
                       //   get one at https://console.anthropic.com
};
```

**Without an API key**, Hawk AI still works using smart pre-written responses.
**With an API key**, Hawk AI uses Claude for live, intelligent answers.

---

## 📱 Install on Phone (Add to Home Screen)

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **⋮ menu → Add to Home Screen**
3. Done — it installs like a native app

### iPhone (Safari)
1. Open the app URL in Safari (not Chrome)
2. Tap the **Share icon → Add to Home Screen**
3. Done

---

## 📁 File Structure

```
onyxhawk-pwa/
├── index.html        ← Full app (edit CONFIG here)
├── manifest.json     ← PWA manifest (name, icons, theme)
├── sw.js             ← Service worker (offline support)
├── icon.svg          ← App icon (SVG)
├── icons/
│   ├── icon-192.png  ← Home screen icon (Android)
│   └── icon-512.png  ← Splash screen icon
└── README.md         ← This file
```

---

## 🔧 Customise Services & Pricing

In `index.html`, find the `SVCS` array (~line 60) and edit names, descriptions and prices:

```javascript
const SVCS = [
  { id:1, ic:'🏠', name:'Residential', desc:'Homes & apartments', price:'From KES 3,500' },
  // ... add or edit entries here
];
```

---

## 📣 Marketing Tips

- Share the URL on WhatsApp, Instagram bio, and business cards
- The app works offline after first visit (service worker caches everything)
- The WhatsApp button on the confirmation screen sends a pre-filled booking message to your number
- The 15% off promo banner drives first-time bookings

---

Built with React, Anthropic Claude API, and ❤️ by MasterMinds Innovation.
