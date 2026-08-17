/**
 * StackVibe - Developer Inspection Console Controller v2.0
 * Pure evidence-based scanner UI with state management, HTML escaping, structural inspection, JSON export, and Security Question Password Recovery.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Auth & Storage
  const auth = new AuthManager();
  await auth.init();

  // Initial Scan State Object
  let scanState = {
    status: "idle",
    tab: { id: null, url: "", title: "", favicon: "" },
    scan: { startedAt: null, completedAt: null, durationMs: 0, detectorVersion: "2.0.0" },
    techStack: [],
    designSpec: {},
    errors: []
  };

  let selectedAiTarget = "claude";
  let selectedAiTask = "reconstruct";
  let selectedAiFidelity = "exact";

  // DOM Elements
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector(".theme-icon") : null;

  const authBtn = document.getElementById("authBtn");
  const userBtnLabel = document.getElementById("userBtnLabel");
  const authBanner = document.getElementById("authBanner");
  const bannerSignUpBtn = document.getElementById("bannerSignUpBtn");

  const scanStatusBadge = document.getElementById("scanStatusBadge");
  const statusLabel = document.getElementById("statusLabel");

  const siteTitle = document.getElementById("siteTitle");
  const siteUrl = document.getElementById("siteUrl");
  const rescanBtn = document.getElementById("rescanBtn");

  const tabBtns = document.querySelectorAll(".nav-icon-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  const healthScoreVal = document.getElementById("healthScoreVal");
  const metricTech = document.getElementById("metricTech");
  const metricSignals = document.getElementById("metricSignals");
  const metricDuration = document.getElementById("metricDuration");
  const qualityBarFill = document.getElementById("qualityBarFill");
  const overviewStackList = document.getElementById("overviewStackList");
  const overviewThemeBox = document.getElementById("overviewThemeBox");

  const techStackList = document.getElementById("techStackList");
  const stackCountBadge = document.getElementById("stackCountBadge");

  const colorSwatches = document.getElementById("colorSwatches");
  const typographyBox = document.getElementById("typographyBox");
  const tokensBox = document.getElementById("tokensBox");

  const structureTreeBox = document.getElementById("structureTreeBox");
  const componentsGrid = document.getElementById("componentsGrid");

  const aiTargetCardsSm = document.querySelectorAll(".ai-target-card-sm");
  const aiTaskSelect = document.getElementById("aiTaskSelect");
  const aiFidelitySelect = document.getElementById("aiFidelitySelect");
  const pillTechCount = document.getElementById("pillTechCount");
  const pillColorCount = document.getElementById("pillColorCount");
  const pillCompCount = document.getElementById("pillCompCount");
  const aiTargetTitle = document.getElementById("aiTargetTitle");
  const aiPromptPreview = document.getElementById("aiPromptPreview");
  const copyAiPromptBtn = document.getElementById("copyAiPromptBtn");

  const mixHeroSelect = document.getElementById("mixHeroSelect");
  const mixNavSelect = document.getElementById("mixNavSelect");
  const mixButtonSelect = document.getElementById("mixButtonSelect");
  const mixCardSelect = document.getElementById("mixCardSelect");
  const copyMixPromptBtn = document.getElementById("copyMixPromptBtn");
  const mixPromptPreview = document.getElementById("mixPromptPreview");

  const snapLibraryGrid = document.getElementById("snapLibraryGrid");
  const librarySearchInput = document.getElementById("librarySearchInput");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  const copyFullScanJsonBtn = document.getElementById("copyFullScanJsonBtn");
  const copyStackJsonBtn = document.getElementById("copyStackJsonBtn");
  const copyDesignJsonBtn = document.getElementById("copyDesignJsonBtn");
  const copyMarkdownBtn = document.getElementById("copyMarkdownBtn");

  const toast = document.getElementById("toast");

  // Auth Modal Elements
  const authModal = document.getElementById("authModal");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const modalTabRegister = document.getElementById("modalTabRegister");
  const modalTabLogin = document.getElementById("modalTabLogin");
  const modalTabForgot = document.getElementById("modalTabForgot");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  const authForm = document.getElementById("authForm");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const nameFieldGroup = document.getElementById("nameFieldGroup");
  const roleFieldGroup = document.getElementById("roleFieldGroup");
  const securityQuestionFieldGroup = document.getElementById("securityQuestionFieldGroup");
  const securityAnswerFieldGroup = document.getElementById("securityAnswerFieldGroup");
  const passwordFieldGroup = document.getElementById("passwordFieldGroup");

  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const forgotEmailInput = document.getElementById("forgotEmailInput");
  const fetchSecurityQuestionBtn = document.getElementById("fetchSecurityQuestionBtn");
  const forgotStep2Group = document.getElementById("forgotStep2Group");
  const displaySecurityQuestionText = document.getElementById("displaySecurityQuestionText");
  const forgotAnswerInput = document.getElementById("forgotAnswerInput");
  const forgotNewPasswordInput = document.getElementById("forgotNewPasswordInput");

  const userProfileView = document.getElementById("userProfileView");
  const logoutBtn = document.getElementById("logoutBtn");
  const updateRoleBtn = document.getElementById("updateRoleBtn");
  const editProfileRoleSelect = document.getElementById("editProfileRoleSelect");

  let authMode = "register"; // "register" | "login" | "forgot"

  // --- XSS Escaping Helper ---
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Value Display Helper (Zero Hallucination) ---
  function displayValue(val, fallback = "Not detected") {
    if (val === undefined || val === null || val === "" || val === "none") return fallback;
    return escapeHtml(val);
  }

  // Initialize Theme
  let currentTheme = "light";
  const savedTheme = await StorageUtil.get("stackvibe_theme");
  if (savedTheme) currentTheme = savedTheme;
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (themeIcon) themeIcon.textContent = currentTheme === "light" ? "☀️" : "🌙";

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", async () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", currentTheme);
      if (themeIcon) themeIcon.textContent = currentTheme === "light" ? "☀️" : "🌙";
      await StorageUtil.set("stackvibe_theme", currentTheme);
      showToast(`Switched to ${currentTheme} mode`);
    });
  }

  function updateAuthUI() {
    if (auth.currentUser) {
      userBtnLabel.textContent = escapeHtml(auth.currentUser.name);
      authBanner.style.display = "none";
    } else {
      userBtnLabel.textContent = "Account";
      authBanner.style.display = "flex";
    }
  }

  updateAuthUI();

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  async function copyToClipboard(text, msg = "Copied to clipboard!") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch (e) {
      showToast("Failed to copy");
    }
  }

  function updateScanStatus(status, labelText) {
    scanState.status = status;
    scanStatusBadge.className = `status-badge ${status}`;
    statusLabel.textContent = labelText;
  }

  // --- Tab Navigation ---
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add("active");

      if (btn.dataset.tab === "tab-history") {
        renderSnapLibrary();
      }
    });
  });

  // --- Core Page Inspection Execution ---
  async function runScan() {
    updateScanStatus("scanning", "Scanning...");
    scanState.scan.startedAt = Date.now();
    scanState.errors = [];

    siteTitle.textContent = "Inspecting Web Page...";
    siteUrl.textContent = "Connecting to tab...";

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          renderScanError("No active browser tab found.");
          return;
        }

        const tab = tabs[0];
        scanState.tab.id = tab.id;
        scanState.tab.url = tab.url || "https://example.com";
        scanState.tab.title = tab.title || "Active Web Page";

        siteTitle.textContent = scanState.tab.title;
        siteUrl.textContent = scanState.tab.url;

        chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_DATA" }, (res) => {
          scanState.scan.completedAt = Date.now();
          scanState.scan.durationMs = scanState.scan.completedAt - scanState.scan.startedAt;

          if (res && res.success) {
            scanState.techStack = res.techStack || [];
            scanState.designSpec = res.designSpec || {};
            updateScanStatus("success", `Complete · ${scanState.scan.durationMs}ms`);
            renderAllPanels();
          } else {
            renderScanError(res?.error || "Unable to inspect target tab.");
          }
        });
      });
    } else {
      renderScanError("Extension environment API unavailable.");
    }
  }

  function renderScanError(errMsg) {
    updateScanStatus("error", "Scan Failed");
    scanState.errors.push(errMsg);

    siteTitle.textContent = "Inspection Error";
    siteUrl.textContent = errMsg;

    techStackList.innerHTML = `
      <div class="stack-card">
        <div class="stack-icon" style="color:var(--danger)">✖</div>
        <div class="stack-meta">
          <span class="stack-name">Inspection Failed</span>
          <p class="stack-desc">${escapeHtml(errMsg)}. Click "Inspect Page" to retry.</p>
        </div>
      </div>
    `;
  }

  async function renderAllPanels() {
    renderOverviewPanel();
    renderTechStackPanel();
    renderDesignForensicsPanel();
    renderPageStructureTree();
    renderComponentBlueprints();
    renderAIReconstructionPanel();
    renderDesignMixer();

    await auth.saveScan({
      url: scanState.tab.url,
      title: scanState.tab.title,
      techStack: scanState.techStack,
      designSpec: scanState.designSpec
    });
  }

  // --- 1. Overview & Health Panel ---
  function renderOverviewPanel() {
    const techCount = scanState.techStack.length;
    const signalCount = scanState.techStack.reduce((acc, item) => acc + (item.evidence ? item.evidence.length : 1), 0);
    const duration = scanState.scan.durationMs;

    let qualityScore = 95;
    if (techCount === 0) qualityScore = 40;

    healthScoreVal.textContent = `${qualityScore}%`;
    metricTech.textContent = techCount;
    metricSignals.textContent = signalCount;
    metricDuration.textContent = `${duration}ms`;
    qualityBarFill.style.width = `${qualityScore}%`;

    overviewStackList.innerHTML = scanState.techStack.slice(0, 4).map(item => `
      <div class="compact-item">
        <span>${escapeHtml(item.name)}</span>
        <span class="confidence-badge">${item.confidence || 95}%</span>
      </div>
    `).join('') || `<p class="panel-desc">No technologies detected</p>`;

    const bg = scanState.designSpec.background;
    const text = scanState.designSpec.textColor;
    overviewThemeBox.innerHTML = `
      <div>Canvas BG: <code>${displayValue(bg)}</code></div>
      <div>Body Text: <code>${displayValue(text)}</code></div>
      <div>Mode: <strong>${scanState.designSpec.metadata?.isLightMode ? 'Light Surface' : 'Dark Surface'}</strong></div>
    `;
  }

  // --- 2. Tech Stack Panel ---
  function renderTechStackPanel() {
    const stack = scanState.techStack;
    stackCountBadge.textContent = `${stack.length} Detected`;

    if (stack.length === 0) {
      techStackList.innerHTML = `<p class="panel-desc">No technology signatures detected.</p>`;
      return;
    }

    techStackList.innerHTML = stack.map(item => {
      const conf = item.confidence || 95;
      const evidenceList = item.evidence || [];
      const isDirect = conf >= 90 || evidenceList.some(e => e.includes("DOM") || e.includes("global"));

      return `
        <div class="stack-card">
          <div class="stack-icon" style="color: ${item.color}">${item.icon || '⚡'}</div>
          <div class="stack-meta" style="flex:1;">
            <div class="stack-title-row" style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
              <span class="stack-name">${escapeHtml(item.name)}</span>
              <div style="display:flex; gap:4px; align-items:center;">
                <span class="category-tag">${escapeHtml(item.category)}</span>
                <span class="detection-type-tag">${isDirect ? 'Direct' : 'Inferred'}</span>
                <span class="confidence-badge">${conf}%</span>
              </div>
            </div>
            <p class="stack-desc" style="margin-top:2px; font-size:10px; color:var(--text-muted);">${escapeHtml(item.description)}</p>
            ${evidenceList.length ? `
              <div class="evidence-tags" style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                <span style="font-size:9px; font-weight:700; color:var(--text-muted);">Evidence:</span>
                ${evidenceList.map(e => `<span class="evidence-pill">${escapeHtml(e)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 3. Design Forensics Panel ---
  function renderDesignForensicsPanel() {
    const spec = scanState.designSpec || {};

    colorSwatches.innerHTML = (spec.colors || []).length > 0
      ? spec.colors.map(c => `
        <div class="swatch-card">
          <div class="swatch-color" style="background-color: ${c.hex};"></div>
          <div class="swatch-meta">
            <span class="swatch-hex">${escapeHtml(c.hex)}</span>
            <span class="swatch-role">${escapeHtml(c.role || "Accent")}</span>
          </div>
        </div>
      `).join('')
      : `<p class="panel-desc">No color swatches computed.</p>`;

    const typo = spec.typography || {};
    typographyBox.innerHTML = `
      <div><strong>Font Family:</strong> <code>${displayValue(typo.fontFamily)}</code></div>
      <div><strong>H1 Size:</strong> ${displayValue(typo.h1Size)} (${displayValue(typo.h1Weight, "Normal")})</div>
      <div><strong>Body Size:</strong> ${displayValue(typo.bodySize)} (Line Height: ${displayValue(typo.bodyLineHeight, "Normal")})</div>
    `;

    const spacing = spec.spacing || {};
    tokensBox.innerHTML = `
      <div class="token-item">
        <span>Container Max Width:</span>
        <code>${displayValue(spacing.containerWidth)}</code>
      </div>
      <div class="token-item">
        <span>Canvas Background:</span>
        <code>${displayValue(spec.background)}</code>
      </div>
      <div class="token-item">
        <span>Primary Text:</span>
        <code>${displayValue(spec.textColor)}</code>
      </div>
    `;
  }

  // --- 4. Page Structure Tree ---
  function renderPageStructureTree() {
    const comps = scanState.designSpec.components || {};

    let html = `
      <div class="tree-node">
        <span class="tree-tag">&lt;DOCUMENT&gt;</span>
        <div class="tree-node">
          <span class="tree-tag">&lt;HEADER&gt;</span> <span class="tree-info">${comps.header ? `Height ${comps.header.height || 'auto'} • ${comps.header.navItemsCount || 0} Links` : 'Standard Navigation'}</span>
        </div>
        <div class="tree-node">
          <span class="tree-tag">&lt;HERO&gt;</span> <span class="tree-info">${comps.hero ? `${comps.hero.hasTwoColumns ? 'Two-Column Split' : 'Single Column'} • Heading: "${escapeHtml(comps.hero.headingText || 'N/A')}"` : 'Hero Section'}</span>
        </div>
        <div class="tree-node">
          <span class="tree-tag">&lt;COMPONENTS&gt;</span> <span class="tree-info">${comps.buttons ? comps.buttons.length : 0} Inspected Buttons • ${comps.cards ? comps.cards.length : 0} Inspected Cards</span>
        </div>
        <div class="tree-node">
          <span class="tree-tag">&lt;FOOTER&gt;</span> <span class="tree-info">Footer Section</span>
        </div>
      </div>
    `;

    structureTreeBox.innerHTML = html;
  }

  // --- 5. Component Blueprints ---
  function renderComponentBlueprints() {
    const spec = scanState.designSpec || {};
    const comps = spec.components || {};
    const siteTitleText = scanState.tab.title || scanState.tab.url || "Target Webpage";

    const blueprints = [];

    if (comps.header) {
      const h = comps.header;
      blueprints.push({
        title: "Navigation Header",
        previewHtml: `<div style="width:100%;height:34px;background:${h.backgroundColor || 'var(--bg-main)'};display:flex;align-items:center;justify-content:space-between;padding:0 8px;border-bottom:${h.borderBottom || '1px solid var(--border-color)'};border-radius:6px;font-size:10px;"><span>Logo</span><span style="color:var(--text-muted);">${h.navItemsCount || 0} Links</span></div>`,
        prompt: `RECONSTRUCTION DIRECTIVE: Reconstruct Navigation Header inspired by ${siteTitleText}.\n- Height: ${h.height || 'auto'}\n- Position: ${h.position || 'relative'}\n- Background: ${h.backgroundColor || 'Extracted'}\n- Navigation Items Count: ${h.navItemsCount || 0}`
      });
    }

    if (comps.hero) {
      const hero = comps.hero;
      blueprints.push({
        title: "Hero Banner",
        previewHtml: `<div style="width:100%;padding:8px;background:var(--bg-main);border:1px solid var(--border-color);border-radius:6px;font-size:10px;"><strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(hero.headingText || 'Hero Banner')}</strong><span style="font-size:8px;color:var(--text-muted);">${hero.hasTwoColumns ? 'Two-Column Split' : 'Single Column'}</span></div>`,
        prompt: `RECONSTRUCTION DIRECTIVE: Reconstruct Hero Section inspired by ${siteTitleText}.\n- Layout: ${hero.hasTwoColumns ? 'Two-Column Split' : 'Single Column'}\n- Heading: "${hero.headingText || 'N/A'}"\n- Primary CTA: "${hero.ctaText || 'N/A'}"`
      });
    }

    if (comps.buttons && comps.buttons.length > 0) {
      comps.buttons.slice(0, 2).forEach((btn, idx) => {
        blueprints.push({
          title: `Action Button ${idx + 1}`,
          previewHtml: `<button style="background:${btn.backgroundColor || 'var(--primary)'};color:${btn.color || '#FFF'};border-radius:${btn.borderRadius || '6px'};padding:6px 12px;border:none;font-size:10px;font-weight:${btn.fontWeight || '700'};">Button ${idx + 1}</button>`,
          prompt: `RECONSTRUCTION DIRECTIVE: Reconstruct Action Button inspired by ${siteTitleText}.\n- Height: ${btn.height || 'auto'}\n- Background: ${btn.backgroundColor || 'Extracted'}\n- Text Color: ${btn.color || 'Extracted'}\n- Border Radius: ${btn.borderRadius || '0'}`
        });
      });
    }

    if (comps.cards && comps.cards.length > 0) {
      comps.cards.slice(0, 2).forEach((card, idx) => {
        blueprints.push({
          title: `Surface Card ${idx + 1}`,
          previewHtml: `<div style="width:100%;padding:10px;background:${card.backgroundColor || 'var(--bg-main)'};border-radius:${card.borderRadius || '6px'};border:${card.border || '1px solid var(--border-color)'};font-size:10px;">Surface Card ${idx + 1}</div>`,
          prompt: `RECONSTRUCTION DIRECTIVE: Reconstruct Surface Card inspired by ${siteTitleText}.\n- Background: ${card.backgroundColor || 'Extracted'}\n- Border Radius: ${card.borderRadius || '0'}\n- Border: ${card.border || 'none'}`
        });
      });
    }

    if (blueprints.length === 0) {
      blueprints.push({
        title: "Extracted Page Canvas",
        previewHtml: `<div style="width:100%;padding:10px;background:var(--bg-main);border-radius:6px;border:1px solid var(--border-color);font-size:10px;">Page Canvas Component</div>`,
        prompt: `RECONSTRUCTION DIRECTIVE: Reconstruct Page Canvas for ${siteTitleText}.`
      });
    }

    componentsGrid.innerHTML = blueprints.map(c => `
      <div class="comp-card">
        <div class="comp-preview">${c.previewHtml}</div>
        <span class="comp-title">${escapeHtml(c.title)}</span>
        <div class="comp-actions">
          <button class="btn-xs copy-comp-btn" data-prompt="${encodeURIComponent(c.prompt)}">Copy Blueprint</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll(".copy-comp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const prompt = decodeURIComponent(btn.dataset.prompt);
        copyToClipboard(prompt, "Component blueprint copied!");
      });
    });
  }

  // --- 6. AI Reconstruction Panel ---
  function renderAIReconstructionPanel() {
    pillTechCount.textContent = `${scanState.techStack.length} Techs`;
    pillColorCount.textContent = `${(scanState.designSpec.colors || []).length} Colors`;
    pillCompCount.textContent = `${(scanState.designSpec.components?.buttons || []).length + (scanState.designSpec.components?.cards || []).length} Components`;

    aiTargetTitle.textContent = `${selectedAiTarget.toUpperCase()} — ${selectedAiFidelity.toUpperCase()} ${selectedAiTask.toUpperCase()} DIRECTIVE`;

    const promptText = ExportEngine.toAIPromptForTarget(
      selectedAiTarget,
      scanState.tab,
      scanState.techStack,
      scanState.designSpec
    );

    aiPromptPreview.textContent = promptText;
  }

  aiTargetCardsSm.forEach(card => {
    card.addEventListener("click", () => {
      aiTargetCardsSm.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedAiTarget = card.dataset.ai;
      renderAIReconstructionPanel();
    });
  });

  aiTaskSelect.addEventListener("change", (e) => {
    selectedAiTask = e.target.value;
    renderAIReconstructionPanel();
  });

  aiFidelitySelect.addEventListener("change", (e) => {
    selectedAiFidelity = e.target.value;
    renderAIReconstructionPanel();
  });

  // --- 7. Design Mixer (Inspiration Lab) ---
  function renderDesignMixer() {
    const config = {
      hero: mixHeroSelect.value,
      nav: mixNavSelect.value,
      button: mixButtonSelect.value,
      card: mixCardSelect.value
    };

    mixPromptPreview.textContent = ExportEngine.toDesignMixPrompt(config);
  }

  mixHeroSelect.addEventListener("change", renderDesignMixer);
  mixNavSelect.addEventListener("change", renderDesignMixer);
  mixButtonSelect.addEventListener("change", renderDesignMixer);
  mixCardSelect.addEventListener("change", renderDesignMixer);

  copyMixPromptBtn.addEventListener("click", () => {
    copyToClipboard(mixPromptPreview.textContent, "Combined inspiration prompt copied!");
  });

  // --- 8. Snap Library (Real Extracted Colors) ---
  function renderSnapLibrary(query = "") {
    const scans = auth.savedScans || [];
    const filtered = scans.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) || 
      s.url.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      snapLibraryGrid.innerHTML = `<p class="panel-desc">No saved snaps found.</p>`;
      return;
    }

    snapLibraryGrid.innerHTML = filtered.map((item) => {
      const colors = item.designSpec?.colors || [];
      const primaryHex = colors[0]?.hex || "#4F46E5";

      return `
        <div class="snap-card load-snap-item" data-id="${escapeHtml(item.id)}">
          <div class="snap-card-banner" style="background: ${primaryHex};">
            ${escapeHtml(item.title.split(' ')[0])}
          </div>
          <div class="snap-card-body">
            <span class="snap-card-title">${escapeHtml(item.title)}</span>
            <span class="snap-card-domain">${escapeHtml(item.url)}</span>
            <div class="snap-card-colors">
              ${colors.slice(0, 4).map(c => `<div class="snap-mini-swatch" style="background:${c.hex}"></div>`).join('')}
            </div>
            <div class="snap-card-actions">
              <button class="btn-xs copy-hex-btn" data-hex="${primaryHex}">Copy Hex</button>
              <button class="btn-xs delete-snap-btn" data-id="${escapeHtml(item.id)}">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll(".load-snap-item").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("copy-hex-btn") || e.target.classList.contains("delete-snap-btn")) return;
        const id = card.dataset.id;
        const savedItem = auth.savedScans.find(s => s.id === id);
        if (savedItem) {
          scanState.tab.url = savedItem.url;
          scanState.tab.title = savedItem.title;
          scanState.techStack = savedItem.techStack || [];
          scanState.designSpec = savedItem.designSpec || {};

          siteTitle.textContent = scanState.tab.title;
          siteUrl.textContent = scanState.tab.url;
          updateScanStatus("success", "Loaded Saved Snap");
          renderAllPanels();
          showToast(`Loaded ${savedItem.title}`);
        }
      });
    });

    document.querySelectorAll(".copy-hex-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(btn.dataset.hex, "Primary HEX copied!");
      });
    });

    document.querySelectorAll(".delete-snap-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await auth.deleteScan(btn.dataset.id);
        renderSnapLibrary();
        showToast("Snap deleted");
      });
    });
  }

  librarySearchInput.addEventListener("input", (e) => {
    renderSnapLibrary(e.target.value);
  });

  clearHistoryBtn.addEventListener("click", async () => {
    await auth.clearAllScans();
    renderSnapLibrary();
    showToast("Snap library cleared");
  });

  // Export JSON Buttons
  copyFullScanJsonBtn.addEventListener("click", () => {
    copyToClipboard(JSON.stringify(scanState, null, 2), "Full Scan JSON copied!");
  });

  copyStackJsonBtn.addEventListener("click", () => {
    copyToClipboard(JSON.stringify(scanState.techStack, null, 2), "Tech Stack JSON copied!");
  });

  copyDesignJsonBtn.addEventListener("click", () => {
    copyToClipboard(JSON.stringify(scanState.designSpec, null, 2), "Design System JSON copied!");
  });

  copyMarkdownBtn.addEventListener("click", () => {
    const md = ExportEngine.toGetDesignMarkdown(scanState.tab, scanState.techStack, scanState.designSpec);
    copyToClipboard(md, "Markdown design spec copied!");
  });

  copyAiPromptBtn.addEventListener("click", () => {
    copyToClipboard(aiPromptPreview.textContent, "AI Reconstruction Directive copied!");
  });

  rescanBtn.addEventListener("click", () => {
    runScan();
  });

  // --- Auth Modal & Password Recovery Controller ---
  function openAuthModal() {
    if (auth.currentUser) {
      authForm.style.display = "none";
      forgotPasswordForm.style.display = "none";
      userProfileView.classList.remove("hidden");
      document.getElementById("profileName").textContent = auth.currentUser.name;
      document.getElementById("profileEmail").textContent = auth.currentUser.email;
      if (editProfileRoleSelect) editProfileRoleSelect.value = auth.currentUser.role || "Frontend Engineer";
      document.getElementById("profileAvatar").src = auth.currentUser.avatar;
    } else {
      userProfileView.classList.add("hidden");
      setAuthMode("register");
    }
    authModal.classList.add("active");
  }

  function closeAuthModalWindow() {
    authModal.classList.remove("active");
  }

  function setAuthMode(mode) {
    authMode = mode;
    authForm.style.display = mode === "forgot" ? "none" : "flex";
    forgotPasswordForm.style.display = mode === "forgot" ? "flex" : "none";

    modalTabRegister.classList.toggle("active", mode === "register");
    modalTabLogin.classList.toggle("active", mode === "login");
    modalTabForgot.classList.toggle("active", mode === "forgot");

    if (mode === "register") {
      nameFieldGroup.style.display = "flex";
      roleFieldGroup.style.display = "flex";
      securityQuestionFieldGroup.style.display = "flex";
      securityAnswerFieldGroup.style.display = "flex";
      passwordFieldGroup.style.display = "flex";
      authSubmitBtn.textContent = "Create Free Account";
    } else if (mode === "login") {
      nameFieldGroup.style.display = "none";
      roleFieldGroup.style.display = "none";
      securityQuestionFieldGroup.style.display = "none";
      securityAnswerFieldGroup.style.display = "none";
      passwordFieldGroup.style.display = "flex";
      authSubmitBtn.textContent = "Sign In";
    } else if (mode === "forgot") {
      forgotStep2Group.style.display = "none";
      forgotEmailInput.value = document.getElementById("userEmailInput").value || "";
    }
  }

  authBtn.addEventListener("click", openAuthModal);
  bannerSignUpBtn.addEventListener("click", openAuthModal);
  closeAuthModal.addEventListener("click", closeAuthModalWindow);

  modalTabRegister.addEventListener("click", () => setAuthMode("register"));
  modalTabLogin.addEventListener("click", () => setAuthMode("login"));
  modalTabForgot.addEventListener("click", () => setAuthMode("forgot"));
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode("forgot");
  });

  // Handle Registration & Login Submit
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("userEmailInput").value;
    const password = document.getElementById("userPasswordInput").value;
    const name = document.getElementById("userNameInput").value;
    const role = document.getElementById("userRoleSelect").value;
    const secQuestion = document.getElementById("userSecurityQuestionSelect").value;
    const secAnswer = document.getElementById("userSecurityAnswerInput").value;

    try {
      if (authMode === "login") {
        await auth.login(email, password);
        showToast("Signed in successfully!");
      } else {
        if (!secAnswer) {
          showToast("Please provide a security answer for recovery.");
          return;
        }
        await auth.register(name, email, password, role, secQuestion, secAnswer);
        showToast("Account created with recovery question!");
      }
      updateAuthUI();
      closeAuthModalWindow();
    } catch (err) {
      showToast(err.message);
    }
  });

  // Handle Step 1: Fetch Security Question
  fetchSecurityQuestionBtn.addEventListener("click", async () => {
    const email = forgotEmailInput.value.trim();
    if (!email) {
      showToast("Please enter your account email address.");
      return;
    }

    try {
      const res = await auth.getSecurityQuestion(email);
      if (res && res.securityQuestion) {
        displaySecurityQuestionText.textContent = res.securityQuestion;
        forgotStep2Group.style.display = "block";
        showToast("Security question retrieved!");
      } else {
        showToast("No security question found for this account.");
      }
    } catch (err) {
      showToast(err.message || "Failed to fetch security question.");
    }
  });

  // Handle Step 2: Reset Password Submit
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = forgotEmailInput.value.trim();
    const secAnswer = forgotAnswerInput.value.trim();
    const newPassword = forgotNewPasswordInput.value.trim();

    if (!email || !secAnswer || !newPassword) {
      showToast("Please complete all fields.");
      return;
    }

    try {
      await auth.resetPassword(email, secAnswer, newPassword);
      showToast("Password reset successfully! Please sign in.");
      document.getElementById("userEmailInput").value = email;
      document.getElementById("userPasswordInput").value = newPassword;
      setAuthMode("login");
    } catch (err) {
      showToast(err.message || "Failed to reset password.");
    }
  });

  if (updateRoleBtn) {
    updateRoleBtn.addEventListener("click", async () => {
      const selectedRole = editProfileRoleSelect.value;
      await auth.updateRole(selectedRole);
      updateAuthUI();
      showToast(`Role updated to ${selectedRole}!`);
    });
  }

  logoutBtn.addEventListener("click", async () => {
    await auth.logout();
    updateAuthUI();
    closeAuthModalWindow();
    showToast("Signed out");
  });

  runScan();
});
