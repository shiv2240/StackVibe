# Privacy Policy for StackVibe Chrome Extension

**Last Updated**: August 19, 2026  
**Extension Version**: 2.0.0  

At **StackVibe**, we take user privacy and security seriously. This Privacy Policy outlines how the StackVibe Chrome Extension collects, uses, stores, and protects user data.

---

## 1. Overview & Data Minimization Principles

StackVibe is a developer tool designed to inspect frontend technology stacks, computed CSS design tokens, and DOM page architecture. We strictly adhere to data minimization principles:

- **No Unauthorized Tracking or Telemetry**: StackVibe does NOT track your browser history, keylog input fields, or transmit browsing activity to third-party analytics services.
- **On-Demand Local Inspection**: Technology stack fingerprinting and design token extraction occur locally in your browser when you interact with the extension popup interface.
- **Zero Third-Party Data Selling**: We never sell, rent, trade, or monetize any user information or scanned data.

---

## 2. Information We Collect and How It Is Used

### A. Webpage Technical Metadata (Scanned On-Demand)
When you click **Inspect Page** or use StackVibe on an active tab:
- **What is collected**: Global JavaScript window variables, script source URLs, CSS stylesheets, HTML element counts, computed styles (colors, typography, bounding box geometry), and response header signals.
- **Purpose**: To compute the site's technology stack confidence scores, design system tokens, DOM layout tree graph, and AI prompts.
- **Storage**: Scanned metadata is saved locally in your browser (`chrome.storage.local`) and, if authenticated, synchronized to your private account on Convex cloud backend.

### B. User Account Data (Optional Cloud Synchronization)
If you register or log in using StackVibe's authentication system:
- **What is collected**: Account credentials (username/email and hashed password). Security questions and answers are encrypted locally prior to storage.
- **Purpose**: To allow you to access your saved site snapshots ("Snap Library") and custom inspiration links across sessions.
- **Storage**: Stored securely on Convex Cloud Infrastructure (`https://oceanic-dolphin-290.convex.cloud`).

---

## 3. Chrome Extension Permissions Justification

StackVibe requests only the minimum Chrome permissions required for operation:

- `activeTab`: Used exclusively to inspect the currently focused tab when the user opens the StackVibe console popup.
- `scripting`: Required to execute the read-only DOM layout inspector and main-world JS variable detector in the context of the inspected webpage.
- `storage`: Required to store your saved snaps, custom inspiration links, and UI preferences locally in your browser.
- `<all_urls>` (Host Permission): Required to allow the content script inspector to run on web pages you explicitly choose to inspect.

---

## 4. Data Storage, Retention & Security

- **Local Browser Storage**: All temporary scan states and custom inspiration links are saved locally within your Chrome browser profile (`chrome.storage.local`).
- **Data Deletion**: You can clear your local scan history and saved snaps at any time by clicking **Clear Scan History** in the StackVibe popup or clearing extension local storage.
- **Content Security Policy (CSP)**: StackVibe complies with Chrome Extension Manifest V3 strict Content Security Policy (`script-src 'self'`). It executes zero remote or inline code scripts.

---

## 5. Changes to This Privacy Policy

We may update this Privacy Policy to reflect extension enhancements or legal requirements. Updated versions will be posted in the repository root.

---

## 6. Contact Information

If you have questions regarding this Privacy Policy or extension security, please open an issue in the official GitHub repository.
