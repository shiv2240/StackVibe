# StackVibe — Internal Architecture & Engineering Specification v2.0

> **AI Context Reference**: This document provides a complete technical explanation of **StackVibe**'s internal architecture, data pipeline, dual-world detection engine, component geometry extractor, zero-hallucination prompt generator, Design Mixer Inspiration Lab, and Convex cloud integration. Share this document directly with any AI agent (Claude, Cursor, Antigravity, ChatGPT) for full codebase context.

---

## 1. Executive Summary & Core Engineering Philosophy

StackVibe is designed as a **Developer Web Inspection & Reconstruction Console**. Unlike basic design tools that extract static hex codes or guess tech stacks from single CSS classes, StackVibe operates as a **forensic web intelligence pipeline**:

```text
                                TARGET WEBPAGE
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
   MAIN WORLD INSPECTION                           ISOLATED WORLD SCAN
   (Window Globals, React Fibers,                  (DOM Geometry, Computed
    Bundles, Script Signatures)                     Styles, Semantic Roles)
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                         MULTI-LAYER EVIDENCE GRAPH
                         (Direct vs Inferred Tagging)
                                      │
                        ZERO-HALLUCINATION EXPORTER
                 (RECONSTRUCTION MODE vs INSPIRE MODE)
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
     AI RECONSTRUCTION DIRECTIVE                    CONVEX CLOUD SYNC
   (Claude, GPT-4o, Cursor, Lovable)              (Scans, User Accounts)
```

---

## 2. Dual-World Execution Pipeline (Chrome MV3)

### Why Dual-World Execution Is Mandatory
In Chrome Extension Manifest V3, standard content scripts run inside an **Isolated Sandbox World**. Global JavaScript variables created by the target web page (e.g., `window.React`, `window.__NEXT_DATA__`, `window.Vue`, `window.webpackChunk`, `window.Polymer`, `window.Shaka`) are invisible to isolated content scripts. 

Furthermore, browser extensions like React DevTools inject `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` on *every* page, causing naive detectors to falsely report React on non-React websites (e.g. YouTube or Apple Store).

### How StackVibe Solves This
StackVibe uses a two-phase inline execution pipeline managed by `background/service_worker.js`:

```text
Phase 1: MAIN World Execution (Window & Fiber Inspector)
--------------------------------------------------------
Background SW invokes:
chrome.scripting.executeScript({
  target: { tabId },
  world: "MAIN",
  func: mainWorldConfidenceScanner
})

1. Scope Serialization Safety: Self-contains all helper functions within mainWorldConfidenceScanner to prevent MV3 serialization ReferenceErrors.
2. DevTools Bypassing: Verifies renderers.size > 0 or checks real DOM Fiber properties (__reactFiber$*, __reactProps$*) on page elements.
3. Multi-Layer Signals: Inspects 500 DOM elements, window global objects, <script src> paths, <link href> stylesheets, and meta tags.
4. Output: Array of technology objects with confidence percentages, category tags, WordPress plugins/themes, Shopify assets, analytics trackers, CDN infrastructure, and explicit evidence lines.

Phase 2: ISOLATED World Execution (Computed Style & Geometry Extractor)
-------------------------------------------------------------------------
Background SW invokes:
chrome.scripting.executeScript({
  target: { tabId },
  files: ["content/design_extractor.js"]
})

1. Computes DOM styles via window.getComputedStyle().
2. Samples page elements to build a semantic color frequency map (canvas-bg, surface-bg, button-bg, header-bg, heading-text).
3. Extracts component geometry (Header height/position, Hero split, Button heights/radii, Card elevation shadows, Footer links/columns, Form containers, 15+ Layout Sections).
4. Unconstrained 6-Level DOM Architecture Tree: Computes spatial bounding boxes (rect.width × rect.height) and element statistics.
5. Output: Complete designSpec JSON object.
```

---

## 3. Universal Fingerprinting & Evidence Graph Engine

StackVibe uses a **weighted multi-signal scoring engine** defined in `lib/tech_signatures.js` and `background/service_worker.js`:

### Multi-Layer Signal Rules:

