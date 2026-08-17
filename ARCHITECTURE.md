# StackVibe — Internal Architecture & Engineering Specification

> **AI Context Reference**: This document provides a complete technical explanation of **StackVibe**'s internal architecture, data pipeline, dual-world detection engine, component geometry extractor, zero-hallucination prompt generator, and Convex cloud integration. Share this document directly with any AI agent (Claude, Cursor, Antigravity, ChatGPT) for full codebase context.

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
4. Output: Array of technology objects with confidence percentages, category tags, and explicit evidence lines.

Phase 2: ISOLATED World Execution (Computed Style & Geometry Extractor)
-------------------------------------------------------------------------
Background SW invokes:
chrome.scripting.executeScript({
  target: { tabId },
  files: ["content/design_extractor.js"]
})

1. Computes DOM styles via window.getComputedStyle().
2. Samples page elements to build a semantic color frequency map (canvas-bg, surface-bg, button-bg, header-bg, heading-text).
3. Extracts component geometry (Header height/position, Hero split, Button heights/radii, Card elevation shadows).
4. Output: Complete designSpec JSON object.
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
| **Polymer / Google Wiz** | `window.Polymer`, `wiz-` attributes, custom element definitions (`customElements.get()`) | +50% | `Direct` |
| **Shaka Player** | `window.shaka`, HTML5 `<video>` DASH/HLS player instances | +45% | `Direct` |
| **Tailwind CSS** | Standard utility class patterns (`flex`, `grid`, `bg-`, `text-`, `rounded-`, `shadow-`), `@media` breakpoints | +40% | `Inferred` |

### Direct vs. Inferred Tagging Logic
- **Direct**: Flagged when runtime global objects (`window.Next.js`, `__NEXT_DATA__`) or exact DOM Fiber properties (`__reactFiber$`) are verified.
- **Inferred**: Flagged when a secondary technology is deduced via architectural dependency (e.g., `Next.js` direct detection implies `React` inferred detection).

---

## 4. DOM Component Geometry & Structural Forensics Engine (`content/design_extractor.js`)

`content/design_extractor.js` performs DOM style and spatial geometry extraction across the DOM tree:

### 1. Semantic Color Analysis & Frequency Count
- Samples up to 150 page elements.
- Records color occurrence frequency and assigns semantic usage roles:
  - `canvas-bg`: Main document canvas color
  - `surface-bg`: Card or section container background
  - `button-bg`: Action element background color
  - `header-bg`: Navigation container color
  - `heading-text`: H1-H3 text color
- Calculates document lightness mode (`isLightMode: true/false`).

### 2. Component Geometry Extraction
- **Header & Navigation**: Height, positioning (`sticky`, `fixed`, `relative`), background color, bottom border, nav link count.
- **Hero Section**: Column layout geometry (`Two-Column Split` vs `Single Column Flow`), heading text preview, primary CTA button text.
- **Action Buttons**: Exact computed height, background color, text color, font weight, font size, padding, and corner radius.
- **Card Surfaces**: Background color, corner radius, border, and elevation shadow.

### 3. Page Structure Architecture Tree
Generates a structural layout hierarchy tree representing the page:
`DOCUMENT` -> `HEADER` -> `HERO` -> `COMPONENTS` -> `FOOTER`

---

## 5. Zero-Hallucination AI Export Engine (`lib/export_engine.js`)

### Engineering Directives & Rules
1. **Zero Hallucination Policy**:
   - The exporter **never** injects hardcoded fallbacks (`#4F46E5`, `#10B981`, `Inter`, `8px` radius).
   - If a property was un-detected on the target page, the exporter explicitly outputs `Not detected / Browser default`.

2. **Implementation Strategy Resolver (`resolveImplementation`)**:
   Automatically matches the target website's detected framework:
   - **Next.js** -> `Next.js App Router (TypeScript) + React + Tailwind CSS / CSS Modules`
   - **Nuxt** -> `Nuxt 3 (TypeScript) + Vue.js 3 + Scoped CSS`
   - **Svelte / SvelteKit** -> `SvelteKit (TypeScript) + Svelte + CSS`
   - **Angular** -> `Angular (TypeScript) + SCSS`
   - **Default** -> `Semantic HTML5 + Modern CSS3 + Vanilla JavaScript`

3. **RECONSTRUCTION MODE Prompts**:
   Instructs AI agents with strict reconstruction laws:
   - *This is a RECONSTRUCTION task, NOT a creative redesign.*
   - *Do NOT redesign or "modernize" the interface.*
   - *Do NOT introduce arbitrary dark/light themes that differ from extracted evidence.*
   - *Preserve extracted layout hierarchy, component density, and component proportions.*

4. **INSPIRE MODE Prompts (Design Mixer)**:
   Generates prompts for creative design blending (e.g. Hero from Stripe + Nav from Linear + Buttons from Vercel + Cards from Airbnb).

---

## 6. Convex Cloud Backend Architecture (`convex/` & `lib/convex_client.js`)

StackVibe connects to a **Convex Cloud Backend** (`https://oceanic-dolphin-290.convex.cloud`).

### Database Schema (`convex/schema.ts`):
```typescript
// users table
users: defineTable({
  name: v.string(),
  email: v.string(),
  passwordHash: v.string(),
  role: v.optional(v.string()), // e.g. "Frontend Engineer", "UI/UX Designer"
  avatar: v.string(),
  createdAt: v.number(),
}).index("by_email", ["email"])

// scans table
scans: defineTable({
  userId: v.string(),
  url: v.string(),
  title: v.string(),
  techStack: v.any(),
  designSpec: v.any(),
  timestamp: v.number(),
}).index("by_user", ["userId"])
```

### Convex HTTP Client Wrapper (`lib/convex_client.js`):
Communicates with Convex HTTP query and mutation endpoints (`/api/query`, `/api/mutation`) directly from the extension popup or web dashboard without requiring heavy node runtime dependencies.

---

## 7. How an AI Agent Should Extend StackVibe

When extending this codebase:
- **To add a new Technology Signature**: Add an entry to `TECH_SIGNATURES` in `lib/tech_signatures.js` with `id`, `name`, `category`, `icon`, `color`, `description`, and a detection function.
- **To add a new AI Export Target or Format**: Add a target handler to `toAIPromptForTarget` or add a new static method in `lib/export_engine.js`.
- **To modify UI Components or Styling**: Update `popup/popup.html`, `popup/popup.css`, and `popup/popup.js`.
