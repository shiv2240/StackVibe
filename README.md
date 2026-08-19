# StackVibe — Web Technology Fingerprinting & UI Reconstruction Console v2.0

StackVibe is an evidence-first Chrome Extension (Manifest V3) and Web Intelligence Console that inspects any website to instantly identify its full frontend technology graph (React, Next.js, Vue, SvelteKit, Angular, Nuxt, Tailwind CSS, WordPress plugins/themes, Shopify, Analytics trackers, CDN infrastructure), extract computed design forensics (`getdesign.md`), and generate zero-hallucination AI Reconstruction Directives for Claude, GPT-4o, Gemini, Cursor, Lovable, and Manus.

Powered by a Convex Cloud Backend for user authentication and real-time cloud scan synchronization.

---

## Why StackVibe Was Built

### The Problem with Traditional Technology & Design Extractors
1. **Generic AI Prompts**: Most tools extract a few HEX colors and output generic prompts that invent dark themes, hardcode fallbacks (`#4F46E5`, `Inter`, `8px` radius), and tell AI to *"make a modern UI"*. The resulting code looks completely different from the target website.
2. **False Positives & Surface-Level Detection**: Checking `window.React` or CSS classes fails on minified production sites, DevTools-injected hooks, or custom web components (e.g., YouTube's Polymer/Wiz/Shaka Player architecture or Apple's SvelteKit web store).
3. **Missing Component Geometry**: Extracting text colors is useless without knowing header heights, CTA button geometry, hero section column structures, and card surface elevation shadows.

### How StackVibe Solves This
- **Universal Evidence Engine**: Multi-layer scanner inspecting 500 DOM elements, `<script>` bundles, `<link>` stylesheets, meta tags, response headers, and `window` globals with direct evidence lines (`Direct` vs `Inferred`).
- **Zero-Hallucination Policy**: If a property is not detected on the target site, StackVibe outputs `Not detected / Browser default`. It never fabricates fallback colors or fonts.
- **Strict RECONSTRUCTION MODE Prompts**: Directs AI agents to reconstruct the target website faithfully without unsolicited redesigns.
- **Component Geometry Forensics**: Computes actual layout bounds for headers, hero sections, action buttons, card surfaces, all 15+ document layout sections, and 6-level DOM architecture trees.

---

## Key Features & Architecture

### 1. High-Precision Universal Tech Stack Fingerprinting
- **30+ Frameworks, CMS & Infrastructure**: React, Next.js, Vue.js, Nuxt 3, Angular, Svelte/SvelteKit, Polymer, Google Wiz, Shaka Player, Tailwind CSS, Bootstrap, Material UI, Chakra UI, Webflow, Shopify, WordPress (themes & plugins), Google Analytics/GA4, GTM, Mixpanel, Hotjar, Segment, Vercel, Cloudflare, Netlify.
- **Dual-World Execution Engine**: Uses Chrome's `MAIN` world context to inspect real runtime objects (`window.React`, `window.__NEXT_DATA__`, `window.Vue`, `window.webpackChunk`) combined with an `ISOLATED` world computed style extractor.
- **Evidence-Tagged Output**: Every signature records explicit evidence lines (`__NEXT_DATA__`, `/_next/static/`, `__reactFiber$`) and calculates confidence percentages.

### 2. Computed Design Forensics & Geometry (getdesign.md)
- **Semantic Color & Frequency Mapping**: Counts element color frequency and tags semantic usage roles (`canvas-bg`, `surface-bg`, `button-bg`, `header-bg`, `heading-text`).
- **Typography Scale**: Actual computed font families, H1/H2 font sizes & weights, body typography rules, and line heights.
- **Full Sectional Geometry Extractor**: Inspected heights, background colors, text colors, padding, corner radii, and box shadows for headers, hero sections, buttons, card surfaces, footer, forms, and all major layout sections.
- **Page Architecture Tree Graph**: 6-level DOM layout hierarchy tree with pixel bounds and inline **Copy Tree Graph** buttons.

