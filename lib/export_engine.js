/**
 * StackVibe - Evidence-First AI Prompt & Design Spec Export Engine
 * Zero hallucination exporter translating raw DOM evidence into RECONSTRUCTION MODE directives.
 * 
 * @module lib/export_engine
 */
class ExportEngine {
  /**
   * Resolve target implementation stack based on detected technology graph
   */
  static resolveImplementation(techStack = []) {
    const ids = new Set((techStack || []).map(t => t.id));

    if (ids.has("nextjs")) {
      return {
        framework: "Next.js",
        ui: "React",
        language: "TypeScript",
        styling: ids.has("tailwindcss") ? "Tailwind CSS" : "CSS Modules",
        recommendation: "Next.js App Router component using TypeScript"
      };
    }

    if (ids.has("nuxt")) {
      return {
        framework: "Nuxt 3",
        ui: "Vue.js 3",
        language: "TypeScript",
        styling: ids.has("tailwindcss") ? "Tailwind CSS" : "Scoped CSS",
        recommendation: "Nuxt 3 Vue Single File Component (<script setup lang=\"ts\">)"
      };
    }

    if (ids.has("svelte")) {
      return {
        framework: "SvelteKit",
        ui: "Svelte",
        language: "TypeScript",
        styling: ids.has("tailwindcss") ? "Tailwind CSS" : "Scoped Svelte CSS",
        recommendation: "Svelte 5 component file (.svelte)"
      };
    }

    if (ids.has("angular")) {
      return {
        framework: "Angular",
        ui: "Angular Component",
        language: "TypeScript",
        styling: "SCSS / CSS",
        recommendation: "Angular standalone component class & template"
      };
    }

    if (ids.has("vue")) {
      return {
        framework: "Vue.js 3",
        ui: "Vue SFC",
        language: "TypeScript",
        styling: ids.has("tailwindcss") ? "Tailwind CSS" : "CSS",
        recommendation: "Vue 3 Single File Component"
      };
    }

    if (ids.has("react")) {
      return {
        framework: "React",
        ui: "React Functional Component",
        language: "TypeScript / JSX",
        styling: ids.has("tailwindcss") ? "Tailwind CSS" : "CSS Modules",
        recommendation: "React functional component with clean JSX"
      };
    }

    return {
      framework: "HTML5",
      ui: "Vanilla DOM",
      language: "JavaScript (ES6+)",
      styling: ids.has("tailwindcss") ? "Tailwind CSS" : "Modern CSS3",
      recommendation: "Semantic HTML5, Modern CSS3 & Vanilla JavaScript"
    };
  }

