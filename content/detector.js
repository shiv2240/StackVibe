/**
 * StackVibe - Content Script Tech Stack Detector
 * Runs inside the web page context to analyze window, document, scripts, meta tags, and class structures.
 */

(function () {
  /**
   * Perform full tech stack scan on active web page
   */
  function scanTechStack() {
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
        console.warn(`StackVibe detector check failed for ${sig.name}:`, e);
      }
    }

    // Fallback detection if no custom framework detected
    if (detected.length === 0) {
      detected.push({
        id: "html5",
        name: "HTML5 & Modern Web Standards",
        category: "Framework",
        icon: "🌐",
        color: "#E34F26",
        description: "Semantic HTML5 structure with native JavaScript & CSS3 styling."
      });
    }

    return detected;
  }

  // Listen for Chrome runtime scan messages
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "SCAN_TECH_STACK") {
        const stack = scanTechStack();
        sendResponse({ success: true, techStack: stack });
      }
      return true;
    });
  }

  // Expose to window for testing / direct execution
  window.__StackVibe_scanTechStack = scanTechStack;
})();
