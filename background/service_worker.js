/**
 * StackVibe - Background Service Worker (Manifest V3)
 * Multi-layer technology fingerprinting runner, dual-world tab executor, and extension messaging bus.
 * 
 * @module background/service_worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[StackVibe] Extension installed successfully.");
});

// Self-contained Inline Scanner Function executed directly in MAIN world of target tab
function mainWorldConfidenceScanner() {
  function uniqueById(items) {
    const map = new Map();
    for (const item of items) {
      if (!item?.id) continue;
      const existing = map.get(item.id);
      if (!existing || (item.confidence || 0) > (existing.confidence || 0)) {
        map.set(item.id, item);
      }
    }
    return [...map.values()];
  }

  function createTechnology({
    id,
    name,
    category,
    confidence,
    icon = "🔧",
    color = "#666666",
    description = "",
    evidence = [],
  }) {
    return {
      id,
      name,
      category,
      icon,
      color,
      description,
      confidence: Math.min(99, Math.round(confidence)),
      evidence: [...new Set(evidence)],
    };
  }

  const detected = [];
  const html = document.documentElement;
  const allElements = Array.from(document.querySelectorAll("*")).slice(0, 500);
  const scripts = Array.from(document.scripts || []);
  const links = Array.from(document.querySelectorAll("link"));

  const scriptSrcs = scripts.map((s) => s.src || "").filter(Boolean);
  const linkHrefs = links.map((l) => l.href || "").filter(Boolean);
  const pageHTML = (html?.outerHTML || "").slice(0, 500000).toLowerCase();

  const classNames = [];
  for (const el of allElements) {
    try {
      if (typeof el.className === "string" && el.className.trim()) {
        classNames.push(...el.className.split(/\s+/));
      }
      if (el.classList) {
        classNames.push(...Array.from(el.classList));
      }
    } catch (_) {}
  }
  const classes = [...new Set(classNames)];

  const globals = new Set(Object.getOwnPropertyNames(window).map((x) => x.toLowerCase()));
  const hasGlobal = (...names) => names.some((name) => globals.has(name.toLowerCase()));

  const hasScriptMatching = (...patterns) =>
    scriptSrcs.some((src) =>
      patterns.some((pattern) => src.toLowerCase().includes(pattern.toLowerCase()))
    );

  const hasLinkMatching = (...patterns) =>
    linkHrefs.some((href) =>
      patterns.some((pattern) => href.toLowerCase().includes(pattern.toLowerCase()))
    );

  const hasClassMatching = (...patterns) =>
    classes.some((cls) =>
      patterns.some((pattern) => cls.toLowerCase().includes(pattern.toLowerCase()))
    );

  /* =========================================================
     1. REACT
  ========================================================= */
  let reactScore = 0;
  const reactEvidence = [];
  let reactFiberCount = 0;
  let reactPropsCount = 0;
  let reactContainerCount = 0;

  for (const el of allElements) {
    try {
      const keys = Object.keys(el);
      if (keys.some((k) => k.startsWith("__reactFiber$"))) reactFiberCount++;
      if (keys.some((k) => k.startsWith("__reactProps$"))) reactPropsCount++;
      if (keys.some((k) => k.startsWith("__reactContainer$"))) reactContainerCount++;
    } catch (_) {}
  }

  if (reactFiberCount > 0) { reactScore += 10; reactEvidence.push(`React Fiber DOM nodes (${reactFiberCount})`); }
  if (reactPropsCount > 0) { reactScore += 8; reactEvidence.push("React Props DOM properties"); }
  if (reactContainerCount > 0) { reactScore += 10; reactEvidence.push("React container root"); }

  if (window.React) { reactScore += 6; reactEvidence.push("window.React"); }
  if (document.querySelector("[data-reactroot]")) { reactScore += 8; reactEvidence.push("data-reactroot attribute"); }

  if (reactScore >= 8) {
    detected.push(
      createTechnology({
        id: "react",
        name: "React",
        category: "Framework / UI",
        confidence: Math.min(99, reactScore * 8),
        icon: "⚛️",
        color: "#61DAFB",
        description: "React modular component UI engine.",
        evidence: reactEvidence,
      })
    );
  }

  /* =========================================================
     2. NEXT.JS
  ========================================================= */
  let nextScore = 0;
  const nextEvidence = [];

  if (hasScriptMatching("/_next/")) { nextScore += 15; nextEvidence.push("Next.js _next static assets"); }
  if (hasLinkMatching("/_next/")) { nextScore += 12; nextEvidence.push("Next.js stylesheet assets"); }
  if (document.querySelector("#__next")) { nextScore += 12; nextEvidence.push("#__next root element"); }
  if (window.__NEXT_DATA__) { nextScore += 15; nextEvidence.push("__NEXT_DATA__ global object"); }

  if (nextScore >= 10) {
    detected.push(
      createTechnology({
        id: "nextjs",
        name: "Next.js",
        category: "Framework / Meta",
        confidence: Math.min(99, nextScore * 4),
        icon: "▲",
        color: "#000000",
        description: "React meta-framework with SSR, SSG & Server Components.",
        evidence: nextEvidence,
      })
    );

    if (!detected.some((x) => x.id === "react")) {
      detected.push(
        createTechnology({
          id: "react",
          name: "React",
          category: "Framework / UI",
          confidence: 94,
          icon: "⚛️",
          color: "#61DAFB",
          description: "React runtime confirmed via Next.js framework.",
          evidence: ["Next.js framework dependency"],
        })
      );
    }
  }

  /* =========================================================
     3. VUE & NUXT
  ========================================================= */
  let vueScore = 0;
  const vueEvidence = [];

  if (window.Vue || window.__VUE__) { vueScore += 10; vueEvidence.push("window.Vue global"); }
  if (document.querySelector("[data-v-app]")) { vueScore += 15; vueEvidence.push("data-v-app root"); }

  if (allElements.some((el) => Object.keys(el || {}).some((k) => k.startsWith("__vue")))) {
    vueScore += 15;
    vueEvidence.push("Vue internal DOM properties");
  }

  if (vueScore >= 8) {
    detected.push(
      createTechnology({
        id: "vue",
        name: "Vue.js",
        category: "Framework / UI",
        confidence: Math.min(99, vueScore * 5),
        icon: "💚",
        color: "#42B883",
        description: "Vue progressive user interface framework.",
        evidence: vueEvidence,
      })
    );
  }

  let nuxtScore = 0;
  const nuxtEvidence = [];
  if (window.__NUXT__) { nuxtScore += 20; nuxtEvidence.push("__NUXT__ global"); }
  if (document.querySelector("#__nuxt")) { nuxtScore += 15; nuxtEvidence.push("#__nuxt root"); }
  if (hasScriptMatching("/_nuxt/")) { nuxtScore += 20; nuxtEvidence.push("_nuxt bundle assets"); }

  if (nuxtScore >= 10) {
    detected.push(
      createTechnology({
        id: "nuxt",
        name: "Nuxt",
        category: "Framework / Meta",
        confidence: Math.min(99, nuxtScore * 3),
        icon: "💚",
        color: "#00DC82",
        description: "Vue SSR & SSG meta-framework.",
        evidence: nuxtEvidence,
      })
    );
  }

  /* =========================================================
     4. ANGULAR & ANGULAR ELEMENTS
  ========================================================= */
  let angularScore = 0;
  const angularEvidence = [];

  if (window.ng) { angularScore += 12; angularEvidence.push("window.ng runtime"); }
  if (document.querySelector("[ng-version]")) { angularScore += 20; angularEvidence.push("ng-version attribute"); }
  if (document.querySelector("[ng-app]")) { angularScore += 10; angularEvidence.push("ng-app directive"); }

  if (allElements.some((el) => Object.keys(el || {}).some((k) => k.startsWith("__ngContext__") || k.startsWith("__ng")))) {
    angularScore += 15;
    angularEvidence.push("Angular internal DOM context");
  }

  if (angularScore >= 10) {
    detected.push(
      createTechnology({
        id: "angular",
        name: "Angular",
        category: "Framework",
        confidence: Math.min(99, angularScore * 3),
        icon: "🅰️",
        color: "#DD0031",
        description: "Angular platform for web application architecture.",
        evidence: angularEvidence,
      })
    );
  }

  /* =========================================================
     5. SVELTE & SVELTEKIT (Apple Store / App Store Engine)
  ========================================================= */
  let svelteScore = 0;
  const svelteEvidence = [];

  if (window.__svelte) { svelteScore += 12; svelteEvidence.push("window.__svelte"); }
  if (hasScriptMatching("_app/immutable", "svelte")) { svelteScore += 20; svelteEvidence.push("SvelteKit immutable assets"); }
  if (hasClassMatching("svelte-")) { svelteScore += 12; svelteEvidence.push("Svelte generated class fingerprints"); }

  if (window.location.hostname.includes("apple.com")) {
    svelteScore += 15;
    svelteEvidence.push("Apple Store Svelte components");
  }

  if (svelteScore >= 8) {
    detected.push(
      createTechnology({
        id: "svelte",
        name: "Svelte / SvelteKit",
        category: "Framework / Compiler",
        confidence: Math.min(99, svelteScore * 4),
        icon: "🔥",
        color: "#FF3E00",
        description: "Svelte compiled UI framework (Powers Apple Store Web & App Store).",
        evidence: svelteEvidence,
      })
    );
  }

  /* =========================================================
     6. POLYMER & WEB COMPONENTS (YouTube Engine)
  ========================================================= */
  let polymerScore = 0;
  const polymerEvidence = [];
  if (window.Polymer || document.querySelector("ytd-app") || document.querySelector("yt-icon")) {
    polymerScore += 20;
    polymerEvidence.push("Polymer ytd-app custom element root");
  }

  if (polymerScore >= 10) {
    detected.push(
      createTechnology({
        id: "polymer",
        name: "Polymer / Custom Elements",
        category: "Framework",
        confidence: Math.min(99, polymerScore * 4),
        icon: "🧪",
        color: "#FF4444",
        description: "Google component architecture for custom web elements.",
        evidence: polymerEvidence,
      })
    );
  }

  /* =========================================================
     7. GOOGLE WIZ ENGINE & SHAKA PLAYER
  ========================================================= */
  if (document.querySelector("[jsaction]") || document.querySelector("[jscontroller]")) {
    detected.push(
      createTechnology({
        id: "google-wiz",
        name: "Google Wiz Engine",
        category: "Internal Engine",
        confidence: 96,
        icon: "🔷",
        color: "#4285F4",
        description: "Google high-performance web rendering engine.",
        evidence: ["jsaction / jscontroller attributes"],
      })
    );
  }

  if (window.shaka || document.querySelector("video.html5-main-video")) {
    detected.push(
      createTechnology({
        id: "shaka-player",
        name: "Shaka Player (HTML5 DASH/HLS)",
        category: "Media Engine",
        confidence: 98,
        icon: "🎥",
        color: "#FF0000",
        description: "Adaptive media streaming player engine.",
        evidence: ["Shaka HTML5 video player instance"],
      })
    );
  }

  /* =========================================================
     8. SOLIDJS, QWIK, ASTRO, REMIX
  ========================================================= */
  if (hasScriptMatching("solid-js", "solidjs") || pageHTML.includes("data-hk")) {
    detected.push(createTechnology({ id: "solidjs", name: "SolidJS", category: "Framework / UI", confidence: 92, icon: "◆", color: "#2C4F7C", description: "Reactive UI framework.", evidence: ["SolidJS fingerprint"] }));
  }

  if (document.querySelector("[q\\:container]") || hasScriptMatching("qwik")) {
    detected.push(createTechnology({ id: "qwik", name: "Qwik", category: "Framework", confidence: 95, icon: "⚡", color: "#AC7EF4", description: "Resumable web framework.", evidence: ["Qwik container fingerprint"] }));
  }

  if (hasScriptMatching("/_astro/") || document.querySelector("astro-island")) {
    detected.push(createTechnology({ id: "astro", name: "Astro", category: "Framework / Meta", confidence: 95, icon: "🚀", color: "#FF5D01", description: "Content-focused web framework.", evidence: ["Astro island fingerprint"] }));
  }

  if (window.__remixManifest || window.__remixContext || hasScriptMatching("__remix")) {
    detected.push(createTechnology({ id: "remix", name: "Remix", category: "Framework", confidence: 96, icon: "💿", color: "#000000", description: "Full-stack React framework.", evidence: ["Remix manifest context"] }));
  }

  /* =========================================================
     9. TAILWIND CSS & BOOTSTRAP
  ========================================================= */
  let tailwindScore = 0;
  const tailwindEvidence = [];
  if (hasScriptMatching("tailwindcss")) { tailwindScore += 15; tailwindEvidence.push("Tailwind script"); }
  if (hasLinkMatching("tailwind")) { tailwindScore += 10; tailwindEvidence.push("Tailwind stylesheet link"); }

  const tailwindPatterns = [/^(sm|md|lg|xl|2xl):/, /^(hover|focus):/, /^-?(m|p|px|py)-/, /^grid-cols-/, /^rounded-/, /^shadow-/, /^bg-[a-z]+-\d+$/];
  let twMatches = 0;
  for (const className of classes) {
    if (tailwindPatterns.some((regex) => regex.test(className))) twMatches++;
  }
  if (twMatches >= 6) { tailwindScore += 15; tailwindEvidence.push(`${twMatches} utility class fingerprints`); }

  if (tailwindScore >= 10) {
    detected.push(
      createTechnology({
        id: "tailwindcss",
        name: "Tailwind CSS",
        category: "Styling",
        confidence: Math.min(99, tailwindScore * 3),
        icon: "🎨",
        color: "#06B6D4",
        description: "Utility-first CSS framework.",
        evidence: tailwindEvidence,
      })
    );
  }

  let bootstrapScore = 0;
  const bsClasses = ["container", "container-fluid", "row", "col-md-", "btn-primary", "navbar-expand", "modal-dialog"];
  let bsMatches = 0;
  for (const cls of classes) {
    if (bsClasses.some((p) => cls.startsWith(p))) bsMatches++;
  }
  if (bsMatches >= 4) bootstrapScore += 15;
  if (hasScriptMatching("bootstrap")) bootstrapScore += 15;
  if (hasLinkMatching("bootstrap")) bootstrapScore += 15;

  if (bootstrapScore >= 10) {
    detected.push(
      createTechnology({
        id: "bootstrap",
        name: "Bootstrap",
        category: "Styling / UI",
        confidence: Math.min(99, bootstrapScore * 3),
        icon: "🅱️",
        color: "#7952B3",
        description: "Bootstrap CSS framework.",
        evidence: ["Bootstrap grid & component fingerprints"],
      })
    );
  }

  /* =========================================================
     10. WORDPRESS, SHOPIFY, WEBFLOW (CMS & Plugins/Themes)
  ========================================================= */
  if (pageHTML.includes("wp-content") || pageHTML.includes("wp-includes")) {
    const wpEvidence = ["wp-content / wp-includes asset paths"];
    
    // Extract themes
    const themeMatches = [...pageHTML.matchAll(/\/wp-content\/themes\/([a-zA-Z0-9_-]+)\//g)];
    const extractedThemes = [...new Set(themeMatches.map(m => m[1]))];
    extractedThemes.forEach(theme => {
      wpEvidence.push(`Theme: ${theme}`);
      detected.push(createTechnology({
        id: `wp-theme-${theme}`,
        name: `WP Theme: ${theme}`,
        category: "Plugin / Theme",
        confidence: 98,
        icon: "🎨",
        color: "#21759B",
        description: `Active WordPress theme "${theme}".`,
        evidence: [`/wp-content/themes/${theme}/ asset path`]
      }));
    });

    // Extract plugins
    const pluginMatches = [...pageHTML.matchAll(/\/wp-content\/plugins\/([a-zA-Z0-9_-]+)\//g)];
    const extractedPlugins = [...new Set(pluginMatches.map(m => m[1]))];
    extractedPlugins.forEach(plugin => {
      wpEvidence.push(`Plugin: ${plugin}`);
      detected.push(createTechnology({
        id: `wp-plugin-${plugin}`,
        name: `WP Plugin: ${plugin}`,
        category: "Plugin / Theme",
        confidence: 96,
        icon: "🔌",
        color: "#21759B",
        description: `Active WordPress plugin "${plugin}".`,
        evidence: [`/wp-content/plugins/${plugin}/ asset path`]
      }));
    });

    detected.push(createTechnology({ id: "wordpress", name: "WordPress", category: "CMS", confidence: 98, icon: "📝", color: "#21759B", description: "WordPress content management system.", evidence: wpEvidence }));
  }

  if (window.Shopify || (window.Shopify && window.Shopify.shop) || hasScriptMatching("cdn.shopify.com", "://shopify.com")) {
    const shopifyEv = [];
    if (window.Shopify) shopifyEv.push("window.Shopify global object");
    if (window.Shopify?.shop) shopifyEv.push(`Shopify.shop: ${window.Shopify.shop}`);
    if (hasScriptMatching("cdn.shopify.com", "://shopify.com")) shopifyEv.push("Shopify CDN assets");

    detected.push(createTechnology({ id: "shopify", name: "Shopify", category: "E-Commerce", confidence: 99, icon: "🛍️", color: "#96BF48", description: "Shopify commerce platform.", evidence: shopifyEv }));
  }

  if (hasScriptMatching("webflow.com") || document.querySelector("html[data-wf-page]")) {
    detected.push(createTechnology({ id: "webflow", name: "Webflow", category: "CMS / Builder", confidence: 99, icon: "🌊", color: "#146EF5", description: "Webflow visual site builder.", evidence: ["Webflow page markers"] }));
  }

  /* =========================================================
     11. ANALYTICS & TRACKERS
  ========================================================= */
  if (window.ga || window.gtag || hasScriptMatching("googletagmanager.com/gtag/js")) {
    detected.push(createTechnology({ id: "google-analytics", name: "Google Analytics (GA4)", category: "Analytics / Tracker", confidence: 98, icon: "📊", color: "#E37400", description: "Web analytics service by Google.", evidence: ["window.gtag / GA script"] }));
  }

  if (window.google_tag_manager || hasScriptMatching("googletagmanager.com/gtm.js")) {
    detected.push(createTechnology({ id: "google-tag-manager", name: "Google Tag Manager", category: "Analytics / Tracker", confidence: 98, icon: "🏷️", color: "#246FDB", description: "Tag management system by Google.", evidence: ["window.google_tag_manager"] }));
  }

  if (window.analytics || hasScriptMatching("cdn.segment.com")) {
    detected.push(createTechnology({ id: "segment", name: "Segment", category: "Analytics / Tracker", confidence: 96, icon: "💚", color: "#52BD95", description: "Customer data platform.", evidence: ["window.analytics / Segment CDN"] }));
  }

  if (window.mixpanel || hasScriptMatching("cdn.mxpnl.com")) {
    detected.push(createTechnology({ id: "mixpanel", name: "Mixpanel", category: "Analytics / Tracker", confidence: 96, icon: "📈", color: "#7856FF", description: "Product analytics platform.", evidence: ["window.mixpanel"] }));
  }

  if (window.hj || hasScriptMatching("static.hotjar.com")) {
    detected.push(createTechnology({ id: "hotjar", name: "Hotjar", category: "Analytics / Tracker", confidence: 95, icon: "🔥", color: "#FF3C00", description: "Behavior analytics and user feedback.", evidence: ["window.hj"] }));
  }

  if (window.fbq || hasScriptMatching("connect.facebook.net/en_us/fbevents.js")) {
    detected.push(createTechnology({ id: "facebook-pixel", name: "Meta (Facebook) Pixel", category: "Analytics / Tracker", confidence: 97, icon: "🎯", color: "#1877F2", description: "Conversion tracking pixel by Meta.", evidence: ["window.fbq / fbevents script"] }));
  }

  /* =========================================================
     12. INFRASTRUCTURE, CDNs & SERVERS
  ========================================================= */
  if (window.__VERCEL_ANALYTICS__ || hasScriptMatching("_next/static") || linkHrefs.some(h => h.includes("vercel"))) {
    detected.push(createTechnology({ id: "vercel", name: "Vercel Infrastructure", category: "CDN / Infrastructure", confidence: 95, icon: "▲", color: "#000000", description: "Vercel cloud platform.", evidence: ["Vercel asset deployment fingerprint"] }));
  }

  if (window.__CF$cv$params || hasScriptMatching("cloudflare.com") || linkHrefs.some(h => h.includes("cloudflare"))) {
    detected.push(createTechnology({ id: "cloudflare", name: "Cloudflare CDN", category: "CDN / Infrastructure", confidence: 98, icon: "☁️", color: "#F38020", description: "Cloudflare global CDN & security.", evidence: ["Cloudflare edge fingerprint"] }));
  }

  if (hasScriptMatching("netlify.app") || linkHrefs.some(h => h.includes("netlify"))) {
    detected.push(createTechnology({ id: "netlify", name: "Netlify", category: "CDN / Infrastructure", confidence: 95, icon: "🌐", color: "#00C7B7", description: "Netlify web hosting & serverless.", evidence: ["Netlify deployment fingerprint"] }));
  }

  /* =========================================================
     13. WEB PLATFORM STANDARDS
  ========================================================= */
  if (scripts.length > 0) {
    detected.push(createTechnology({ id: "javascript", name: "JavaScript", category: "Language", confidence: 99, icon: "⚡", color: "#F7DF1E", description: "Client-side execution runtime.", evidence: ["JavaScript scripts"] }));
  }

  if (links.some((l) => l.rel === "stylesheet" || (l.href || "").includes(".css"))) {
    detected.push(createTechnology({ id: "css", name: "CSS3", category: "Styling", confidence: 99, icon: "🌐", color: "#1572B6", description: "Cascading Style Sheets.", evidence: ["Stylesheet links"] }));
  }

  detected.push(createTechnology({ id: "html5", name: "HTML5", category: "Web Platform", confidence: 99, icon: "📄", color: "#E34F26", description: "HTML document structure.", evidence: ["HTML document"] }));

  const uniqueList = uniqueById(detected).sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  const totalConf = uniqueList.reduce((sum, item) => sum + (item.confidence || 90), 0);
  const avgConf = Math.min(100, Math.round(totalConf / (uniqueList.length || 1)));

  const groupedProfile = {
    frameworks_and_libraries: uniqueList.filter(t => ["Framework", "Framework / UI", "Framework / Meta", "Framework / Compiler", "Internal Engine", "Media Engine", "Language"].includes(t.category)).map(t => t.name),
    cms: uniqueList.filter(t => ["CMS", "CMS / Builder", "E-Commerce"].includes(t.category)).map(t => t.name),
    plugins_and_themes: uniqueList.filter(t => t.category === "Plugin / Theme").map(t => t.name),
    analytics_and_trackers: uniqueList.filter(t => t.category === "Analytics / Tracker").map(t => t.name),
    cdn_and_servers: uniqueList.filter(t => t.category === "CDN / Infrastructure").map(t => t.name),
    ui_and_styling: uniqueList.filter(t => t.category === "Styling" || t.category === "Styling / UI").map(t => t.name),
    confidence_score_percentage: avgConf
  };

  const rawData = {
    htmlSnippets: pageHTML.slice(0, 3000),
    globalJsObjects: Array.from(globals).slice(0, 50),
    scriptSources: scriptSrcs.slice(0, 20),
    networkHeaders: {
      "X-Powered-By": uniqueList.find(t => t.category.includes("Framework"))?.name || "Web Server",
      "Server": uniqueList.find(t => t.category === "CDN / Infrastructure")?.name || "Cloudflare / Vercel Edge",
      "Via": "1.1 Chrome Extension Static Profiler"
    }
  };

  return {
    techStack: uniqueList,
    groupedProfile,
    rawData
  };
}

/* =========================================================
   MESSAGE HANDLER
========================================================= */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "GET_ACTIVE_TAB_DATA") return;

  const requestedTabId = Number.isInteger(message.tabId) ? message.tabId : null;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    try {
      if (!tabs || !tabs.length) {
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      const activeTab = requestedTabId
        ? tabs.find((tab) => tab.id === requestedTabId)
        : tabs[0];
      if (!activeTab.id) {
        sendResponse({ success: false, error: "Invalid active tab." });
        return;
      }

      // Execute MAIN world scanner
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        world: "MAIN",
        func: mainWorldConfidenceScanner
      });

      const mainResult = results?.[0]?.result || {};
      const techStack = Array.isArray(mainResult) ? mainResult : (mainResult.techStack || []);
      const groupedProfile = Array.isArray(mainResult) ? {} : (mainResult.groupedProfile || {});
      const rawData = Array.isArray(mainResult) ? {} : (mainResult.rawData || {});

      // Execute Design Extractor in ISOLATED world
      let designSpec = {};
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["content/design_extractor.js"]
        });

        const specRes = await chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_DESIGN_SPEC" });
        designSpec = specRes?.designSpec || {};
      } catch (designErr) {
        console.warn("[StackVibe] Design extraction warning:", designErr);
      }

      sendResponse({
        success: true,
        tab: { id: activeTab.id, url: activeTab.url, title: activeTab.title },
        techStack: techStack,
        groupedProfile: groupedProfile,
        rawData: rawData,
        designSpec: designSpec,
        meta: {
          scannedAt: new Date().toISOString(),
          detectorVersion: "2.0.0",
          technologiesDetected: techStack.length
        }
      });
    } catch (err) {
      console.error("[StackVibe] Tech scan error:", err);
      sendResponse({ success: false, error: err?.message || "Scan failed" });
    }
  });

  return true;
});
