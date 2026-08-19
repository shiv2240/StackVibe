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

    // Helper: Determine Section Type & Role
    function detectSectionRole(el, headingText = '') {
      const cls = (el.className || '').toString().toLowerCase();
      const id = (el.id || '').toLowerCase();
      const heading = headingText.toLowerCase();

      if (id.includes('hero') || cls.includes('hero') || el.querySelector('h1')) return 'Hero Banner Section';
      if (id.includes('feature') || cls.includes('feature') || heading.includes('feature')) return 'Feature Showcase Grid';
      if (id.includes('pricing') || cls.includes('pricing') || heading.includes('plan') || heading.includes('pricing')) return 'Pricing & Plans Table';
      if (id.includes('testimonial') || cls.includes('testimonial') || cls.includes('review') || heading.includes('review')) return 'Testimonials & Reviews';
      if (id.includes('faq') || cls.includes('faq') || cls.includes('accordion') || heading.includes('faq')) return 'FAQ Accordion';
      if (id.includes('cta') || cls.includes('cta') || cls.includes('banner') || heading.includes('get started')) return 'Call To Action (CTA) Banner';
      if (id.includes('footer') || cls.includes('footer') || el.tagName === 'FOOTER') return 'Footer Navigation';
      if (id.includes('team') || cls.includes('team') || heading.includes('team')) return 'Team & About Section';
      if (id.includes('stat') || cls.includes('stat') || cls.includes('metric')) return 'Metrics & Statistics Grid';
      if (el.querySelectorAll('img, video, canvas, iframe').length >= 2) return 'Media & Gallery Showcase';
      if (el.querySelectorAll('form, input').length >= 1) return 'Interactive Form Container';
      return 'Content Layout Block';
    }

    // 3. Complete Component & Sectional Geometry Extractor
    // Header & Nav
    const headerEl = document.querySelector('header, nav, .header, #header, [role="banner"]');
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
    const heroEl = document.querySelector('.hero, section:first-of-type, main > section:first-child, #hero');
    let heroSpec = null;
    if (heroEl) {
      const heroSt = window.getComputedStyle(heroEl);
      const h1Inside = heroEl.querySelector('h1, h2');
      const pInside = heroEl.querySelector('p');
      const ctaInside = heroEl.querySelector('button, a.btn, input[type="submit"]');
      heroSpec = {
        label: getElementLabel(heroEl),
        hasTwoColumns: heroEl.querySelectorAll('img, video, svg').length > 0 && heroEl.querySelectorAll('div').length > 1,
        headingText: h1Inside ? h1Inside.textContent.trim().slice(0, 65) : null,
        subheadingText: pInside ? pInside.textContent.trim().slice(0, 80) : null,
        ctaText: ctaInside ? ctaInside.textContent.trim().slice(0, 35) : null,
        backgroundColor: rgbToHex(heroSt.backgroundColor),
        padding: `${heroSt.paddingTop} ${heroSt.paddingRight}`
      };
    }

    // All Page Sections (Scan ALL major sections across document)
    const rawSectionEls = Array.from(document.querySelectorAll('main > section, main > article, main > div, body > section, section, article, [role="main"] > section')).slice(0, 15);
    const sectionEls = [];
    const seenEls = new Set();
    for (const sec of rawSectionEls) {
      if (seenEls.has(sec)) continue;
      try {
        const rect = sec.getBoundingClientRect();
        if (rect.height < 50) continue; // Skip invisible / tiny spacers
      } catch (_) {}
      seenEls.add(sec);
      sectionEls.push(sec);
      if (sectionEls.length >= 12) break;
    }

    const sectionsSpec = sectionEls.map((sec, idx) => {
      const sSt = window.getComputedStyle(sec);
      const headingEl = sec.querySelector('h1, h2, h3, h4');
      const headingText = headingEl ? headingEl.textContent.trim().slice(0, 60) : `Section ${idx + 1}`;
      const pEl = sec.querySelector('p');
      const descriptionText = pEl ? pEl.textContent.trim().slice(0, 80) : null;
      const role = detectSectionRole(sec, headingText);
      const itemsCount = sec.querySelectorAll('.card, article, li, div[class*="item"], div[class*="card"], div[class*="col"]').length;
      const buttonsCount = sec.querySelectorAll('button, a.btn').length;

      const directChildren = Array.from(sec.children || []).filter(c => c.tagName === 'DIV' || c.tagName === 'ARTICLE');
      let colLayout = 'Single Column Flow';
      if (directChildren.length >= 4 || itemsCount >= 4) colLayout = '4-Column Grid';
      else if (directChildren.length >= 3 || itemsCount >= 3) colLayout = '3-Column Grid';
      else if (directChildren.length >= 2 || itemsCount >= 2) colLayout = '2-Column Split';

      return {
        id: sec.id ? `#${sec.id}` : `section-${idx + 1}`,
        tag: sec.tagName.toLowerCase(),
        title: headingText,
        description: descriptionText,
        role: role,
        layout: colLayout,
        itemsCount: itemsCount,
        buttonsCount: buttonsCount,
        height: sSt.height,
        backgroundColor: rgbToHex(sSt.backgroundColor),
        color: rgbToHex(sSt.color),
        padding: `${sSt.paddingTop} ${sSt.paddingRight}`,
        borderRadius: sSt.borderRadius,
        border: sSt.borderWidth !== '0px' ? `${sSt.borderWidth} ${sSt.borderStyle} ${rgbToHex(sSt.borderColor)}` : 'none'
      };
    });

    // Footer Section
    const footerEl = document.querySelector('footer, .footer, #footer, [role="contentinfo"]');
    let footerSpec = null;
    if (footerEl) {
      const fSt = window.getComputedStyle(footerEl);
      const fLinks = footerEl.querySelectorAll('a');
      const fCols = footerEl.querySelectorAll('div[class*="col"], div > ul, div > div');
      const fText = footerEl.textContent.trim();
      const copyrightMatch = fText.match(/©[^.\n]+/i) || fText.match(/copyright[^.\n]+/i);

      footerSpec = {
        label: getElementLabel(footerEl),
        height: fSt.height,
        backgroundColor: rgbToHex(fSt.backgroundColor),
        color: rgbToHex(fSt.color),
        linksCount: fLinks.length,
        columnsCount: Math.max(1, fCols.length),
        copyrightText: copyrightMatch ? copyrightMatch[0].trim().slice(0, 60) : null,
        padding: `${fSt.paddingTop} ${fSt.paddingRight}`
      };
    }

    // Action Buttons (Scan up to 10 distinct action buttons)
    const buttonEls = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"], [role="button"]')).slice(0, 10);
    const buttonsSpec = buttonEls.map((btn, idx) => {
      const bSt = window.getComputedStyle(btn);
      return {
        id: `button-${idx + 1}`,
        label: getElementLabel(btn) || `Action Button ${idx + 1}`,
        height: bSt.height,
        backgroundColor: rgbToHex(bSt.backgroundColor),
        color: rgbToHex(bSt.color),
        borderRadius: bSt.borderRadius,
        fontWeight: bSt.fontWeight,
        fontSize: bSt.fontSize,
        border: bSt.borderWidth !== '0px' ? `${bSt.borderWidth} ${bSt.borderStyle} ${rgbToHex(bSt.borderColor)}` : 'none',
        padding: `${bSt.paddingTop} ${bSt.paddingRight}`
      };
    });

    // Cards / Surfaces (Scan up to 10 distinct cards)
    const cardEls = Array.from(document.querySelectorAll('.card, article, section div[class*="card"], div[class*="card"], div[class*="box"], div[class*="tile"]')).slice(0, 10);
    const cardsSpec = cardEls.map((card, idx) => {
      const cSt = window.getComputedStyle(card);
      const hEl = card.querySelector('h1, h2, h3, h4, strong');
      return {
        id: `card-${idx + 1}`,
        label: hEl ? hEl.textContent.trim().slice(0, 40) : getElementLabel(card) || `Surface Card ${idx + 1}`,
        backgroundColor: rgbToHex(cSt.backgroundColor),
        color: rgbToHex(cSt.color),
        borderRadius: cSt.borderRadius,
        border: cSt.borderWidth !== '0px' ? `${cSt.borderWidth} ${cSt.borderStyle} ${rgbToHex(cSt.borderColor)}` : 'none',
        shadow: cSt.boxShadow !== 'none' ? cSt.boxShadow : null,
        padding: `${cSt.paddingTop} ${cSt.paddingRight}`
      };
    });

    // Form Containers & Inputs
    const formEls = Array.from(document.querySelectorAll('form, div[class*="form"], div[class*="newsletter"], div[class*="search"]')).slice(0, 4);
    const formsSpec = formEls.map((form, idx) => {
      const inputs = form.querySelectorAll('input, select, textarea');
      const submitBtn = form.querySelector('button, input[type="submit"]');
      return {
        id: `form-${idx + 1}`,
        label: getElementLabel(form) || `Form Container ${idx + 1}`,
        inputsCount: inputs.length,
        hasSubmit: !!submitBtn,
        submitText: submitBtn ? submitBtn.textContent.trim().slice(0, 30) : null
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

    // 5. Complete DOM Page Architecture Tree Extractor
    function buildDomTreeNode(element, depth = 0, maxDepth = 6) {
      if (!element || depth > maxDepth) return null;

      const tagName = element.tagName ? element.tagName.toUpperCase() : 'DIV';

      // Exclude non-visual / script / style / svg sub-elements
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'TEMPLATE', 'SVG', 'PATH', 'IFRAME'].includes(tagName)) {
        return null;
      }

      // Computed dimensions / bounds
      let boundsStr = '';
      try {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          boundsStr = `${Math.round(rect.width)}×${Math.round(rect.height)}px`;
        }
      } catch (_) {}

      // ID & CSS Classes
      const idStr = element.id ? `#${element.id}` : '';
      let classStr = '';
      try {
        if (typeof element.className === 'string' && element.className.trim()) {
          const clsList = element.className.trim().split(/\s+/).filter(c => !c.includes(':') && !c.includes('{') && !c.includes('/')).slice(0, 3);
          if (clsList.length) classStr = `.${clsList.join('.')}`;
        }
      } catch (_) {}

      // Heading or direct text preview
      let headingText = null;
      const directHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
      if (directHeading && directHeading.textContent.trim()) {
        headingText = `${directHeading.tagName.toUpperCase()}: "${directHeading.textContent.trim().slice(0, 45)}"`;
      } else {
        const ariaLabel = element.getAttribute && element.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim()) {
          headingText = `Label: "${ariaLabel.trim().slice(0, 35)}"`;
        }
      }

      // Child element statistics
      const linksCount = element.querySelectorAll('a').length;
      const buttonsCount = element.querySelectorAll('button, input[type="button"], input[type="submit"]').length;
      const mediaCount = element.querySelectorAll('img, video, canvas').length;
      const inputCount = element.querySelectorAll('input, select, textarea').length;

      const statsArr = [];
      if (boundsStr) statsArr.push(boundsStr);
      if (linksCount > 0) statsArr.push(`${linksCount} ${linksCount === 1 ? 'Link' : 'Links'}`);
      if (buttonsCount > 0) statsArr.push(`${buttonsCount} ${buttonsCount === 1 ? 'Button' : 'Buttons'}`);
      if (mediaCount > 0) statsArr.push(`${mediaCount} Media`);
      if (inputCount > 0) statsArr.push(`${inputCount} Inputs`);

      // Filter visual child elements
      const validChildren = Array.from(element.children || []).filter(child => {
        if (!child || !child.tagName) return false;
        const tag = child.tagName.toUpperCase();
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'TEMPLATE', 'SVG', 'PATH', 'BR', 'HR'].includes(tag)) return false;
        return true;
      });

      const childrenNodes = validChildren
        .slice(0, 10)
        .map(child => buildDomTreeNode(child, depth + 1, maxDepth))
        .filter(Boolean);

      return {
        tag: tagName,
        id: idStr,
        class: classStr,
        heading: headingText,
        stats: statsArr.join(' • '),
        nodeCount: childrenNodes.length,
        children: childrenNodes
      };
    }

    const totalDomElements = document.querySelectorAll('*').length;
    const bodyChildren = Array.from(document.body.children || []).filter(el => {
      const tag = el.tagName ? el.tagName.toUpperCase() : '';
      return !['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'TEMPLATE', 'SVG'].includes(tag);
    });

    const structureTree = {
      tag: 'DOCUMENT',
      id: document.body.id ? `#${document.body.id}` : '',
      class: typeof document.body.className === 'string' && document.body.className ? `.${document.body.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '',
      stats: `${totalDomElements} Total DOM Nodes Inspected`,
      children: bodyChildren.slice(0, 12).map(child => buildDomTreeNode(child, 1, 6)).filter(Boolean)
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
        sections: sectionsSpec,
        footer: footerSpec,
        buttons: buttonsSpec,
        cards: cardsSpec,
        forms: formsSpec
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
