/**
 * StackVibe - Main World Execution Context Detector
 * Executes directly inside target webpage's true window object scope to inspect runtime frameworks.
 * 
 * @returns {Array<Object>} Array of detected technology signatures
 */
(function () {
  function scanMainWorldTechStack() {
    const detected = [];
    const signatures = typeof TECH_SIGNATURES !== 'undefined' ? TECH_SIGNATURES : [];

    for (const sig of signatures) {
      try {
        if (sig.detect && sig.detect(window, document)) {
          detected.push({
            id: sig.id,
            name: sig.name,
            category: sig.category,
            icon: sig.icon,
            color: sig.color,
            description: sig.description
          });
        }
      } catch (e) {
        console.warn(`Main world detector check failed for ${sig.name}:`, e);
      }
    }

    // Auto-include React if Next.js is detected
    if (detected.some(d => d.id === "nextjs") && !detected.some(d => d.id === "react")) {
      detected.unshift({
        id: "react",
        name: "React",
        category: "Framework",
        icon: "⚛️",
        color: "#61DAFB",
        description: "JavaScript library for building user interfaces (Powered via Next.js)."
      });
    }

    // Auto-include Vue if Nuxt is detected
    if (detected.some(d => d.id === "nuxt") && !detected.some(d => d.id === "vue")) {
      detected.unshift({
        id: "vue",
        name: "Vue.js",
        category: "Framework",
        icon: "🖖",
        color: "#4FC08D",
        description: "Progressive JavaScript framework (Powered via Nuxt.js)."
      });
    }

    // Fallback if no specific framework detected
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

  return scanMainWorldTechStack();
})();
