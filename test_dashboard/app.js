/**
 * StackVibe - Web App Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const auth = new AuthManager();
  await auth.init();

  // Preset Datasets
  const PRESET_SITES = {
    stripe: {
      url: "https://stripe.com",
      title: "Stripe | Financial Infrastructure for the Web",
      techStack: [
        { id: "react", name: "React", category: "Framework", icon: "⚛️", color: "#61DAFB", description: "JavaScript library for building user interfaces." },
        { id: "nextjs", name: "Next.js", category: "Framework", icon: "⚡", color: "#000000", description: "React Framework for SSR & SSG production websites." },
        { id: "tailwindcss", name: "Tailwind CSS", category: "Styling", icon: "🎨", color: "#06B6D4", description: "Utility-first CSS framework for custom styling." },
        { id: "vite", name: "Vite", category: "Bundler", icon: "⚡", color: "#646CFF", description: "Next Generation Frontend Tooling providing ultra-fast HMR." }
      ],
      designSpec: {
        background: "#0A2540",
        surfaceColor: "#635BFF",
        textColor: "#00D4B2",
        colors: [
          { hex: "#635BFF", hsl: "hsl(243, 100%, 68%)", role: "Brand Primary" },
          { hex: "#00D4B2", hsl: "hsl(170, 100%, 42%)", role: "Brand Accent" },
          { hex: "#0A2540", hsl: "hsl(210, 73%, 15%)", role: "Main Background" },
          { hex: "#F6F9FC", hsl: "hsl(210, 43%, 98%)", role: "Light Surface" },
          { hex: "#3A3D4D", hsl: "hsl(231, 14%, 27%)", role: "Body Muted" }
        ],
        typography: { fontFamily: "Inter, sans-serif", h1Size: "44px", h1Weight: "800", bodySize: "16px", bodyWeight: "400" },
        radius: { sm: "6px", md: "10px", lg: "20px" },
        shadows: ["0 12px 24px -6px rgba(10, 37, 64, 0.3)"]
      }
    },
    nextjs: {
      url: "https://nextjs.org",
      title: "Next.js by Vercel - The React Framework",
      techStack: [
        { id: "nextjs", name: "Next.js 14", category: "Framework", icon: "⚡", color: "#000000", description: "React Framework with Server Actions and App Router." },
        { id: "react", name: "React 18", category: "Framework", icon: "⚛️", color: "#61DAFB", description: "React core UI library." },
        { id: "tailwindcss", name: "Tailwind CSS", category: "Styling", icon: "🎨", color: "#06B6D4", description: "Utility CSS framework." },
        { id: "webpack", name: "Turbopack / Webpack", category: "Bundler", icon: "📦", color: "#8ED6FB", description: "High performance JS module bundler." }
      ],
      designSpec: {
        background: "#000000",
        surfaceColor: "#111111",
        textColor: "#FFFFFF",
        colors: [
          { hex: "#FFFFFF", hsl: "hsl(0, 0%, 100%)", role: "Brand Primary" },
          { hex: "#0070F3", hsl: "hsl(212, 100%, 48%)", role: "Vercel Blue" },
          { hex: "#000000", hsl: "hsl(0, 0%, 0%)", role: "Main Background" },
          { hex: "#111111", hsl: "hsl(0, 0%, 7%)", role: "Dark Surface" },
          { hex: "#888888", hsl: "hsl(0, 0%, 53%)", role: "Muted Text" }
        ],
        typography: { fontFamily: "Inter, sans-serif", h1Size: "48px", h1Weight: "800", bodySize: "16px", bodyWeight: "400" },
        radius: { sm: "4px", md: "8px", lg: "12px" },
        shadows: ["0 8px 30px rgba(0, 0, 0, 0.5)"]
      }
    },
    tailwind: {
      url: "https://tailwindcss.com",
      title: "Tailwind CSS - Rapidly build modern websites",
      techStack: [
        { id: "tailwindcss", name: "Tailwind CSS v3.4", category: "Styling", icon: "🎨", color: "#06B6D4", description: "Utility-first CSS engine." },
        { id: "react", name: "React", category: "Framework", icon: "⚛️", color: "#61DAFB", description: "React component view layer." },
        { id: "astro", name: "Astro", category: "Framework", icon: "🚀", color: "#FF5D01", description: "Fast content-focused static site builder." }
      ],
      designSpec: {
        background: "#0F172A",
        surfaceColor: "#1E293B",
        textColor: "#F8FAFC",
        colors: [
          { hex: "#38BDF8", hsl: "hsl(198, 93%, 60%)", role: "Tailwind Cyan" },
          { hex: "#818CF8", hsl: "hsl(235, 92%, 72%)", role: "Indigo Accent" },
          { hex: "#0F172A", hsl: "hsl(222, 47%, 11%)", role: "Dark Background" },
          { hex: "#1E293B", hsl: "hsl(215, 28%, 17%)", role: "Card Surface" },
          { hex: "#94A3B8", hsl: "hsl(215, 20%, 65%)", role: "Muted Label" }
        ],
        typography: { fontFamily: "Inter, sans-serif", h1Size: "40px", h1Weight: "800", bodySize: "16px", bodyWeight: "400" },
        radius: { sm: "6px", md: "12px", lg: "24px" },
        shadows: ["0 20px 25px -5px rgba(0, 0, 0, 0.4)"]
      }
    },
    shopify: {
      url: "https://shopify.com",
      title: "Shopify - E-commerce Platform for Businesses",
      techStack: [
        { id: "shopify", name: "Shopify Engine", category: "CMS / Builder", icon: "🛍️", color: "#96BF48", description: "Leading global e-commerce platform." },
        { id: "react", name: "React / Hydrogen", category: "Framework", icon: "⚛️", color: "#61DAFB", description: "Remix/React headless storefront framework." }
      ],
      designSpec: {
        background: "#002E25",
        surfaceColor: "#96BF48",
        textColor: "#FFFFFF",
        colors: [
          { hex: "#96BF48", hsl: "hsl(81, 48%, 51%)", role: "Shopify Green" },
          { hex: "#002E25", hsl: "hsl(168, 100%, 9%)", role: "Deep Pine" },
          { hex: "#FFFFFF", hsl: "hsl(0, 0%, 100%)", role: "Primary Text" }
        ],
        typography: { fontFamily: "ShopifySans, sans-serif", h1Size: "42px", h1Weight: "700", bodySize: "16px", bodyWeight: "400" },
        radius: { sm: "4px", md: "8px", lg: "16px" },
        shadows: ["0 10px 15px -3px rgba(0, 0, 0, 0.2)"]
      }
    },
    webflow: {
      url: "https://webflow.com",
      title: "Webflow: Create custom web experiences",
      techStack: [
        { id: "webflow", name: "Webflow Engine", category: "CMS / Builder", icon: "🌊", color: "#146EF5", description: "Visual web development platform." },
        { id: "jquery", name: "jQuery", category: "Utility", icon: "⚡", color: "#0769AD", description: "DOM manipulation and event library." }
      ],
      designSpec: {
        background: "#146EF5",
        surfaceColor: "#000000",
        textColor: "#FFFFFF",
        colors: [
          { hex: "#146EF5", hsl: "hsl(216, 91%, 52%)", role: "Webflow Blue" },
          { hex: "#000000", hsl: "hsl(0, 0%, 0%)", role: "Pure Black" },
          { hex: "#FFFFFF", hsl: "hsl(0, 0%, 100%)", role: "Pure White" }
        ],
        typography: { fontFamily: "Inter, sans-serif", h1Size: "52px", h1Weight: "900", bodySize: "18px", bodyWeight: "400" },
        radius: { sm: "4px", md: "8px", lg: "16px" },
        shadows: ["0 4px 20px rgba(20, 110, 245, 0.3)"]
      }
    }
  };

  let activeData = PRESET_SITES.stripe;
  let activeFormat = "figma";

  // Elements
  const targetUrlInput = document.getElementById("targetUrlInput");
  const scanUrlBtn = document.getElementById("scanUrlBtn");
  const presetBtns = document.querySelectorAll(".preset-btn");

  const dashStackList = document.getElementById("dashStackList");
  const dashStackBadge = document.getElementById("dashStackBadge");

  const dashColorSwatches = document.getElementById("dashColorSwatches");
  const dashTypographyBox = document.getElementById("dashTypographyBox");
  const dashTokensBox = document.getElementById("dashTokensBox");

  const dashAiPromptText = document.getElementById("dashAiPromptText");
  const dashExportCodeText = document.getElementById("dashExportCodeText");

  const fmtTabs = document.querySelectorAll(".fmt-tab");

  const userWidget = document.getElementById("userWidget");
  const userName = document.getElementById("userName");
  const userStatus = document.getElementById("userStatus");
  const authTriggerBtn = document.getElementById("authTriggerBtn");

  const extensionPopupPreviewBtn = document.getElementById("extensionPopupPreviewBtn");
  const extensionPopupModal = document.getElementById("extensionPopupModal");
  const closePopupModal = document.getElementById("closePopupModal");

  const webAuthModal = document.getElementById("webAuthModal");
  const closeWebAuthModal = document.getElementById("closeWebAuthModal");
  const webAuthForm = document.getElementById("webAuthForm");
  const webTabRegister = document.getElementById("webTabRegister");
  const webTabLogin = document.getElementById("webTabLogin");

  const webToast = document.getElementById("webToast");

  function showToast(msg) {
    webToast.textContent = msg;
    webToast.classList.add("show");
    setTimeout(() => webToast.classList.remove("show"), 2500);
  }

  function syncUserWidget() {
    if (auth.currentUser) {
      userName.textContent = auth.currentUser.name;
      userStatus.textContent = auth.currentUser.role || "Pro Developer";
      authTriggerBtn.textContent = "Sign Out";
    } else {
      userName.textContent = "Guest User";
      userStatus.textContent = "Sign up to sync scans";
      authTriggerBtn.textContent = "Account";
    }
  }

  syncUserWidget();

  function renderAll() {
    targetUrlInput.value = activeData.url;

    // 1. Tech Stack
    const stack = activeData.techStack;
    dashStackBadge.textContent = `${stack.length} Detected`;
    dashStackList.innerHTML = stack.map(item => `
      <div class="dash-stack-card">
        <div class="dash-stack-icon" style="color: ${item.color}">${item.icon}</div>
        <div class="dash-stack-info">
          <h4>${item.name}</h4>
          <span>${item.category}</span>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');

    // 2. Design System
    const spec = activeData.designSpec;
    dashColorSwatches.innerHTML = (spec.colors || []).map(c => `
      <div class="dash-swatch">
        <div class="dash-swatch-box" style="background-color: ${c.hex};"></div>
        <div class="dash-swatch-hex">${c.hex}</div>
        <div class="dash-swatch-role">${c.role || "Token"}</div>
      </div>
    `).join('');

    const typo = spec.typography || {};
    dashTypographyBox.innerHTML = `
      <div>Family: <code>${typo.fontFamily || "Inter"}</code></div>
      <div>Heading: ${typo.h1Size || "36px"} (${typo.h1Weight || "700"})</div>
      <div>Body: ${typo.bodySize || "16px"} (${typo.bodyWeight || "400"})</div>
    `;

    const rad = spec.radius || {};
    dashTokensBox.innerHTML = `
      <div>Radius Sm: <code>${rad.sm || "4px"}</code></div>
      <div>Radius Md: <code>${rad.md || "8px"}</code></div>
      <div>Bg Color: <code>${spec.background || "#0F172A"}</code></div>
    `;

    // 3. AI Prompt
    dashAiPromptText.textContent = ExportEngine.toAIPrompt(activeData, activeData.techStack, activeData.designSpec);

    // 4. Exports
    renderExportCode();
  }

  function renderExportCode() {
    let snippet = "";
    switch (activeFormat) {
      case "figma":
        snippet = ExportEngine.toFigmaTokensJSON(activeData, activeData.designSpec);
        break;
      case "stitch":
        snippet = ExportEngine.toStitchCodeSnippet(activeData, activeData.techStack, activeData.designSpec);
        break;
      case "tailwind":
        snippet = ExportEngine.toTailwindConfig(activeData.designSpec);
        break;
      case "css":
        snippet = ExportEngine.toCSSVariables(activeData.designSpec);
        break;
    }
    dashExportCodeText.textContent = snippet;
  }

  // Presets Click Event
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.site;
      if (PRESET_SITES[key]) {
        activeData = PRESET_SITES[key];
        renderAll();
        showToast(`Scanned ${PRESET_SITES[key].title}`);
      }
    });
  });

  // Scan Custom URL
  scanUrlBtn.addEventListener("click", () => {
    const inputUrl = targetUrlInput.value.trim();
    activeData = {
      url: inputUrl || "https://custom-site.com",
      title: inputUrl.replace(/^https?:\/\//, '') || "Custom Scanned Website",
      techStack: [
        { id: "react", name: "React", category: "Framework", icon: "⚛️", color: "#61DAFB", description: "Detected React DOM root." },
        { id: "tailwindcss", name: "Tailwind CSS", category: "Styling", icon: "🎨", color: "#06B6D4", description: "Utility CSS framework signatures found." }
      ],
      designSpec: {
        background: "#0F172A",
        surfaceColor: "#1E293B",
        textColor: "#F8FAFC",
        colors: [
          { hex: "#6366F1", hsl: "hsl(239, 84%, 67%)", role: "Primary Accent" },
          { hex: "#10B981", hsl: "hsl(160, 84%, 39%)", role: "Secondary Accent" },
          { hex: "#0F172A", hsl: "hsl(222, 47%, 11%)", role: "Background" },
          { hex: "#1E293B", hsl: "hsl(215, 28%, 17%)", role: "Surface" }
        ],
        typography: { fontFamily: "Inter, sans-serif", h1Size: "36px", h1Weight: "700", bodySize: "16px" },
        radius: { sm: "4px", md: "8px", lg: "16px" },
        shadows: ["0 10px 15px -3px rgba(0,0,0,0.2)"]
      }
    };
    renderAll();
    showToast("Scan complete for custom URL!");
  });

  // Format Tabs
  fmtTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      fmtTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFormat = tab.dataset.fmt;
      renderExportCode();
    });
  });

  // Copy Buttons
  document.getElementById("dashCopyMdBtn").addEventListener("click", () => {
    const md = ExportEngine.toGetDesignMarkdown(activeData, activeData.techStack, activeData.designSpec);
    navigator.clipboard.writeText(md);
    showToast("Markdown design spec copied!");
  });

  document.getElementById("dashCopyAiPromptBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(dashAiPromptText.textContent);
    showToast("AI Prompt copied!");
  });

  document.getElementById("dashCopyExportBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(dashExportCodeText.textContent);
    showToast("Snippet copied!");
  });

  // Extension Popup Preview Modal
  extensionPopupPreviewBtn.addEventListener("click", () => {
    extensionPopupModal.classList.add("active");
  });

  closePopupModal.addEventListener("click", () => {
    extensionPopupModal.classList.remove("active");
  });

  // Auth Trigger
  authTriggerBtn.addEventListener("click", async () => {
    if (auth.currentUser) {
      await auth.logout();
      syncUserWidget();
      showToast("Signed out");
    } else {
      webAuthModal.classList.add("active");
    }
  });

  closeWebAuthModal.addEventListener("click", () => {
    webAuthModal.classList.remove("active");
  });

  webAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("webEmailInput").value;
    const password = document.getElementById("webPasswordInput").value;
    const name = document.getElementById("webNameInput").value;

    await auth.register(name, email, password, "Pro Engineer");
    syncUserWidget();
    webAuthModal.classList.remove("active");
    showToast("Account created successfully!");
  });

  renderAll();
});