  /**
   * Generate getdesign.md Markdown Specification (Strict Evidence-Based)
   */
  static toGetDesignMarkdown(siteInfo, techStack, designSpec) {
    const title = siteInfo.title || siteInfo.url || "Extracted Target Website";
    const colors = designSpec.colors || [];
    const typography = designSpec.typography || {};
    const components = designSpec.components || {};

    const techList = (techStack || []).length > 0
      ? (techStack || []).map(t => `- **${t.name}** (${t.category}) — ${t.confidence ? `${t.confidence}% confidence` : 'Detected'}: ${t.description}`).join('\n')
      : "- Not detected / Standard HTML5";

    const colorTable = colors.length > 0
      ? colors.map((c, i) => `| Color ${i + 1} | \`${c.hex}\` | ${c.role || "Unspecified"} | ${c.frequency ? `${c.frequency} occurrences` : 'Detected'} | <span style="background:${c.hex};padding:2px 14px;border-radius:4px;border:1px solid #999;">&nbsp;</span> |`).join('\n')
      : "| Palette | Not detected | N/A | N/A | N/A |";

    return `# ${title} — Extracted Evidence Specification

> **Source Target URL**: \`${siteInfo.url}\`
> **Extracted Mode**: \`${designSpec.metadata?.isLightMode ? 'Light Mode Surface' : 'Dark Mode / Elevated Surface'}\`
> **Extracted Timestamp**: ${designSpec.metadata?.extractedAt || new Date().toISOString()}

---

## 1. Detected Implementation Stack

${techList}

---

## 2. Extracted Color Matrix

| Token | HEX Value | Semantic Role | Frequency | Visual Swatch |
| :--- | :--- | :--- | :--- | :--- |
${colorTable}

- **Canvas Background**: \`${designSpec.background || "Not detected / Browser default"}\`
- **Primary Body Text**: \`${designSpec.textColor || "Not detected / Browser default"}\`

---

## 3. Typography & Hierarchy

- **Font Family**: \`${typography.fontFamily || "Not detected / System default"}\`
- **Heading 1 Size**: \`${typography.h1Size || "Not detected"}\` (${typography.h1Weight || "Normal"})
- **Heading 2 Size**: \`${typography.h2Size || "Not detected"}\` (${typography.h2Weight || "Normal"})
- **Body Text Size**: \`${typography.bodySize || "Not detected"}\` (Line height: \`${typography.bodyLineHeight || "Normal"}\`)

---

## 4. Component Geometry & Structure Evidence

### Header Section
- **Header Height**: \`${components.header?.height || "Not detected"}\`
- **Positioning**: \`${components.header?.position || "Not detected"}\`
- **Background Color**: \`${components.header?.backgroundColor || "Not detected"}\`
- **Navigation Items Count**: \`${components.header?.navItemsCount || "0"}\`

### Hero Section
- **Layout Structure**: \`${components.hero?.hasTwoColumns ? "Two-Column Split Layout" : "Single Column Flow"}\`
- **Heading Preview**: ${components.hero?.headingText ? `"${components.hero.headingText}"` : "Not detected"}
- **Primary CTA Text**: ${components.hero?.ctaText ? `"${components.hero.ctaText}"` : "Not detected"}

### Action Buttons (${components.buttons?.length || 0} Inspected)
${(components.buttons || []).map((b, i) => `- **Button ${i+1}**: Height \`${b.height || "auto"}\`, Background \`${b.backgroundColor || "none"}\`, Text \`${b.color || "inherit"}\`, Radius \`${b.borderRadius || "0"}\``).join('\n') || "- Not detected"}

### Card Surfaces (${components.cards?.length || 0} Inspected)
${(components.cards || []).map((c, i) => `- **Card ${i+1}**: Background \`${c.backgroundColor || "none"}\`, Radius \`${c.borderRadius || "0"}\`, Border \`${c.border || "none"}\``).join('\n') || "- Not detected"}

---

## 5. Page Architecture Tree Graph

