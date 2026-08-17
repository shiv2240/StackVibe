/**
 * StackVibe - Design System & AI Prompt Export Engine
 * Universal Evidence-First Web Technology & UI Reconstruction Engine
 * 
 * IMPORTANT: Zero hallucination policy. Never invent un-detected colors, fonts, or fallbacks.
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
`;
  }

  /**
   * Generate Ultra-Faithful RECONSTRUCTION MODE AI Prompt for Target AI
   */
  static toAIPromptForTarget(targetAi, siteInfo, techStack, designSpec) {
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
   * INSPIRE MODE: Combine design patterns across multiple saved sites
   */
  static toDesignMixPrompt(mixConfig) {
    const heroSite = mixConfig.hero || "stripe.com";
    const navSite = mixConfig.nav || "linear.app";
    const buttonSite = mixConfig.button || "vercel.com";
    const cardSite = mixConfig.card || "airbnb.com";

    return `INSPIRE MODE — COMBINED DESIGN SYSTEM DIRECTIVE

Task: Build a modern web component combining design patterns from 4 source sites:

- Hero Section: Inspired by ${heroSite}
- Navigation Pattern: Inspired by ${navSite}
- Action Buttons: Inspired by ${buttonSite}
- Card Surfaces: Inspired by ${cardSite}

### Instructions:
1. Harmonize colors, fonts, and corner radii into a unified theme.
2. Build responsive layout reflow for mobile, tablet, and desktop viewports.
3. Deliver complete, executable code.`;
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
