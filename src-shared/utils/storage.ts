/**
 * Cross-platform storage utilities
 * Works with both Chrome extension storage and localStorage/sessionStorage
 */

export interface StorageInterface {
  get(keys: string | string[] | null): Promise<Record<string, any>>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Chrome Extension Storage Adapter
 */
class ChromeStorageAdapter implements StorageInterface {
  constructor(private area: 'local' | 'sync' = 'local') {}

  async get(keys: string | string[] | null): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      // Type-safe Chrome API check
      const globalChrome = (globalThis as any).chrome;
      if (globalChrome && globalChrome.storage) {
        globalChrome.storage[this.area].get(keys, resolve);
      } else {
        resolve({});
      }
    });
  }

  async set(items: Record<string, any>): Promise<void> {
    return new Promise((resolve) => {
      const globalChrome = (globalThis as any).chrome;
      if (globalChrome && globalChrome.storage) {
        globalChrome.storage[this.area].set(items, resolve);
      } else {
        resolve();
      }
    });
  }

  async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve) => {
      const globalChrome = (globalThis as any).chrome;
      if (globalChrome && globalChrome.storage) {
        globalChrome.storage[this.area].remove(keys, resolve);
      } else {
        resolve();
      }
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      const globalChrome = (globalThis as any).chrome;
      if (globalChrome && globalChrome.storage) {
        globalChrome.storage[this.area].clear(resolve);
      } else {
        resolve();
      }
    });
  }
}

/**
 * Browser localStorage/sessionStorage Adapter
 */
class BrowserStorageAdapter implements StorageInterface {
  constructor(private storage: Storage = localStorage) {}

  async get(keys: string | string[] | null): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    if (keys === null) {
      // Get all items
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          try {
            result[key] = JSON.parse(this.storage.getItem(key) || 'null');
          } catch {
            result[key] = this.storage.getItem(key);
          }
        }
      }
    } else {
      const keyArray = typeof keys === 'string' ? [keys] : keys;
      for (const key of keyArray) {
        try {
          const value = this.storage.getItem(key);
          result[key] = value ? JSON.parse(value) : null;
        } catch {
          result[key] = this.storage.getItem(key);
        }
      }
    }

    return result;
  }

  async set(items: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      try {
        this.storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to store item ${key}:`, error);
      }
    }
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = typeof keys === 'string' ? [keys] : keys;
    for (const key of keyArray) {
      this.storage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/**
 * Unified storage class that works across platforms
 */
export class UnifiedStorage {
  private adapter: StorageInterface;

  constructor() {
    // Detect environment and choose appropriate adapter
    const globalChrome = (globalThis as any).chrome;
    if (globalChrome && globalChrome.storage) {
      this.adapter = new ChromeStorageAdapter('local');
    } else if (typeof localStorage !== 'undefined') {
      this.adapter = new BrowserStorageAdapter(localStorage);
    } else {
      // Fallback to in-memory storage for testing
      this.adapter = new MemoryStorageAdapter();
    }
  }

  /**
   * Get items from storage
   */
  async get(keys: string | string[] | null = null): Promise<Record<string, any>> {
    return this.adapter.get(keys);
  }

  /**
   * Store items in storage
   */
  async set(items: Record<string, any>): Promise<void> {
    return this.adapter.set(items);
  }

  /**
   * Remove items from storage
   */
  async remove(keys: string | string[]): Promise<void> {
    return this.adapter.remove(keys);
  }

  /**
   * Clear all items from storage
   */
  async clear(): Promise<void> {
    return this.adapter.clear();
  }

  /**
   * Get a single item
   */
  async getItem(key: string): Promise<any> {
    const result = await this.get(key);
    return result[key];
  }

  /**
   * Set a single item
   */
  async setItem(key: string, value: any): Promise<void> {
    return this.set({ [key]: value });
  }

  /**
   * Remove a single item
   */
  async removeItem(key: string): Promise<void> {
    return this.remove(key);
  }
}

/**
 * In-memory storage adapter for testing or fallback
 */
class MemoryStorageAdapter implements StorageInterface {
  private data: Record<string, any> = {};

  async get(keys: string | string[] | null): Promise<Record<string, any>> {
    if (keys === null) {
      return { ...this.data };
    }

    const result: Record<string, any> = {};
    const keyArray = typeof keys === 'string' ? [keys] : keys;
    
    for (const key of keyArray) {
      result[key] = this.data[key];
    }

    return result;
  }

  async set(items: Record<string, any>): Promise<void> {
    Object.assign(this.data, items);
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = typeof keys === 'string' ? [keys] : keys;
    for (const key of keyArray) {
      delete this.data[key];
    }
  }

  async clear(): Promise<void> {
    this.data = {};
  }
}

/**
 * Settings manager with type safety and defaults
 */
export class SettingsManager<T extends Record<string, any>> {
  private storage: UnifiedStorage;
  private defaults: T;
  private cache: T | null = null;

  constructor(defaults: T, storage?: UnifiedStorage) {
    this.defaults = defaults;
    this.storage = storage || new UnifiedStorage();
  }

  /**
   * Get all settings with defaults applied
   */
  async getSettings(): Promise<T> {
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
  async setSetting<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.storage.setItem(key as string, value);
    
    if (this.cache) {
      this.cache[key] = value;
    }
  }

  /**
   * Update multiple settings
   */
  async setSettings(updates: Partial<T>): Promise<void> {
    const items: Record<string, any> = {};
    
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
  async getSetting<K extends keyof T>(key: K): Promise<T[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    const items: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(this.defaults)) {
      items[key] = value;
    }
    
    await this.storage.set(items);
    this.cache = { ...this.defaults };
  }

  /**
   * Clear cache (force reload from storage)
   */
  clearCache(): void {
    this.cache = null;
  }
}

// Default export is a singleton storage instance
export const storage = new UnifiedStorage();