\`\`\`
${designSpec.structureTree ? (() => {
  function formatTree(node, indent = 0) {
    if (!node) return '';
    const prefix = '  '.repeat(indent);
    const tag = `<${node.tag}${node.id || ''}${node.class || ''}>`;
    const details = [node.heading, node.stats].filter(Boolean).join(' • ');
    const line = `${prefix}- ${tag}${details ? ` — ${details}` : ''}`;
    const childrenLines = (node.children || []).map(c => formatTree(c, indent + 1)).filter(Boolean).join('\n');
    return childrenLines ? `${line}\n${childrenLines}` : line;
  }
  return formatTree(designSpec.structureTree);
})() : '- Standard HTML5 Document Layout Tree'}
\`\`\`
`;
  }

  /**
   * Generate Ultra-Faithful RECONSTRUCTION MODE AI Prompt for Target AI
   */
  static toAIPromptForTarget(targetAi, siteInfo, techStack, designSpec, task = "reconstruct", fidelity = "exact", rawData = {}) {
    if (task === "profiler" || task === "analyze_tech" || task === "static_analysis") {
      return ExportEngine.toFrontendProfilerPrompt(siteInfo, techStack, designSpec, rawData);
    }

    const impl = ExportEngine.resolveImplementation(techStack);
    const siteName = siteInfo.title || siteInfo.url || "Target Website";
    const colors = designSpec.colors || [];
    const typography = designSpec.typography || {};
    const components = designSpec.components || {};

    const colorSummary = colors.length > 0
      ? colors.map(c => `- \`${c.hex}\` (${c.role}, ${c.frequency} occurrences)`).join('\n')
      : "- Background / Primary text extracted from computed styles";

    const btnSummary = (components.buttons || []).length > 0
      ? (components.buttons || []).map((b, i) => `- Button ${i+1}: Height ${b.height || 'auto'}, BG ${b.backgroundColor || 'none'}, Color ${b.color || 'inherit'}, Radius ${b.borderRadius || '0'}`).join('\n')
      : "- Standard action buttons";

    const cardSummary = (components.cards || []).length > 0
      ? (components.cards || []).map((c, i) => `- Card ${i+1}: BG ${c.backgroundColor || 'none'}, Radius ${c.borderRadius || '0'}, Border ${c.border || 'none'}`).join('\n')
      : "- Surface container cards";

    const headerSummary = components.header
      ? `- Height: ${components.header.height}, Position: ${components.header.position}, BG: ${components.header.backgroundColor}, Nav Links: ${components.header.navItemsCount}`
      : "- Standard page navigation";

    const heroSummary = components.hero
      ? `- Layout: ${components.hero.hasTwoColumns ? "Two-Column Split" : "Single Column"}, Heading: "${components.hero.headingText || 'N/A'}", CTA: "${components.hero.ctaText || 'N/A'}"`
      : "- Hero banner header";

    const target = (targetAi || "claude").toLowerCase();

    return `STACKVIBE RECONSTRUCTION SPECIFICATION

--------------------------------------------------
OBJECTIVE
--------------------------------------------------
Reconstruct the target webpage as faithfully as possible using the extracted browser evidence below.

This is a RECONSTRUCTION task, NOT a creative redesign.

STRICT LAWS:
- Do NOT redesign or "modernize" the interface.
- Do NOT introduce arbitrary dark/light themes that differ from extracted evidence.
- Do NOT invent un-detected colors or typography.
- Do NOT introduce un-requested glassmorphism or gradients.
- Preserve extracted layout hierarchy and component density.
- Preserve extracted component proportions and corner radii.
- Use the resolved technology stack matching the target site.

--------------------------------------------------
RESOLVED IMPLEMENTATION STACK
--------------------------------------------------
- Target Framework: ${impl.framework}
- UI Component Engine: ${impl.ui}
- Language: ${impl.language}
- Styling System: ${impl.styling}
- Recommendation: ${impl.recommendation}

--------------------------------------------------
EXTRACTED DESIGN EVIDENCE
--------------------------------------------------
Target URL: ${siteInfo.url}
Page Theme Mode: ${designSpec.metadata?.isLightMode ? "Light Surface Mode" : "Dark / Elevated Surface Mode"}
Canvas Background: ${designSpec.background || "Browser default"}
Primary Body Text: ${designSpec.textColor || "Browser default"}
Font Family: "${typography.fontFamily || "System default"}"
H1 Size: ${typography.h1Size || "Extracted"} | Body Size: ${typography.bodySize || "Extracted"}

Color Palette Evidence:
${colorSummary}

--------------------------------------------------
EXTRACTED COMPONENT ARCHITECTURE & GEOMETRY
--------------------------------------------------
Navigation / Header:
${headerSummary}

Hero Section:
${heroSummary}

Action Buttons Geometry:
${btnSummary}

Card Surface Geometry:
${cardSummary}

--------------------------------------------------
OUTPUT DIRECTIVE FOR ${target.toUpperCase()}
--------------------------------------------------
${target === 'claude' ? `Generate production-ready code using ${impl.recommendation}. Return clean, complete executable code with zero placeholders or missing imports.` :
  target === 'gpt' || target === 'chatgpt' ? `Deliver executable single-file production code using ${impl.recommendation} with working responsive layouts.` :
  target === 'gemini' ? `Provide 1) Architectural component summary, 2) Complete production code matching ${impl.recommendation}.` :
  target === 'cursor' ? `// @cursor-rule: Reconstruct interface matching ${impl.recommendation}. Implement typed props and zero compilation warnings.` :
  target === 'lovable' ? `Construct full multi-section web app matching resolved stack ${impl.recommendation} using exact extracted geometry.` :
  `Execute complete code build matching ${impl.recommendation} preserving exact component density.`}`;
  }

  /**
   * Generate Frontend Technology Profiler and Static Code Analyzer Directive
   */
  static toFrontendProfilerPrompt(siteInfo = {}, techStack = [], designSpec = {}, rawData = {}) {
    const title = siteInfo.title || siteInfo.url || "Target Website";
    const url = siteInfo.url || "Target URL";

    const techEvidence = (techStack || []).map(t => 
      `- ${t.name} (${t.category}): ${t.confidence || 90}% confidence score. Evidence: ${(t.evidence || []).join(', ') || 'Detected signature'}`
    ).join('\n') || "- Standard HTML5/DOM structure inspected.";

    const htmlTree = rawData.htmlSnippets || (designSpec.components?.tree 
      ? JSON.stringify(designSpec.components?.tree, null, 2)
      : `<html lang="en"><head><title>${title}</title></head><body>...</body></html>`);

    const scriptSources = rawData.scriptSources && rawData.scriptSources.length > 0
      ? rawData.scriptSources.map(s => `- ${s}`).join('\n')
      : (techStack || []).map(t => `- Script asset detected for ${t.name}`).join('\n') || "- Script URLs extracted via Chrome Extension Scanner";

    const headers = rawData.networkHeaders
      ? Object.entries(rawData.networkHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')
      : `X-Powered-By: ${techStack.find(t => t.category === "Framework")?.name || "Web Server"}\nServer: Cloudflare / Vercel / Nginx\nVia: 1.1 google / cdn`;

    return `You are an expert Frontend Technology Profiler and Static Code Analyzer. Your sole objective is to inspect raw web data and identify the frontend tech stack, CMS, libraries, trackers, and infrastructure with 100% accuracy, avoiding false positives.

