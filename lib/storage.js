/**
 * StackVibe - Storage Abstraction Layer
 * Wraps Chrome Storage Sync API with seamless LocalStorage fallbacks.
 * 
 * @module lib/storage
 */
const StorageUtil = {
  async get(key) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get([key], (res) => resolve(res[key]));
      } else {
        try {
          const val = localStorage.getItem(key);
          resolve(val ? JSON.parse(val) : null);
        } catch (e) {
          resolve(null);
        }
      }
    });
  },

  async set(key, value) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ [key]: value }, () => resolve(true));
      } else {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.error("Storage set error:", e);
        }
        resolve(true);
      }
    });
  },

  async remove(key) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.remove([key], () => resolve(true));
      } else {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
        resolve(true);
      }
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageUtil };
}
