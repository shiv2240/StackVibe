/**
 * StackVibe - User Account & Authentication Manager
 * Handles user account state, login/registration, session persistence, and scan history storage.
 */

class AuthManager {
  constructor() {
    this.STORAGE_KEY_USER = "stackvibe_user_session";
    this.STORAGE_KEY_SCANS = "stackvibe_saved_scans";
    this.currentUser = null;
    this.savedScans = [];
  }

  /**
   * Initialize auth state from Chrome Storage / LocalStorage
   */
  async init() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get([this.STORAGE_KEY_USER, this.STORAGE_KEY_SCANS], (result) => {
          this.currentUser = result[this.STORAGE_KEY_USER] || null;
          this.savedScans = result[this.STORAGE_KEY_SCANS] || [];
          resolve({ user: this.currentUser, scans: this.savedScans });
        });
      } else {
        try {
          const userStr = localStorage.getItem(this.STORAGE_KEY_USER);
          const scansStr = localStorage.getItem(this.STORAGE_KEY_SCANS);
          this.currentUser = userStr ? JSON.parse(userStr) : null;
          this.savedScans = scansStr ? JSON.parse(scansStr) : [];
        } catch (e) {
          console.error("Auth init storage error:", e);
        }
        resolve({ user: this.currentUser, scans: this.savedScans });
      }
    });
  }

  /**
   * Register a new user account (Syncs with Convex cloud + storage)
   */
  async register(name, email, password, role = "Developer / Designer") {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const user = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      name: name || email.split("@")[0],
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
    };

    // Attempt Convex Cloud registration
    try {
      if (typeof ConvexClientWrapper !== 'undefined') {
        const convex = new ConvexClientWrapper();
        const convexUser = await convex.registerUser(user.name, email, password, role);
        if (convexUser && convexUser._id) {
          user.id = convexUser._id;
          user.convexSynced = true;
        }
      }
    } catch (e) {
      console.log("Convex registration fallback to local storage session:", e.message);
    }

    this.currentUser = user;
    await this._persist();
    return user;
  }

  /**
   * Login an existing user (Syncs with Convex cloud + storage)
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    let user = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      name: email.split("@")[0],
      email: email,
      role: "Pro Designer",
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
    };

    // Attempt Convex Cloud Login
    try {
      if (typeof ConvexClientWrapper !== 'undefined') {
        const convex = new ConvexClientWrapper();
        const convexUser = await convex.loginUser(email, password);
        if (convexUser) {
          user.id = convexUser._id;
          user.name = convexUser.name;
          user.role = convexUser.role;
          user.avatar = convexUser.avatar;
          user.convexSynced = true;
        }
      }
    } catch (e) {
      console.log("Convex login fallback to local session:", e.message);
    }

    this.currentUser = user;
    await this._persist();
    return user;
  }

  /**
   * Logout current user
   */
  async logout() {
    this.currentUser = null;
    await this._persist();
    return true;
  }

  /**
   * Update current user role / type
   */
  async updateRole(newRole) {
    if (this.currentUser) {
      this.currentUser.role = newRole;
      await this._persist();
    }
    return this.currentUser;
  }

  /**
   * Save a completed site scan to the user's progress history (Convex + Storage)
   */
  async saveScan(scanData) {
    const scanItem = {
      id: "scan_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      url: scanData.url,
      title: scanData.title || scanData.url,
      timestamp: new Date().toISOString(),
      techStack: scanData.techStack || [],
      designSpec: scanData.designSpec || {},
      userId: this.currentUser ? this.currentUser.id : "guest"
    };

    // Sync to Convex Cloud if user is authenticated
    try {
      if (this.currentUser && typeof ConvexClientWrapper !== 'undefined') {
        const convex = new ConvexClientWrapper();
        await convex.saveScanProgress(
          this.currentUser.id,
          scanItem.url,
          scanItem.title,
          scanItem.techStack,
          scanItem.designSpec
        );
        scanItem.convexSynced = true;
      }
    } catch (e) {
      console.log("Convex scan save fallback:", e.message);
    }

    // Prepend to history, max 50 items
    this.savedScans = [scanItem, ...this.savedScans.filter(s => s.url !== scanItem.url)].slice(0, 50);
    await this._persist();
    return scanItem;
  }

  /**
   * Delete a saved scan item
   */
  async deleteScan(scanId) {
    this.savedScans = this.savedScans.filter(s => s.id !== scanId);
    await this._persist();
    return true;
  }

  /**
   * Clear all scan history
   */
  async clearAllScans() {
    this.savedScans = [];
    await this._persist();
    return true;
  }

  /**
   * Internal persist helper
   */
  async _persist() {
    return new Promise((resolve) => {
      const data = {
        [this.STORAGE_KEY_USER]: this.currentUser,
        [this.STORAGE_KEY_SCANS]: this.savedScans
      };

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set(data, () => resolve(true));
      } else {
        try {
          if (this.currentUser) {
            localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(this.currentUser));
          } else {
            localStorage.removeItem(this.STORAGE_KEY_USER);
          }
          localStorage.setItem(this.STORAGE_KEY_SCANS, JSON.stringify(this.savedScans));
        } catch (e) {
          console.error("Auth storage write error:", e);
        }
        resolve(true);
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager };
}
