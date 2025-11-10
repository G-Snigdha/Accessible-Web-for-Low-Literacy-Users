/**
 * Enhanced Background Service Worker for Accessible Web Extension
 * Handles AI processing, settings management, and cross-tab communication
 */
import { chromeAI } from './services/chromeAI';
class EnhancedBackgroundService {
    constructor() {
        this.state = {
            isInstalled: false,
            aiAvailability: null,
            settings: null
        };
        this.processingHistory = [];
        this.init();
    }
    async init() {
        console.log('🧠 Enhanced Accessible Web background service started');
        // Setup event listeners
        this.setupInstallationHandler();
        this.setupMessageHandler();
        this.setupTabHandler();
        this.setupActionHandler();
        this.setupCommandHandler();
        this.setupContextMenus();
        // Initialize AI and settings
        await this.initializeAI();
        await this.loadSettings();
    }
    setupInstallationHandler() {
        chrome.runtime.onInstalled.addListener(async (details) => {
            console.log('Extension installed:', details.reason);
            if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
                await this.setupDefaultSettings();
                await this.showWelcomeTab();
            }
            else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
                console.log('Extension updated to version:', chrome.runtime.getManifest().version);
                await this.handleUpdate(details);
            }
            this.state.isInstalled = true;
        });
    }
    setupMessageHandler() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async responses
        });
    }
    setupTabHandler() {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.state.activeTabId = activeInfo.tabId;
        });
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                // Could inject accessibility improvements automatically here
                this.checkPageAccessibility(tabId, tab.url);
            }
        });
    }
    setupActionHandler() {
        chrome.action.onClicked.addListener(async (tab) => {
            if (!tab.id)
                return;
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggle-sidebar'
                });
            }
            catch (error) {
                console.log('Could not communicate with tab, possibly restricted page');
            }
        });
    }
    setupCommandHandler() {
        chrome.commands.onCommand.addListener(async (command, tab) => {
            if (!tab?.id)
                return;
            try {
                switch (command) {
                    case 'toggle-sidebar':
                        await chrome.tabs.sendMessage(tab.id, { action: 'toggle-sidebar' });
                        break;
                    case 'simplify-page':
                        await chrome.tabs.sendMessage(tab.id, { action: 'process-selection', type: 'simplify' });
                        break;
                    case 'read-aloud':
                        await chrome.tabs.sendMessage(tab.id, { action: 'process-selection', type: 'speak' });
                        break;
                }
            }
            catch (error) {
                console.log('Could not execute command on tab:', error);
            }
        });
    }
    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'simplify-selection',
            title: '✨ Simplify this text',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'proofread-selection',
            title: '🔤 Proofread this text',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'translate-selection',
            title: '🌐 Translate this text',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'speak-selection',
            title: '🔊 Read this aloud',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'explain-selection',
            title: '💡 Explain this text',
            contexts: ['selection']
        });
        chrome.contextMenus.onClicked.addListener(async (info, tab) => {
            if (!tab?.id || !info.selectionText)
                return;
            const action = info.menuItemId.toString().replace('-selection', '');
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'process-selection',
                    type: action,
                    text: info.selectionText
                });
            }
            catch (error) {
                console.log('Could not process selection:', error);
                this.showNotification('Error', 'Could not process selected text. Please try again.');
            }
        });
    }
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'get-ai-availability':
                    const availability = await chromeAI.checkAvailability();
                    sendResponse({ success: true, data: availability });
                    break;
                case 'process-text':
                    const result = await this.processText(message.type, message.text, message.options);
                    // Save to history
                    if (result.success && result.data) {
                        this.addToHistory({
                            action: message.type,
                            originalText: message.text,
                            processedText: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
                            tabUrl: sender.tab?.url
                        });
                    }
                    sendResponse(result);
                    break;
                case 'get-settings':
                    sendResponse({ success: true, data: this.state.settings });
                    break;
                case 'save-settings':
                    await this.saveSettings(message.settings);
                    sendResponse({ success: true });
                    break;
                case 'get-history':
                    sendResponse({ success: true, data: this.processingHistory.slice(-50) });
                    break;
                case 'clear-history':
                    this.processingHistory = [];
                    await chrome.storage.local.remove('processingHistory');
                    sendResponse({ success: true });
                    break;
                case 'show-notification':
                    this.showNotification(message.title, message.message, message.options);
                    sendResponse({ success: true });
                    break;
                case 'open-options':
                    chrome.runtime.openOptionsPage();
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        }
        catch (error) {
            console.error('Background message handling error:', error);
            sendResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async setupDefaultSettings() {
        const defaultSettings = {
            accessibility: {
                enableTextToSpeech: true,
                speechRate: 1.0,
                speechVoice: '',
                enableKeyboardShortcuts: true,
                showTooltips: true,
                highlightDifficultWords: true,
                fontSize: 'medium',
                enableHighContrast: false,
            },
            aiPreferences: {
                defaultSimplificationLevel: 'medium',
                preferredLanguage: 'en',
                autoDetectLanguage: true,
                enableSmartSuggestions: true,
                processOnSelect: false,
                showConfidenceScores: false,
            },
            interface: {
                theme: 'light',
                sidebarPosition: 'right',
                compactMode: false,
                enableAnimations: true,
                notificationLevel: 'important',
                autoSaveResults: true,
            },
            privacy: {
                saveHistory: true,
                maxHistoryItems: 100,
                enableAnalytics: false,
                shareUsageStats: false,
            },
        };
        await chrome.storage.sync.set({ extensionSettings: defaultSettings });
        this.state.settings = defaultSettings;
    }
    async showWelcomeTab() {
        await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html') + '?welcome=true'
        });
    }
    async handleUpdate(details) {
        // Handle any migration or update logic here
        const currentVersion = chrome.runtime.getManifest().version;
        // Show update notification
        this.showNotification('Extension Updated! 🎉', `Accessible Web has been updated to version ${currentVersion}`, { priority: 1 });
    }
    async initializeAI() {
        try {
            this.state.aiAvailability = await chromeAI.checkAvailability();
            console.log('AI availability:', this.state.aiAvailability);
            // Store availability for quick access by content scripts
            await chrome.storage.local.set({ aiAvailability: this.state.aiAvailability });
        }
        catch (error) {
            console.error('Failed to initialize AI:', error);
        }
    }
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('extensionSettings');
            this.state.settings = result.extensionSettings || null;
            // Load processing history
            const historyResult = await chrome.storage.local.get('processingHistory');
            this.processingHistory = historyResult.processingHistory || [];
        }
        catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    async saveSettings(settings) {
        try {
            await chrome.storage.sync.set({ extensionSettings: settings });
            this.state.settings = settings;
        }
        catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
        }
    }
    async processText(type, text, options = {}) {
        try {
            let result;
            switch (type) {
                case 'simplify':
                    result = await chromeAI.prompt(`Simplify this text to make it easier to understand. Use simpler words and shorter sentences while keeping the same meaning:\n\n${text}`, { systemPrompt: 'You are a helpful assistant that simplifies text for better readability.' });
                    break;
                case 'proofread':
                    result = await chromeAI.proofread(text, {
                        correctGrammar: options.correctGrammar !== false,
                        correctSpelling: options.correctSpelling !== false,
                        improvePunctuation: options.improvePunctuation !== false
                    });
                    break;
                case 'translate':
                    result = await chromeAI.translate(text, {
                        sourceLanguage: options.sourceLanguage || 'en',
                        targetLanguage: options.targetLanguage || this.state.settings?.aiPreferences?.preferredLanguage || 'es'
                    });
                    break;
                case 'rewrite':
                    result = await chromeAI.rewrite(text, {
                        tone: options.tone || 'more-formal',
                        length: options.length || 'as-is'
                    });
                    break;
                case 'explain':
                    result = await chromeAI.prompt(`Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:\n\n${text}`, { systemPrompt: 'You are a helpful teacher that explains complex topics in simple, easy-to-understand language.' });
                    break;
                case 'summarize':
                    result = await chromeAI.summarize(text, {
                        type: options.type || 'tl;dr',
                        length: options.length || 'short',
                        format: 'plain-text'
                    });
                    break;
                default:
                    throw new Error('Unknown processing type');
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Processing failed'
            };
        }
    }
    addToHistory(item) {
        const historyItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: Date.now()
        };
        this.processingHistory.push(historyItem);
        // Keep only the last N items based on settings
        const maxItems = this.state.settings?.privacy?.maxHistoryItems || 100;
        if (this.processingHistory.length > maxItems) {
            this.processingHistory = this.processingHistory.slice(-maxItems);
        }
        // Save to storage
        chrome.storage.local.set({ processingHistory: this.processingHistory });
    }
    async checkPageAccessibility(tabId, url) {
        // Skip chrome:// and other restricted URLs
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
            return;
        }
        try {
            // Could inject accessibility scanner here in the future
            console.log('Checking accessibility for:', url);
        }
        catch (error) {
            console.log('Could not check page accessibility:', error);
        }
    }
    showNotification(title, message, options = {}) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title,
            message: message || '',
            priority: options.priority || 1
        });
    }
}
// Initialize enhanced background service
new EnhancedBackgroundService();
