/**
 * Cross-platform storage utilities
 * Works with both Chrome extension storage and localStorage/sessionStorage
 */
/**
 * Chrome Extension Storage Adapter
 */
class ChromeStorageAdapter {
    constructor(area = 'local') {
        this.area = area;
    }
    async get(keys) {
        return new Promise((resolve) => {
            // Type-safe Chrome API check
            const globalChrome = globalThis.chrome;
            if (globalChrome && globalChrome.storage) {
                globalChrome.storage[this.area].get(keys, resolve);
            }
            else {
                resolve({});
            }
        });
    }
    async set(items) {
        return new Promise((resolve) => {
            const globalChrome = globalThis.chrome;
            if (globalChrome && globalChrome.storage) {
                globalChrome.storage[this.area].set(items, resolve);
            }
            else {
                resolve();
            }
        });
    }
    async remove(keys) {
        return new Promise((resolve) => {
            const globalChrome = globalThis.chrome;
            if (globalChrome && globalChrome.storage) {
                globalChrome.storage[this.area].remove(keys, resolve);
            }
            else {
                resolve();
            }
        });
    }
    async clear() {
        return new Promise((resolve) => {
            const globalChrome = globalThis.chrome;
            if (globalChrome && globalChrome.storage) {
                globalChrome.storage[this.area].clear(resolve);
            }
            else {
                resolve();
            }
        });
    }
}
/**
 * Browser localStorage/sessionStorage Adapter
 */
class BrowserStorageAdapter {
    constructor(storage = localStorage) {
        this.storage = storage;
    }
    async get(keys) {
        const result = {};
        if (keys === null) {
            // Get all items
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key) {
                    try {
                        result[key] = JSON.parse(this.storage.getItem(key) || 'null');
                    }
                    catch {
                        result[key] = this.storage.getItem(key);
                    }
                }
            }
        }
        else {
            const keyArray = typeof keys === 'string' ? [keys] : keys;
            for (const key of keyArray) {
                try {
                    const value = this.storage.getItem(key);
                    result[key] = value ? JSON.parse(value) : null;
                }
                catch {
                    result[key] = this.storage.getItem(key);
                }
            }
        }
        return result;
    }
    async set(items) {
        for (const [key, value] of Object.entries(items)) {
            try {
                this.storage.setItem(key, JSON.stringify(value));
            }
            catch (error) {
                console.warn(`Failed to store item ${key}:`, error);
            }
        }
    }
    async remove(keys) {
        const keyArray = typeof keys === 'string' ? [keys] : keys;
        for (const key of keyArray) {
            this.storage.removeItem(key);
        }
    }
    async clear() {
        this.storage.clear();
    }
}
/**
 * Unified storage class that works across platforms
 */
export class UnifiedStorage {
    constructor() {
        // Detect environment and choose appropriate adapter
        const globalChrome = globalThis.chrome;
        if (globalChrome && globalChrome.storage) {
            this.adapter = new ChromeStorageAdapter('local');
        }
        else if (typeof localStorage !== 'undefined') {
            this.adapter = new BrowserStorageAdapter(localStorage);
        }
        else {
            // Fallback to in-memory storage for testing
            this.adapter = new MemoryStorageAdapter();
        }
    }
    /**
     * Get items from storage
     */
    async get(keys = null) {
        return this.adapter.get(keys);
    }
    /**
     * Store items in storage
     */
    async set(items) {
        return this.adapter.set(items);
    }
    /**
     * Remove items from storage
     */
    async remove(keys) {
        return this.adapter.remove(keys);
    }
    /**
     * Clear all items from storage
     */
    async clear() {
        return this.adapter.clear();
    }
    /**
     * Get a single item
     */
    async getItem(key) {
        const result = await this.get(key);
        return result[key];
    }
    /**
     * Set a single item
     */
    async setItem(key, value) {
        return this.set({ [key]: value });
    }
    /**
     * Remove a single item
     */
    async removeItem(key) {
        return this.remove(key);
    }
}
/**
 * In-memory storage adapter for testing or fallback
 */
class MemoryStorageAdapter {
    constructor() {
        this.data = {};
    }
    async get(keys) {
        if (keys === null) {
            return { ...this.data };
        }
        const result = {};
        const keyArray = typeof keys === 'string' ? [keys] : keys;
        for (const key of keyArray) {
            result[key] = this.data[key];
        }
        return result;
    }
    async set(items) {
        Object.assign(this.data, items);
    }
    async remove(keys) {
        const keyArray = typeof keys === 'string' ? [keys] : keys;
        for (const key of keyArray) {
            delete this.data[key];
        }
    }
    async clear() {
        this.data = {};
    }
}
/**
 * Settings manager with type safety and defaults
 */
export class SettingsManager {
    constructor(defaults, storage) {
        this.cache = null;
        this.defaults = defaults;
        this.storage = storage || new UnifiedStorage();
    }
    /**
     * Get all settings with defaults applied
     */
    async getSettings() {
        if (this.cache) {
            return this.cache;
        }
        const stored = await this.storage.get(Object.keys(this.defaults));
        const settings = { ...this.defaults };
        // Apply stored values over defaults
        for (const key in this.defaults) {
            if (stored[key] !== undefined) {
                settings[key] = stored[key];
            }
        }
        this.cache = settings;
        return settings;
    }
    /**
     * Update specific setting
     */
    async setSetting(key, value) {
        await this.storage.setItem(key, value);
        if (this.cache) {
            this.cache[key] = value;
        }
    }
    /**
     * Update multiple settings
     */
    async setSettings(updates) {
        const items = {};
        for (const [key, value] of Object.entries(updates)) {
            items[key] = value;
        }
        await this.storage.set(items);
        if (this.cache) {
            Object.assign(this.cache, updates);
        }
    }
    /**
     * Get a specific setting
     */
    async getSetting(key) {
        const settings = await this.getSettings();
        return settings[key];
    }
    /**
     * Reset settings to defaults
     */
    async resetSettings() {
        const items = {};
        for (const [key, value] of Object.entries(this.defaults)) {
            items[key] = value;
        }
        await this.storage.set(items);
        this.cache = { ...this.defaults };
    }
    /**
     * Clear cache (force reload from storage)
     */
    clearCache() {
        this.cache = null;
    }
}
// Default export is a singleton storage instance
export const storage = new UnifiedStorage();
