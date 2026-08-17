# StackVibe — Internal Architecture & AI System Specification

> **AI Context Reference**: This document provides a complete technical explanation of how **StackVibe** operates internally. Share this file directly with any AI model (Claude, Cursor, Antigravity, ChatGPT) to give it full context on the architecture, data flow, detection algorithms, and cloud integration.

---

## 1. System Overview & Core Architecture

StackVibe is built as a Chrome Extension (Manifest V3) paired with an interactive Web Studio and a Convex Cloud backend.

```
+-----------------------------------------------------------------------------------+
|                                STACKVIBE PLATFORM                                 |
+-----------------------------------------------------------------------------------+
|  [Chrome Extension Popup]  <--->  [Background Service Worker] <---> [Convex Cloud] |
|        |                                    |                                     |
|        v                                    v                                     |
|  [Popup UI Tabs]                 [scripting.executeScript]                        |
|  - Stack Breakdown                1. MAIN World Execution (Window Inspector)      |
|  - Design Spec (getdesign.md)     2. ISOLATED World Execution (Computed Styles)   |
|  - AI Prompt Builder                        |                                     |
|  - Figma/Stitch Exporters                   v                                     |
|  - Auth & User Roles              [Active Tab DOM Context]                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Dual-World Execution Architecture (Manifest V3)

### The Chrome Security Challenge
In Chrome Manifest V3, standard content scripts run inside an **Isolated Sandbox World**. Global JavaScript variables created by the target web page (such as `window.React`, `window.__NEXT_DATA__`, `window.Vue`, `window.webpackChunk`) are hidden from isolated content scripts.

### The Solution: Dual-World Inline Function Injection Flow
To bypass this limitation, StackVibe uses an inline execution pipeline managed by `background/service_worker.js`:

```
Phase 1: MAIN World Execution (Confidence Scanner)
--------------------------------------------------
Background SW calls:
chrome.scripting.executeScript({
  target: { tabId },
  world: "MAIN",
  func: mainWorldConfidenceScanner
})

=> Executes directly inside target page's real window scope.
=> Reads window.React, window.__NEXT_DATA__, window.Vue, window.webpackChunk,
   and dynamic React Fiber properties (__reactFiber$*, __reactProps$*) across high-probability elements.
=> Returns: Array of detected tech objects [{ id, name, category, icon, color, description, confidence }] directly via results[0].result.

Phase 2: ISOLATED World Execution (Design Spec Extractor)
---------------------------------------------------------
Background SW calls:
chrome.scripting.executeScript({
  target: { tabId },
  files: ["content/design_extractor.js"]
})