### 3. Evidence-First AI Reconstruction & Profiling Engine
- **Target AI Routing**: Tailored output for Claude, GPT-4o, Gemini, Cursor, Lovable, and Manus.
- **AI Task Selector**: `Reconstruct Website` (Default), `Frontend Tech Profiler & Static Code Analyzer`, `Recreate Selected Component`, `Generate Implementation Prompt`, `Explain Architecture`, `Generate Design Tokens`.
- **Frontend Tech Profiler Directive**: Produces a strict 100% accuracy JSON static code analyzer prompt grouping `frameworks_and_libraries`, `cms`, `plugins_and_themes`, `analytics_and_trackers`, `cdn_and_servers`, `ui_and_styling`, and `confidence_score_percentage`.

### 4. Design Mixer (Inspiration Lab v2.0)
- **Custom Inspiration Links**: Input any domain/URL to add custom design inspiration sources with persistent local storage.
- **6-Criteria Master Directives**: Tailors prompt engineering across `Target Stack`, `Component Scope`, `Visual Direction`, `Interactivity`, `Output Delivery Structure`, and `Custom Constraints`.
- **Live Pattern Synthesis Rationale**: Displays real-time UI explanation cards detailing the architectural rationale behind selected inspiration sources (Stripe, Linear, Vercel, Airbnb, Apple, Framer, etc.).

### 5. Convex Cloud Backend & Snap Library
- Real-time cloud authentication & scan history saving via Convex (`https://oceanic-dolphin-290.convex.cloud`).
- **Snap Library Grid**: Displays saved site snapshots rendered with their actual extracted brand colors and canvas backgrounds.

---

## Repository Structure

```
.
├── manifest.json                 # Chrome Extension Manifest V3 Config (v2.0.0)
├── package.json                  # NPM dependencies (convex)
├── convex.json                   # Convex cloud project configuration
├── PRIVACY_POLICY.md             # Chrome Web Store Privacy & Security Policy
├── PRIVACY_POLICY.txt            # Plain text Privacy Summary
├── CHANGELOG.txt                 # Detailed Version 2.0 Release Notes
├── LICENSE.txt                   # ISC License
├── StackVibe_Chrome_Extension.zip# Distribution ZIP Package
├── convex/                       # Convex Cloud Backend
│   ├── schema.ts                 # Database schema (users, scans)
│   ├── users.ts                  # Auth & user mutations/queries
│   └── scans.ts                  # Scan history mutations/queries
├── popup/                        # Developer Inspection Console Interface
│   ├── popup.html                # Apple-inspired glassmorphic console UI
│   ├── popup.css                 # Dark/Light CSS design system & animations
│   └── popup.js                  # Console state & view controller
├── content/                      # Content Scripts
│   ├── main_world_detector.js    # MAIN world window inspector
│   ├── detector.js               # ISOLATED world DOM scanner
│   └── design_extractor.js       # Geometry & computed style extractor
├── background/                   # Service Worker
│   └── service_worker.js         # Multi-layer fingerprinting runner & tab messaging
├── lib/                          # Core Shared Engine
│   ├── tech_signatures.js        # Technology fingerprint signatures & rules
│   ├── export_engine.js          # Zero-hallucination AI prompt & markdown generator
│   ├── auth.js                   # Auth & cloud storage manager
│   ├── storage.js                # Chrome & local storage wrapper
│   └── convex_client.js          # Convex HTTP API client wrapper
└── ARCHITECTURE.md               # Deep technical specification & AI reference guide
```

---

## Installation & Usage

### 1. Load Chrome Extension Locally
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right toggle.
3. Click **Load unpacked** and select `d:\Freelance\Project-11 (Get UI)`.
4. Pin **StackVibe** to your browser toolbar and click **Inspect Page** on any site!

### 2. Convex Backend Setup
Backend is deployed live at `https://oceanic-dolphin-290.convex.cloud`.  
To run Convex locally or modify schema:
```bash
npx convex dev
```

---

## License & Privacy Policy
ISC License. Refer to `PRIVACY_POLICY.md` for Chrome Web Store privacy compliance details. Built for frontend engineers, UI/UX designers, and AI developers.