| Technology | Inspected Signals & Evidence Criteria | Weight | Detection Tag |
| :--- | :--- | :--- | :--- |
| **Next.js** | `__NEXT_DATA__` window object, `/_next/static/` script paths, `#__next` root element | +55% | `Direct` |
| **React** | Real DOM Fiber keys (`__reactFiber$`, `__reactProps$`), `React.version`, `[data-reactroot]` | +45% | `Direct` / `Inferred` |
| **Nuxt 3** | `__NUXT__` window object, `/_nuxt/` bundle paths, `#__nuxt` container | +55% | `Direct` |
| **Vue.js** | `__VUE__` window flag, `__vue_app__` DOM key, `data-v-*` scoping attributes | +45% | `Direct` |
| **Svelte / SvelteKit** | `__svelte` window key, `svelte-` CSS class prefix, `/_app/immutable/` bundle paths | +50% | `Direct` |
| **Angular** | `ng-version` attribute, `window.ng`, `ng-` component prefixes | +50% | `Direct` |
| **WordPress & Plugins** | `/wp-content/themes/[name]/`, `/wp-content/plugins/[name]/`, `wp-emoji` | +55% | `Direct` |
| **Shopify** | `window.Shopify`, `Shopify.shop`, `cdn.shopify.com` asset URLs | +55% | `Direct` |
| **Analytics & Trackers** | Google Analytics/GA4 (`window.gtag`, `google-analytics.com`), GTM, Mixpanel, Hotjar, Segment | +50% | `Direct` |
| **CDN & Infrastructure** | `Via` / `Server` headers, `vercel.com`, `cloudflare.com`, `netlify.com` | +45% | `Direct` |

---

## 4. DOM Component Geometry & Structural Forensics Engine (`content/design_extractor.js`)

`content/design_extractor.js` performs DOM style and spatial geometry extraction across the entire document tree:

### 1. Semantic Color Analysis & Frequency Count
- Samples up to 150 page elements.
- Records color occurrence frequency and assigns semantic usage roles: `canvas-bg`, `surface-bg`, `button-bg`, `header-bg`, `heading-text`.
- Calculates document lightness mode (`isLightMode: true/false`).

### 2. Full Sectional Component Geometry Extraction
- **Header & Navigation**: Height, positioning (`sticky`, `fixed`, `relative`), background color, bottom border, nav link count.
- **Hero Section**: Column layout geometry (`Two-Column Split` vs `Single Column Flow`), heading text preview, subheading, CTA button text.
- **All Document Layout Sections**: Scans up to 15+ sections, classifying semantic role (`Hero Banner`, `Feature Showcase Grid`, `Pricing Table`, `Testimonials`, `FAQ Accordion`, `CTA Banner`, `Metrics Grid`, `Media Showcase`, `Interactive Form`), column reflow, padding, and geometry.
- **Action Buttons & Surface Cards**: Up to 10 distinct action buttons and 10 surface cards.
- **Footer Navigation & Forms**: Footer columns, link counts, copyright text, form inputs, and submit button CTAs.

### 3. Page Architecture Tree Graph & Copy Controls
- Generates an unconstrained 6-level layout hierarchy tree representing the page structure.
- Renders root element tags, IDs, class names, heading previews, pixel dimensions (`1280×400px`), and statistics.
- Includes panel header **Copy Tree Graph** and inline **Copy Tree** buttons for clipboard export.

---

## 5. Zero-Hallucination AI Export Engine & Design Mixer (`lib/export_engine.js`)

### 1. Zero Hallucination Policy
- The exporter **never** injects hardcoded fallbacks (`#4F46E5`, `#10B981`, `Inter`, `8px` radius).
- If a property was un-detected on the target page, the exporter explicitly outputs `Not detected / Browser default`.

### 2. Frontend Technology Profiler Directive
Generates a strict 100% accuracy JSON static code analyzer prompt outputting:
```json
{
  "frameworks_and_libraries": [],
  "cms": [],
  "plugins_and_themes": [],
  "analytics_and_trackers": [],
  "cdn_and_servers": [],
  "ui_and_styling": [],
  "confidence_score_percentage": 0
}
```

### 3. Design Mixer — Inspiration Lab v2.0
- **Custom Links Storage**: Enables adding custom URL/domains with persistent local storage.
- **6-Criteria Master Directives**: Prompts configured across `Target Stack`, `Component Scope`, `Visual Direction`, `Interactivity Level`, `Output Format`, and `Custom Constraints`.
- **Pattern Knowledge Dictionary & Rationale**: Built-in design pattern dictionary for top sites (Stripe, Linear, Vercel, Airbnb, Apple, Framer, Notion, Spotify) with live UI rationale cards.

---

## 6. Security & Manifest V3 Compliance

- Complies strictly with Chrome Extension Manifest V3 Content Security Policy (`script-src 'self'`).
- Contains zero inline script execution in HTML (`popup.html`).
- Implements strict data privacy policies (`PRIVACY_POLICY.md`).

---

## 7. Convex Cloud Backend Architecture (`convex/` & `lib/convex_client.js`)

Communicates with Convex HTTP query and mutation endpoints (`/api/query`, `/api/mutation`) live at `https://oceanic-dolphin-290.convex.cloud` for real-time authentication and Snap Library cloud synchronization.