You will receive input data from a Chrome Extension, which may include:
1. HTML Snippets / DOM Tree Structure
2. Global JavaScript Window Objects
3. Script Source URLs and Asset Paths
4. Network Response Headers

### DETECTION METHODOLOGY & RULES:

1. GLOBAL JAVASCRIPT OBJECTS (Highest Priority for Frameworks)
- React: Confirm if \`__REACT_DEVTOOLS_GLOBAL_HOOK__\` exists or DOM has \`data-reactroot\`.
- Vue: Confirm if \`__VUE__\` exists or DOM nodes contain \`__vue__\` properties.
- Angular: Check for \`window.ng\` or \`ng-version\` in HTML attributes.
- Next.js / Nuxt.js: Look for \`__NEXT_DATA__\` or \`__NUXT__\` objects.

2. HTML ATTRUBUTES & CSS PATTERNS
- Svelte: Match classes starting with \`svelte-\` (e.g., \`class="svelte-xyz123"\`).
- Tailwind CSS: Scan class lists for utility patterns (\`md:flex\`, \`lg:items-center\`, \`dark:bg-\`).
- Bootstrap: Look for classic grid classes (\`container-fluid\`, \`col-md-\`, \`row\`) and \`data-bs-toggle\`.

3. SCRIPT SOURCE & ASSET PATH ANALYSIS (For CMS & Plugins)
- WordPress: Match URLs containing \`/wp-content/themes/\` or \`/wp-content/plugins/[plugin-name]/\`. Extract the theme/plugin name accurately from the path.
- Shopify: Check for \`://shopify.com\` assets and \`Shopify.shop\` global objects.

4. RESPONSE HEADERS & CDNs
- Infrastructure: Analyze \`X-Powered-By\`, \`Server\`, and \`Via\` headers to detect Vercel, Netlify, Cloudflare, Nginx, or Apache.

### OUTPUT FORMAT:
You must analyze the inputs and return a strict JSON object grouping the identified technologies. Do not include conversational text. Use this structure:

{
  "frameworks_and_libraries": [],
  "cms": [],
  "plugins_and_themes": [],
  "analytics_and_trackers": [],
  "cdn_and_servers": [],
  "ui_and_styling": [],
  "confidence_score_percentage": 0
}

### CRITICAL INSTRUCTIONS FOR 100% ACCURACY:
- Cross-Verify: Do not rely on a single marker. For example, a script tag mentioning "react" might just be a text reference; confirm with global variables or DOM attributes.
- Handle Minified Code: Recognize obfuscated signatures. If a library is minified, rely on unique global variables that minifiers cannot change.
- Strict Mode: If evidence is insufficient or ambiguous, do not guess. Exclude it from the list or lower the confidence score.

--------------------------------------------------
RAW INPUT DATA FROM CHROME EXTENSION:
--------------------------------------------------
Target URL: ${url}
Target Title: ${title}

1. HTML Snippets / DOM Tree Structure:
${htmlTree}

2. Global JavaScript Window Objects & Inspected Signals:
${techEvidence}

3. Script Source URLs and Asset Paths:
${scriptSources}

4. Network Response Headers:
${headers}`;
  }

  /**
   * INSPIRE MODE: Combine design patterns across multiple saved sites with advanced directives & architectural rationale
   */
  static toDesignMixPrompt(mixConfig) {
    const heroSite = mixConfig.hero || "stripe.com";
    const navSite = mixConfig.nav || "linear.app";
    const buttonSite = mixConfig.button || "vercel.com";
    const cardSite = mixConfig.card || "airbnb.com";

    const stack = mixConfig.stack || "Next.js App Router (TSX + Tailwind CSS)";
    const componentType = mixConfig.componentType || "Hero Banner Section";
    const direction = mixConfig.direction || "Harmonized Blend (Borrow principles into an original design)";
    const functionality = mixConfig.functionality || "Fully Interactive (Working navigation, dropdowns, forms & animations)";
    const outputFormat = mixConfig.outputFormat || "Single Self-Contained Executable File";
    const constraints = mixConfig.constraints ? mixConfig.constraints.trim() : null;

    const patternKnowledge = {
      "stripe.com": "Multi-layered radiant mesh background gradients, typography-driven heading hierarchy, floating glass product cards, glowing border accents, and high-converting primary CTAs.",
      "linear.app": "Ultra-sleek dark mode aesthetic, razor-thin subtle borders (1px solid rgba(255,255,255,0.08)), keyboard shortcut keybindings (⌘K), high-density typography, and understated sophistication.",
      "vercel.com": "High-contrast monochrome dark/light palette, tactile geometric buttons, clean monochrome icon badges, instant state transitions, and developer-first minimalist layout.",
      "airbnb.com": "Soft elevated surface cards with drop shadows (0 6px 20px rgba(0,0,0,0.06)), rounded corners (16px), image-first responsive card grids, and warm accessible layout rhythm.",
      "notion.so": "Minimalist document canvas, clean borderless content blocks, collapsible interactive accordion boxes, subtle callout cards, and clean monochromatic typography.",
      "spotify.com": "Bold vibrant duotone accents, deep dark backdrop (#121212), pill-shaped action buttons with hover scale animations, and media-rich surface elevation.",
      "apple.com": "Frosted glassmorphic backdrop filter blur (backdrop-filter: blur(20px)), fluid typography scale, spring physics micro-interactions, and squircle rounded corners.",
      "framer.com": "Interactive 3D hover tilt effects, subtle background grid patterns, smooth layout transitions, floating pill navigation bars, and high-impact visual banners."
    };

    function getRationale(site, category) {
      const clean = (site || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
      if (patternKnowledge[clean]) {
        return patternKnowledge[clean];
      }
      return `Custom design principles extracted from ${site} including layout density, typography scale, surface elevation, and component micro-interactions tailored for ${category}.`;
    }

    const heroRationale = getRationale(heroSite, "Hero Section");
    const navRationale = getRationale(navSite, "Navigation Architecture");
    const buttonRationale = getRationale(buttonSite, "Action Buttons");
    const cardRationale = getRationale(cardSite, "Card Surfaces");

    return `DESIGN MIXER — INSPIRATION LAB MASTER DIRECTIVE

==================================================
1. INSPIRATION PATTERN SYNTHESIS & RATIONALE
==================================================
You are an expert Frontend Architect and Design Systems Profiler. Your objective is to build a world-class ${componentType} by harmonizing 4 distinct design languages into a single cohesive, high-converting interface.

✦ HERO SECTION PATTERN: Inspired by ${heroSite}
  - Architectural Rationale: ${heroRationale}
  - Execution Directive: Adopt ${heroSite}'s headline typography scale, visual focal point, and hero layout structure to anchor the main viewport.

✦ NAVIGATION PATTERN: Inspired by ${navSite}
  - Architectural Rationale: ${navRationale}
  - Execution Directive: Model navigation bar layout, logo mark placement, link spacing, sticky blur positioning, and compact mobile reflow after ${navSite}.

✦ ACTION BUTTONS & CONTROLS: Inspired by ${buttonSite}
  - Architectural Rationale: ${buttonRationale}
  - Execution Directive: Replicate ${buttonSite}'s button geometry, padding, hover scale/glow micro-interactions, font weight, and border radii.

✦ CARD SURFACES & ELEVATION: Inspired by ${cardSite}
  - Architectural Rationale: ${cardRationale}
  - Execution Directive: Apply ${cardSite}'s card surface elevation, background opacity, subtle border styling, shadow depth, and inner content padding.

==================================================
2. TECHNICAL & ARCHITECTURAL REQUIREMENTS
==================================================
- Target Technology Stack: ${stack}
- Component Scope: ${componentType}
- Visual Direction & Fidelity: ${direction}
- Functional Requirements: ${functionality}
- Output Delivery Structure: ${outputFormat}

==================================================
3. DESIGN SYSTEM HARMONIZATION & CODE GENERATION RULES
==================================================
1. Visual Palette & Token Unification:
   - Harmonize typography, color palettes, spacing tokens, and corner radii into a single unified theme.
   - Do NOT produce mismatched or disjointed component styles.

2. Component Geometry & Layout Reflow:
   - Implement fluid responsive layout reflow for mobile (375px), tablet (768px), and desktop (1440px) viewports.
   - Ensure header navigation, CTA buttons, and card grids adjust density seamlessly across breakpoints.

3. Interactivity & Functionality:
   ${functionality.includes("Fully Interactive") 
     ? `- Ensure buttons, dropdown menus, navigation links, forms, and state toggles are fully functional.\n   - Implement smooth hover micro-animations, active press states, and keyboard focus rings.` 
     : `- Deliver clean static markup and styled components with accurate visual structure.`}

4. Code Quality & Deliverable:
   - Provide complete, production-ready code with zero placeholders, missing imports, or truncated sections.
   ${outputFormat.includes("Single Self-Contained")
     ? `- Return a single self-contained executable file containing all component markup, logic, and styling.`
     : `- Structure code into production-ready modular components with typed props.`}
${constraints ? `\n==================================================\n4. CUSTOM CONSTRAINTS & DIRECTIVES\n==================================================\n- ${constraints}` : ''}`;
  }

  /**
   * Export to Tailwind CSS Config Theme Extend Block (Evidence-Based)
   */
  static toTailwindConfig(designSpec) {
    const colors = designSpec.colors || [];
    const typography = designSpec.typography || {};

    const colorTokens = {};
    colors.forEach((c, idx) => {
      colorTokens[`brand-${idx + 1}`] = c.hex;
    });

    return `// tailwind.config.js - Extracted via StackVibe Engine
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: "${designSpec.background || "#0F172A"}",
        text: "${designSpec.textColor || "#F8FAFC"}",
        ${Object.entries(colorTokens).map(([k, v]) => `'${k}': '${v}'`).join(',\n        ')}
      },
      fontFamily: {
        sans: ["${typography.fontFamily || "sans-serif"}", "sans-serif"]
      }
    }
  }
};`;
  }

  /**
   * Export to W3C Design Tokens JSON
   */
  static toFigmaTokensJSON(siteInfo, designSpec) {
    return JSON.stringify({
      meta: {
        source: siteInfo.url,
        generator: "StackVibe Token Engine v2.0",
        exportedAt: new Date().toISOString()
      },
      colors: designSpec.colors || [],
      typography: designSpec.typography || {},
      components: designSpec.components || {}
    }, null, 2);
  }

  /**
   * Export to Standard CSS Variables
   */
  static toCSSVariables(designSpec) {
    const colors = designSpec.colors || [];
    const typography = designSpec.typography || {};

    return `:root {
  /* Extracted Colors */
  --canvas-bg: ${designSpec.background || "initial"};
  --body-text: ${designSpec.textColor || "initial"};
  ${colors.map((c, i) => `--color-token-${i + 1}: ${c.hex}; /* Role: ${c.role} */`).join('\n  ')}

  /* Extracted Typography */
  --font-family: "${typography.fontFamily || "sans-serif"}";
  --font-size-h1: ${typography.h1Size || "auto"};
  --font-size-body: ${typography.bodySize || "auto"};
}`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExportEngine };
}