=> Executes in ISOLATED world to compute DOM styles via window.getComputedStyle().
=> Extracts: Colors (HEX, HSL, RGB), Typography hierarchy, Border radii, Box shadows, Container bounds.
=> Returns: Complete designSpec JSON object.
```

---

## 3. Confidence & Weighted Scoring Fingerprinting Engine (`lib/tech_signatures.js` & `background/service_worker.js`)

Instead of binary single-point detectors (which miss bundled production frameworks), StackVibe uses a **Weighted Confidence Scoring Engine**:

### React Detection Signals:
- **React Fiber / Props Property** on DOM elements (`Object.keys(el).some(k => k.startsWith("__reactFiber$") || ...)`): **+5 Confidence**
- **Next.js Asset / Data Detection** (`_next/static`, `__NEXT_DATA__`): **+5 Confidence**
- **React Window Scope / Devtools Hook** (`window.React`, `window.__REACT_DEVTOOLS_GLOBAL_HOOK__`): **+4 Confidence**
- **React DOM Root / Attribute Markers** (`[data-reactroot]`, `[data-reactid]`): **+4 Confidence**
- **Script Tag Bundle Source Regex** (`react.production.min.js`, `chunks/framework`): **+3 Confidence**

> **Threshold**: If total `reactScore >= 3`, React is flagged as **Detected**.

---

## 4. Where AI Enhances StackVibe

StackVibe uses **deterministic fingerprinting** for 100% reliable framework identification, reserving AI for high-value synthesis:

```
Website -> Deterministic Engine -> Extracted Design Spec & Stack -> AI Layer -> getdesign.md / AI Prompts / Code Generation
```

---

## 5. Design Language Extraction Engine (`content/design_extractor.js`)

Extracts design tokens directly from computed styles of key visible DOM elements (`body`, `h1-h6`, `button`, `a`, `card`, `main`, `container`).

### Extracted Spec Data Model:
```typescript
interface DesignSpec {
  background: string;         // HEX string e.g. "#0F172A"
  surfaceColor: string;       // Card background e.g. "#1E293B"
  textColor: string;          // Main text e.g. "#F8FAFC"
  colors: Array<{
    hex: string;              // "#6366F1"
    hsl: string;              // "hsl(239, 84%, 67%)"
    role: string;             // "Primary Accent" | "Main Background" | "Surface"
  }>;
  typography: {
    fontFamily: string;       // "Inter, -apple-system, sans-serif"
    h1Size: string;           // "36px"
    h1Weight: string;         // "700"
    bodySize: string;         // "16px"
    bodyWeight: string;       // "400"
  };
  radius: {
    sm: string;               // "4px"
    md: string;               // "8px"
    lg: string;               // "16px"
  };
  shadows: string[];          // Box shadow CSS strings
  spacing: {
    containerWidth: string;   // "1280px"
    containerPadding: string; // "24px"
    gridGap: string;          // "24px"
  };
}
```

---

## 5. Multi-Format Exporter System (`lib/export_engine.js`)

Converts the raw `techStack` and `designSpec` into five output formats:

1. **getdesign.md Markdown Format**: Structured design guide containing color tables, typography scale, component blueprints (Buttons, Cards, Inputs), and layout rules.
2. **AI Prompt Builder**: Formatted prompt ready to copy/paste into LLMs (Cursor, Claude 3.7, Antigravity, ChatGPT) specifying exact tech choices, HEX colors, fonts, and radii.
3. **Figma Tokens Studio JSON**: W3C design tokens JSON schema importable into Figma Tokens Studio.
4. **Stitch / Code Editor**: Self-contained React + Tailwind component snippet featuring extracted colors and responsive bounds.
5. **Tailwind Config & CSS Variables**: `tailwind.config.js` extend theme block & `:root` custom properties.

---

## 6. Convex Cloud Backend Architecture (`convex/`)

Convex backend deployment at `https://oceanic-dolphin-290.convex.cloud`.

### Database Schema (`convex/schema.ts`):
- `users` table (indexed by `email`): Stores `name`, `email`, `passwordHash`, `role`, `avatar`, `createdAt`.
- `scans` table (indexed by `userId`): Stores `userId`, `url`, `title`, `techStack`, `designSpec`, `timestamp`.

### Mutations & Queries:
- `convex/users.ts`: `register`, `login`, `getUserByEmail`.
- `convex/scans.ts`: `saveScan`, `getScansByUser`, `deleteScan`, `clearAllScans`.

### Convex HTTP Client (`lib/convex_client.js`):
Communicates with Convex HTTP mutations & queries (`/api/mutation`, `/api/query`) directly from the extension popup or web dashboard without requiring heavy npm bundles at runtime.

---

## 7. How an AI Can Extend StackVibe

When working on or extending this project, an AI can follow these patterns:
- **To add a new Tech Signature**: Add an object to `TECH_SIGNATURES` in `lib/tech_signatures.js` with `id`, `name`, `category`, `icon`, `color`, `description`, and a `detect: (win, doc) => boolean` function.
- **To add a new Export Format**: Add a static method to `ExportEngine` in `lib/export_engine.js`.
- **To add a new Convex Table or Query**: Add the table definition in `convex/schema.ts` and export the query/mutation in `convex/`.
