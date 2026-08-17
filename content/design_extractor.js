/**
 * StackVibe - Visual Forensics & DOM Geometry Extractor
 * Computes semantic color roles, frequency distributions, typography scales, and component bounds.
 * 
 * @module content/design_extractor
 */
(function () {
  /**
   * Convert RGB/RGBA string to HEX
   */
  function rgbToHex(rgbStr) {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') return null;
    const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return rgbStr;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Calculate luminance to determine if a color is light or dark
   */
  function getLuminance(hex) {
    if (!hex || !hex.startsWith('#')) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Extract comprehensive page structure & component specifications
   */
  function extractDesignSpec() {
    const bodyStyle = window.getComputedStyle(document.body);
    const htmlStyle = window.getComputedStyle(document.documentElement);

    // 1. Page Background & Text
    const bodyBg = rgbToHex(bodyStyle.backgroundColor) || rgbToHex(htmlStyle.backgroundColor);
    const bodyText = rgbToHex(bodyStyle.color);
    const isLightBg = bodyBg ? getLuminance(bodyBg) > 0.5 : true;

    const getElementLabel = (element) => {
      const label = element.getAttribute('aria-label') || element.value || element.textContent || element.tagName;
      return label.replace(/\s+/g, ' ').trim().slice(0, 80) || element.tagName.toLowerCase();
    };

    // 2. Color Semantic Analysis with Frequency & Role Mapping
    const colorUsageMap = new Map();

    const recordColor = (hex, usageTag) => {
      if (!hex || hex === 'transparent' || hex === '#00000000') return;
      if (!colorUsageMap.has(hex)) {
        colorUsageMap.set(hex, { hex, frequency: 0, usage: new Set() });
      }
      const item = colorUsageMap.get(hex);
      item.frequency += 1;
      if (usageTag) item.usage.add(usageTag);
    };

    if (bodyBg) recordColor(bodyBg, "background");
    if (bodyText) recordColor(bodyText, "text");

    // Scan sample elements for color roles
    const elementsToScan = Array.from(document.querySelectorAll('header, nav, button, a, card, section, article, div, input, h1, h2, h3')).slice(0, 150);
    elementsToScan.forEach(el => {
      try {
        const st = window.getComputedStyle(el);
        const bg = rgbToHex(st.backgroundColor);
        const fg = rgbToHex(st.color);
        const border = rgbToHex(st.borderColor);

        const tagName = el.tagName.toLowerCase();
        if (bg) recordColor(bg, tagName === 'button' ? 'button-bg' : tagName === 'header' || tagName === 'nav' ? 'header-bg' : 'surface');
        if (fg) recordColor(fg, tagName.startsWith('h') ? 'heading' : 'text');
        if (border && st.borderWidth !== '0px') recordColor(border, 'border');
      } catch (_) {}
    });

    const sortedColors = Array.from(colorUsageMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(c => ({
        hex: c.hex,
        frequency: c.frequency,
        usage: Array.from(c.usage),
        role: c.usage.has("button-bg") ? "brand-action" : c.usage.has("background") ? "canvas-bg" : c.usage.has("surface") ? "surface-bg" : c.usage.has("heading") ? "heading-text" : "accent"
      }));

    // 3. Component Geometry Analysis
    // Header & Nav
    const headerEl = document.querySelector('header') || document.querySelector('nav') || document.querySelector('.header');
    let headerSpec = null;
    if (headerEl) {
      const hSt = window.getComputedStyle(headerEl);
      const navLinks = headerEl.querySelectorAll('a, button');
      headerSpec = {
        label: getElementLabel(headerEl),
        height: hSt.height,
        position: hSt.position,
        backgroundColor: rgbToHex(hSt.backgroundColor),
        borderBottom: hSt.borderBottomWidth !== '0px' ? `${hSt.borderBottomWidth} ${hSt.borderBottomStyle} ${rgbToHex(hSt.borderColor)}` : 'none',
        navItemsCount: navLinks.length,
        padding: `${hSt.paddingTop} ${hSt.paddingRight}`
      };
    }

    // Hero Section
    const heroEl = document.querySelector('.hero, section:first-of-type, main > section:first-child');
    let heroSpec = null;
    if (heroEl) {
      const heroSt = window.getComputedStyle(heroEl);
      const h1Inside = heroEl.querySelector('h1');
      const ctaInside = heroEl.querySelector('button, a.btn');
      heroSpec = {
        label: getElementLabel(heroEl),
        hasTwoColumns: heroEl.querySelectorAll('img, video, svg').length > 0 && heroEl.querySelectorAll('div').length > 1,
        headingText: h1Inside ? h1Inside.textContent.trim().slice(0, 60) : null,
        ctaText: ctaInside ? ctaInside.textContent.trim().slice(0, 30) : null,
        padding: `${heroSt.paddingTop} ${heroSt.paddingRight}`
      };
    }

    // Primary Buttons
    const buttonEls = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]')).slice(0, 5);
    const buttonsSpec = buttonEls.map(btn => {
      const bSt = window.getComputedStyle(btn);
      return {
        label: getElementLabel(btn),
        height: bSt.height,
        backgroundColor: rgbToHex(bSt.backgroundColor),
        color: rgbToHex(bSt.color),
        borderRadius: bSt.borderRadius,
        fontWeight: bSt.fontWeight,
        fontSize: bSt.fontSize,
        padding: `${bSt.paddingTop} ${bSt.paddingRight}`
      };
    });

    // Cards / Surfaces
    const cardEls = Array.from(document.querySelectorAll('.card, article, section div[class*="card"]')).slice(0, 5);
    const cardsSpec = cardEls.map(card => {
      const cSt = window.getComputedStyle(card);
      return {
        label: getElementLabel(card),
        backgroundColor: rgbToHex(cSt.backgroundColor),
        borderRadius: cSt.borderRadius,
        border: cSt.borderWidth !== '0px' ? `${cSt.borderWidth} ${cSt.borderStyle} ${rgbToHex(cSt.borderColor)}` : 'none',
        shadow: cSt.boxShadow !== 'none' ? cSt.boxShadow : null,
        padding: `${cSt.paddingTop} ${cSt.paddingRight}`
      };
    });

    // 4. Typography Scale
    const h1El = document.querySelector('h1');
    const h2El = document.querySelector('h2');
    const h3El = document.querySelector('h3');

    const h1St = h1El ? window.getComputedStyle(h1El) : null;
    const h2St = h2El ? window.getComputedStyle(h2El) : null;
    const h3St = h3El ? window.getComputedStyle(h3El) : null;

    const typography = {
      fontFamily: bodyStyle.fontFamily ? bodyStyle.fontFamily.replace(/["']/g, '') : null,
      bodySize: bodyStyle.fontSize,
      bodyWeight: bodyStyle.fontWeight,
      bodyLineHeight: bodyStyle.lineHeight,
      h1Size: h1St ? h1St.fontSize : null,
      h1Weight: h1St ? h1St.fontWeight : null,
      h2Size: h2St ? h2St.fontSize : null,
      h2Weight: h2St ? h2St.fontWeight : null,
      h3Size: h3St ? h3St.fontSize : null
    };

    // 5. Real DOM Page Architecture Tree Extractor
    function buildDomTreeNode(element, depth = 0) {
      if (!element || depth > 3) return null;
      const tagName = element.tagName ? element.tagName.toUpperCase() : 'DIV';
      const idStr = element.id ? `#${element.id}` : '';
      let classStr = '';
      try {
        const clsList = Array.from(element.classList || []).filter(c => !c.includes(':')).slice(0, 2);
        if (clsList.length) classStr = `.${clsList.join('.')}`;
      } catch (_) {}

      const hEl = element.querySelector('h1, h2, h3, h4');
      const headingText = hEl ? `${hEl.tagName}: "${hEl.textContent.trim().slice(0, 40)}"` : null;

      const linksCount = element.querySelectorAll('a').length;
      const buttonsCount = element.querySelectorAll('button').length;
      const imgCount = element.querySelectorAll('img, svg').length;

      const statsArr = [];
      if (linksCount > 0) statsArr.push(`${linksCount} Links`);
      if (buttonsCount > 0) statsArr.push(`${buttonsCount} Buttons`);
      if (imgCount > 0) statsArr.push(`${imgCount} Media`);

      // Find semantic child containers
      const childContainers = Array.from(element.children).filter(child => {
        const tag = child.tagName ? child.tagName.toUpperCase() : '';
        const cls = (child.className || '').toString().toLowerCase();
        return ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER', 'FORM', 'DIV'].includes(tag) &&
               (tag !== 'DIV' || cls.includes('hero') || cls.includes('card') || cls.includes('grid') || cls.includes('container') || cls.includes('nav') || cls.includes('wrapper') || cls.includes('banner') || child.querySelector('h1, h2, h3'));
      }).slice(0, 6);

      const childrenNodes = childContainers
        .map(child => buildDomTreeNode(child, depth + 1))
        .filter(Boolean);

      return {
        tag: tagName,
        id: idStr,
        class: classStr,
        heading: headingText,
        stats: statsArr.join(' • '),
        children: childrenNodes
      };
    }

    const mainContainer = document.querySelector('main') || document.body;
    const structureTree = {
      tag: 'DOCUMENT',
      children: Array.from(document.body.children)
        .filter(child => ['HEADER', 'NAV', 'MAIN', 'SECTION', 'FOOTER', 'FORM', 'DIV'].includes(child.tagName))
        .slice(0, 8)
        .map(child => buildDomTreeNode(child, 1))
        .filter(Boolean)
    };

    // 6. Container & Layout Grid
    const containerEl = document.querySelector('main, .container, #app, #root');
    const containerSt = containerEl ? window.getComputedStyle(containerEl) : null;
    const containerWidth = containerSt && containerSt.maxWidth !== 'none' ? containerSt.maxWidth : null;

    return {
      metadata: {
        extractedAt: new Date().toISOString(),
        isLightMode: isLightBg,
        title: document.title
      },
      colors: sortedColors,
      background: bodyBg,
      textColor: bodyText,
      typography,
      spacing: {
        containerWidth: containerWidth,
        padding: bodyStyle.padding
      },
      components: {
        header: headerSpec,
        hero: heroSpec,
        buttons: buttonsSpec,
        cards: cardsSpec
      },
      structureTree: structureTree
    };
  }

  // Chrome runtime listener
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "EXTRACT_DESIGN_SPEC") {
        const spec = extractDesignSpec();
        sendResponse({ success: true, designSpec: spec });
      }
      return true;
    });
  }

  window.__StackVibe_extractDesignSpec = extractDesignSpec;
})();
