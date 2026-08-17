/**
 * StackVibe - Convex Cloud HTTP API Client Wrapper
 * Performs cloud authentication and scan history persistence via Convex HTTP API endpoints.
 * 
 * @module lib/convex_client
 */
class ConvexClientWrapper {
  constructor(deploymentUrl = "") {
    // Read from window ENV or Chrome Storage or fallback
    this.deploymentUrl = deploymentUrl || 
      (typeof window !== 'undefined' && window.ENV_CONVEX_URL) || 
      "https://oceanic-dolphin-290.convex.cloud";
    
    this._initUrl();
  }

  async _initUrl() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(["stackvibe_convex_url"], (res) => {
        if (res && res.stackvibe_convex_url) {
          this.deploymentUrl = res.stackvibe_convex_url;
        }
      });
    }
  }

  /**
   * Execute Convex HTTP mutation API
   */
  async mutation(functionName, args = {}) {
    if (!this.deploymentUrl) {
      throw new Error("Convex deployment URL not configured.");
    }

    try {
      const response = await fetch(`${this.deploymentUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: functionName,
          args: args
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Convex mutation ${functionName} failed.`);
      }

      const result = await response.json();
      return result.value !== undefined ? result.value : result;
    } catch (e) {
      console.warn(`Convex cloud call (${functionName}) falling back:`, e.message);
      throw e;
    }
  }

  /**
   * Execute Convex HTTP query API
   */
  async query(functionName, args = {}) {
    if (!this.deploymentUrl) {
      throw new Error("Convex deployment URL not configured.");
    }

    try {
      const response = await fetch(`${this.deploymentUrl}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: functionName,
          args: args
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Convex query ${functionName} failed.`);
      }

      const result = await response.json();
      return result.value !== undefined ? result.value : result;
    } catch (e) {
      console.warn(`Convex query call (${functionName}) falling back:`, e.message);
      throw e;
    }
  }

  // --- Convex Auth APIs ---
  async registerUser(name, email, password, role, securityQuestion, securityAnswer) {
    return await this.mutation("users:register", { name, email, password, role, securityQuestion, securityAnswer });
  }

  async loginUser(email, password) {
    return await this.mutation("users:login", { email, password });
  }

  async getSecurityQuestion(email) {
    return await this.query("users:getSecurityQuestion", { email });
  }

  async resetPassword(email, securityAnswer, newPassword) {
    return await this.mutation("users:resetPassword", { email, securityAnswer, newPassword });
  }

  // --- Convex Scan Progress APIs ---
  async saveScanProgress(userId, url, title, techStack, designSpec) {
    return await this.mutation("scans:saveScan", {
      userId,
      url,
      title,
      techStack,
      designSpec
    });
  }

  async getScansByUser(userId) {
    return await this.query("scans:getScansByUser", { userId });
  }

  async deleteScan(scanId) {
    return await this.mutation("scans:deleteScan", { scanId });
  }

  async clearAllScans(userId) {
    return await this.mutation("scans:clearAllScans", { userId });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConvexClientWrapper };
}
