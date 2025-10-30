import { chromeAI as o } from "./chromeAI.js";
class n {
  constructor() {
    this.state = {
      isInstalled: !1,
      aiAvailability: null,
      settings: null
    }, this.processingHistory = [], this.init();
  }
  async init() {
    console.log("🧠 Enhanced Accessible Web background service started"), this.setupInstallationHandler(), this.setupMessageHandler(), this.setupTabHandler(), this.setupActionHandler(), this.setupCommandHandler(), this.setupContextMenus(), await this.initializeAI(), await this.loadSettings();
  }
  setupInstallationHandler() {
    chrome.runtime.onInstalled.addListener(async (e) => {
      console.log("Extension installed:", e.reason), e.reason === chrome.runtime.OnInstalledReason.INSTALL ? (await this.setupDefaultSettings(), await this.showWelcomeTab()) : e.reason === chrome.runtime.OnInstalledReason.UPDATE && (console.log("Extension updated to version:", chrome.runtime.getManifest().version), await this.handleUpdate(e)), this.state.isInstalled = !0;
    });
  }
  setupMessageHandler() {
    chrome.runtime.onMessage.addListener((e, t, s) => (this.handleMessage(e, t, s), !0));
  }
  setupTabHandler() {
    chrome.tabs.onActivated.addListener((e) => {
      this.state.activeTabId = e.tabId;
    }), chrome.tabs.onUpdated.addListener((e, t, s) => {
      t.status === "complete" && s.url && this.checkPageAccessibility(e, s.url);
    });
  }
  setupActionHandler() {
    chrome.action.onClicked.addListener(async (e) => {
      if (e.id)
        try {
          await chrome.tabs.sendMessage(e.id, {
            action: "toggle-sidebar"
          });
        } catch {
          console.log("Could not communicate with tab, possibly restricted page");
        }
    });
  }
  setupCommandHandler() {
    chrome.commands.onCommand.addListener(async (e, t) => {
      if (t != null && t.id)
        try {
          switch (e) {
            case "toggle-sidebar":
              await chrome.tabs.sendMessage(t.id, { action: "toggle-sidebar" });
              break;
            case "simplify-page":
              await chrome.tabs.sendMessage(t.id, { action: "process-selection", type: "simplify" });
              break;
            case "read-aloud":
              await chrome.tabs.sendMessage(t.id, { action: "process-selection", type: "speak" });
              break;
          }
        } catch (s) {
          console.log("Could not execute command on tab:", s);
        }
    });
  }
  setupContextMenus() {
    chrome.contextMenus.create({
      id: "simplify-selection",
      title: "✨ Simplify this text",
      contexts: ["selection"]
    }), chrome.contextMenus.create({
      id: "proofread-selection",
      title: "🔤 Proofread this text",
      contexts: ["selection"]
    }), chrome.contextMenus.create({
      id: "translate-selection",
      title: "🌐 Translate this text",
      contexts: ["selection"]
    }), chrome.contextMenus.create({
      id: "speak-selection",
      title: "🔊 Read this aloud",
      contexts: ["selection"]
    }), chrome.contextMenus.create({
      id: "explain-selection",
      title: "💡 Explain this text",
      contexts: ["selection"]
    }), chrome.contextMenus.onClicked.addListener(async (e, t) => {
      if (!(t != null && t.id) || !e.selectionText) return;
      const s = e.menuItemId.toString().replace("-selection", "");
      try {
        await chrome.tabs.sendMessage(t.id, {
          action: "process-selection",
          type: s,
          text: e.selectionText
        });
      } catch (r) {
        console.log("Could not process selection:", r), this.showNotification("Error", "Could not process selected text. Please try again.");
      }
    });
  }
  async handleMessage(e, t, s) {
    var r;
    try {
      switch (e.action) {
        case "get-ai-availability":
          const a = await o.checkAvailability();
          s({ success: !0, data: a });
          break;
        case "process-text":
          const i = await this.processText(e.type, e.text, e.options);
          i.success && i.data && this.addToHistory({
            action: e.type,
            originalText: e.text,
            processedText: typeof i.data == "string" ? i.data : JSON.stringify(i.data),
            tabUrl: (r = t.tab) == null ? void 0 : r.url
          }), s(i);
          break;
        case "get-settings":
          s({ success: !0, data: this.state.settings });
          break;
        case "save-settings":
          await this.saveSettings(e.settings), s({ success: !0 });
          break;
        case "get-history":
          s({ success: !0, data: this.processingHistory.slice(-50) });
          break;
        case "clear-history":
          this.processingHistory = [], await chrome.storage.local.remove("processingHistory"), s({ success: !0 });
          break;
        case "show-notification":
          this.showNotification(e.title, e.message, e.options), s({ success: !0 });
          break;
        case "open-options":
          chrome.runtime.openOptionsPage(), s({ success: !0 });
          break;
        default:
          s({ success: !1, error: "Unknown action" });
      }
    } catch (a) {
      console.error("Background message handling error:", a), s({
        success: !1,
        error: a instanceof Error ? a.message : "Unknown error"
      });
    }
  }
  async setupDefaultSettings() {
    const e = {
      accessibility: {
        enableTextToSpeech: !0,
        speechRate: 1,
        speechVoice: "",
        enableKeyboardShortcuts: !0,
        showTooltips: !0,
        highlightDifficultWords: !0,
        fontSize: "medium",
        enableHighContrast: !1
      },
      aiPreferences: {
        defaultSimplificationLevel: "medium",
        preferredLanguage: "en",
        autoDetectLanguage: !0,
        enableSmartSuggestions: !0,
        processOnSelect: !1,
        showConfidenceScores: !1
      },
      interface: {
        theme: "light",
        sidebarPosition: "right",
        compactMode: !1,
        enableAnimations: !0,
        notificationLevel: "important",
        autoSaveResults: !0
      },
      privacy: {
        saveHistory: !0,
        maxHistoryItems: 100,
        enableAnalytics: !1,
        shareUsageStats: !1
      }
    };
    await chrome.storage.sync.set({ extensionSettings: e }), this.state.settings = e;
  }
  async showWelcomeTab() {
    await chrome.tabs.create({
      url: chrome.runtime.getURL("options.html") + "?welcome=true"
    });
  }
  async handleUpdate(e) {
    const t = chrome.runtime.getManifest().version;
    this.showNotification(
      "Extension Updated! 🎉",
      `Accessible Web has been updated to version ${t}`,
      { priority: 1 }
    );
  }
  async initializeAI() {
    try {
      this.state.aiAvailability = await o.checkAvailability(), console.log("AI availability:", this.state.aiAvailability), await chrome.storage.local.set({ aiAvailability: this.state.aiAvailability });
    } catch (e) {
      console.error("Failed to initialize AI:", e);
    }
  }
  async loadSettings() {
    try {
      const e = await chrome.storage.sync.get("extensionSettings");
      this.state.settings = e.extensionSettings || null;
      const t = await chrome.storage.local.get("processingHistory");
      this.processingHistory = t.processingHistory || [];
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }
  async saveSettings(e) {
    try {
      await chrome.storage.sync.set({ extensionSettings: e }), this.state.settings = e;
    } catch (t) {
      throw console.error("Failed to save settings:", t), t;
    }
  }
  async processText(e, t, s = {}) {
    var r, a;
    try {
      let i;
      switch (e) {
        case "simplify":
          i = await o.prompt(
            `Simplify this text to make it easier to understand. Use simpler words and shorter sentences while keeping the same meaning:

${t}`,
            { systemPrompt: "You are a helpful assistant that simplifies text for better readability." }
          );
          break;
        case "proofread":
          i = await o.proofread(t, {
            correctGrammar: s.correctGrammar !== !1,
            correctSpelling: s.correctSpelling !== !1,
            improvePunctuation: s.improvePunctuation !== !1
          });
          break;
        case "translate":
          i = await o.translate(t, {
            sourceLanguage: s.sourceLanguage || "en",
            targetLanguage: s.targetLanguage || ((a = (r = this.state.settings) == null ? void 0 : r.aiPreferences) == null ? void 0 : a.preferredLanguage) || "es"
          });
          break;
        case "rewrite":
          i = await o.rewrite(t, {
            tone: s.tone || "more-formal",
            length: s.length || "as-is"
          });
          break;
        case "explain":
          i = await o.prompt(
            `Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:

${t}`,
            { systemPrompt: "You are a helpful teacher that explains complex topics in simple, easy-to-understand language." }
          );
          break;
        case "summarize":
          i = await o.summarize(t, {
            type: s.type || "tl;dr",
            length: s.length || "short",
            format: "plain-text"
          });
          break;
        default:
          throw new Error("Unknown processing type");
      }
      return i;
    } catch (i) {
      return {
        success: !1,
        error: i instanceof Error ? i.message : "Processing failed"
      };
    }
  }
  addToHistory(e) {
    var r, a;
    const t = {
      ...e,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    this.processingHistory.push(t);
    const s = ((a = (r = this.state.settings) == null ? void 0 : r.privacy) == null ? void 0 : a.maxHistoryItems) || 100;
    this.processingHistory.length > s && (this.processingHistory = this.processingHistory.slice(-s)), chrome.storage.local.set({ processingHistory: this.processingHistory });
  }
  async checkPageAccessibility(e, t) {
    if (!(t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("moz-extension://")))
      try {
        console.log("Checking accessibility for:", t);
      } catch (s) {
        console.log("Could not check page accessibility:", s);
      }
  }
  showNotification(e, t, s = {}) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-48.png",
      title: e,
      message: t || "",
      priority: s.priority || 1
    });
  }
}
new n();
