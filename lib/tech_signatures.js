/**
 * StackVibe - Universal Technology Signature Engine
 * High-precision confidence scoring detector for Svelte, Polymer, React, Next, Vue, Angular, etc.
 * 
 * @param {Window} win Target page window object
 * @param {Document} doc Target page document object
 * @returns {Array<Object>} Array of detected technology objects with confidence ratings
 */
function runConfidenceDetection(win, doc) {
  const detected = [];

  const sampleElements = [
    doc.documentElement,
    doc.body,
    doc.querySelector("#root"),
    doc.querySelector("#app"),
    doc.querySelector("#__next"),
    doc.querySelector("ytd-app"),
    doc.querySelector("main"),
    doc.querySelector("header"),
    doc.querySelector("nav"),
    ...Array.from(doc.querySelectorAll("button")).slice(0, 5),
    ...Array.from(doc.querySelectorAll("div")).slice(0, 15)
  ].filter(Boolean);

  const scripts = Array.from(doc.querySelectorAll("script"));
  const links = Array.from(doc.querySelectorAll("link"));

  // 1. Svelte / SvelteKit (Apple Store / App Store Engine)
  let svelteScore = 0;
  if (!!win.__svelte) svelteScore += 5;
  if (scripts.some(s => (s.src || "").includes("_app/immutable") || (s.src || "").includes("svelte"))) svelteScore += 5;
  if (links.some(l => (l.href || "").includes("_app/immutable") || (l.href || "").includes("svelte"))) svelteScore += 5;

  for (const el of sampleElements) {
    try {
      const clsList = Array.from(el.classList || []);
      if (clsList.some(c => c.startsWith("svelte-") || c.includes("svelte"))) {
        svelteScore += 5;
        break;
      }
    } catch (e) {}
  }

  const isAppleDomain = win.location.hostname.includes("apple.com");
  if (isAppleDomain && (doc.querySelector('[data-analytics-region]') || doc.querySelector('as-grid') || svelteScore > 0)) {
    svelteScore += 5;
  }

  if (svelteScore >= 4) {
    detected.push({
      id: "svelte",
      name: "Svelte / SvelteKit",
      category: "Framework",
      icon: "🔥",
      color: "#FF3E00",
      description: "Cybernetically enhanced web apps (Powers Apple Store & App Store Web).",
      confidence: svelteScore
    });
  }

  // 2. Polymer / Custom Elements (YouTube Engine)
  let polymerScore = 0;
  if (!!win.Polymer || !!doc.querySelector("ytd-app") || !!doc.querySelector("yt-icon")) polymerScore += 5;
  if (!!win.customElements && !!doc.querySelector("ytd-app")) polymerScore += 5;

  if (polymerScore >= 4) {
    detected.push({
      id: "polymer",
      name: "Polymer / Custom Elements",
      category: "Framework",
      icon: "🧪",
      color: "#FF4444",
      description: "Google component architecture for custom web elements & shadow DOM.",
      confidence: polymerScore
    });
  }

  // 3. Next.js Detection
  let nextScore = 0;
  if (scripts.some(s => s.src && s.src.includes("/_next/"))) nextScore += 5;
  if (links.some(l => l.href && l.href.includes("/_next/"))) nextScore += 5;
  if (!!doc.querySelector("#__next")) nextScore += 4;
  if (!!win.__NEXT_DATA__) nextScore += 5;

  if (nextScore >= 4) {
    detected.push({
      id: "nextjs",
      name: "Next.js",
      category: "Framework",
      icon: "⚡",
      color: "#000000",
      description: "React framework for production with SSR & SSG."
    });
  }

  // 4. React Detection (Strict Ground Truth)
  let reactScore = 0;
  let hasRealFiber = false;

  for (const el of sampleElements) {
    try {
      const keys = Object.keys(el || {});
      if (keys.some(k => k.startsWith("__reactFiber$") || k.startsWith("__reactProps$") || k.startsWith("__reactContainer$"))) {
        hasRealFiber = true;
        reactScore += 5;
        break;
      }
    } catch (e) {}
  }

  if (nextScore >= 4) reactScore += 5;
  if (!!win.React) reactScore += 5;
  if (!!doc.querySelector("[data-reactroot]")) reactScore += 5;

  if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers && win.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0) {
    reactScore += 4;
  }

  if ((svelteScore >= 4 || polymerScore >= 4) && !hasRealFiber && !win.React) {
    reactScore = 0;
  }

  if (reactScore >= 5) {
    detected.push({
      id: "react",
      name: "React",
      category: "Framework",
      icon: "⚛️",
      color: "#61DAFB",
      description: "JavaScript library for building modular user interfaces."
    });
  }

  // Fallback
  if (detected.length === 0) {
    detected.push({
      id: "html5",
      name: "HTML5 & Web Standards",
      category: "Framework",
      icon: "🌐",
      color: "#E34F26",
      description: "Semantic HTML5 structure with native JavaScript & CSS styling."
    });
  }

  return detected;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runConfidenceDetection };
}
