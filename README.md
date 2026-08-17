# StackVibe — Tech Stack & Design Language Extractor

⚡ **StackVibe** is a high-performance Chrome Extension (Manifest V3) and Web Studio that inspects any website to instantly identify its frontend tech stack (React, Next.js, Vue, Tailwind CSS, Bootstrap, etc.) and extract a complete `getdesign.md` style design system spec, tailored AI prompts, Figma tokens, and code editor snippets.

Powered by a **Convex Cloud Backend** for user authentication and cloud scan history synchronization.

---

## 🌟 Key Features

- **⚡ High-Precision Tech Stack Detection**:
  - Detects 20+ frameworks and libraries: React, Next.js, Vue.js, Nuxt.js, Angular, Svelte/SvelteKit, Remix, Astro, Tailwind CSS, Bootstrap, Material UI (MUI), Chakra UI, Styled Components, Webflow, Shopify, WordPress, Framer, Vite, Webpack.
  - **Dual-World Execution Engine**: Uses Chrome's `MAIN` world execution context to access real page JavaScript objects (`window.React`, `window.__NEXT_DATA__`, `window.Vue`, `window.webpackChunk`) even on production minified sites.

- **🎨 Design Language Extractor (`getdesign.md` Inspired)**:
  - **Color Palette Breakdown**: Primary, secondary, accent, background, and surface colors with HEX, HSL, RGB, and visual swatches.
  - **Typography Scale**: Font family hierarchy, H1/H2 font sizes & weights, body typography rules, line heights.
  - **Layout & Spacing Tokens**: Border radius scales (sm, md, lg, pill), box-shadow presets, container max-widths, grid gaps.

- **☁️ Convex Cloud Backend & User Accounts**:
  - Real-time cloud user authentication and scan progress saving using **Convex** (`https://oceanic-dolphin-290.convex.cloud`).
  - Customizable User Roles: Select and update your role (*Frontend Engineer*, *UI/UX Designer*, *Full Stack Developer*, *Backend Engineer*, *Mobile Developer*, *Product Manager*, etc.).

- **📤 Multi-Format Export Suite**:
  1. **getdesign.md Markdown**: Human-readable design language guide.
  2. **AI Prompt Generator**: System & user prompt optimized for Cursor, Claude 3.7, Antigravity, and ChatGPT.
  3. **Figma Tokens JSON**: Compatible with Figma Tokens / Tokens Studio.
  4. **Stitch & Code Editors**: Copy-ready React + Tailwind component blueprints.
  5. **Tailwind Config & CSS Variables**: `tailwind.config.js` extend theme block & `:root` custom properties.

---

## 📁 File Structure

```
.
├── manifest.json                 # Manifest V3 Extension Configuration
├── package.json                  # NPM dependencies (convex)
├── convex.json                   # Convex project config
├── .env                          # Convex cloud deployment credentials
├── StackVibe_Chrome_Extension.zip# Compiled ready-to-upload Extension ZIP
├── convex/                       # Convex Cloud Backend
│   ├── schema.ts                 # Database schema (users, scans)
│   ├── users.ts                  # Auth & user queries/mutations
│   └── scans.ts                  # Scan progress queries/mutations
├── popup/                        # Extension Popup Interface
│   ├── popup.html                # Dark glassmorphic popup UI
│   ├── popup.css                 # Styling & animations
│   └── popup.js                  # Popup interface controller
├── content/                      # Content Scripts
│   ├── main_world_detector.js    # MAIN world window inspector (React/Vue/Next/Webpack)
│   ├── detector.js               # Isolated world fallback scanner
│   └── design_extractor.js       # Computed style & design token extractor
├── background/                   # Background Service Worker
│   └── service_worker.js         # Tab execution runner & messaging
├── lib/                          # Shared Engine Core
│   ├── tech_signatures.js        # Stack detection fingerprints
│   ├── auth.js                   # Auth & storage manager
│   ├── export_engine.js          # Multi-format exporters
│   ├── storage.js                # Chrome & local storage wrapper
│   └── convex_client.js          # Convex HTTP client wrapper
├── test_dashboard/               # In-Browser Web App & Test Studio
│   ├── index.html                # Web App UI
│   ├── styles.css                # Web App stylesheet
│   └── app.js                    # Web App controller & preset scanner
└── ARCHITECTURE.md               # Detailed internal architecture guide for AI & Developers
```

---

## 🚀 Quick Start & Installation

### 1. Load Chrome Extension Locally (Unpacked)
1. Open Google Chrome and go to `chrome://extensions`.
2. Turn ON **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select this directory.
4. Pin **StackVibe** to your toolbar and open it on any website!

### 2. Test in Web Browser Studio
Open [`test_dashboard/index.html`](file:///d:/Freelance/Project-11%20%28Get%20UI%29/test_dashboard/index.html) in your browser to inspect preset sites (Stripe, Next.js, Tailwind, Shopify, Webflow) or custom URLs.

### 3. Convex Cloud Deployment
Convex backend is live deployed at `https://oceanic-dolphin-290.convex.cloud`.  
To modify or deploy new Convex functions:
```bash
npx convex dev
```

---

## 📜 License
ISC License. Built for modern web engineers & UI designers.
