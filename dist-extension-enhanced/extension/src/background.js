// Background Service Worker for Chrome Extension
import { aiClient } from '@/ai/aiClient';
class BackgroundService {
    constructor() {
        this.state = {
            isInstalled: false
        };
        this.init();
    }
    init() {
        console.log('🌟 Accessible Web background service started');
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });
        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async responses
        });
        // Handle tab updates to track active tab
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.state.activeTabId = activeInfo.tabId;
        });
        // Handle browser action (extension icon) click
        chrome.action.onClicked.addListener((tab) => {
            this.handleActionClick(tab);
        });
        // Handle keyboard shortcuts
        chrome.commands.onCommand.addListener((command, tab) => {
            this.handleCommand(command, tab);
        });
        // Initialize AI client
        this.initializeAI();
    }
    handleInstallation(details) {
        console.log('Extension installed:', details.reason);
        if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            // First time installation
            this.setupDefaultSettings();
            // Open welcome page
            chrome.tabs.create({
                url: chrome.runtime.getURL('options.html') + '?welcome=true'
            });
        }
        else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
            // Extension updated
            console.log('Extension updated to version:', chrome.runtime.getManifest().version);
        }
        this.state.isInstalled = true;
    }
    setupDefaultSettings() {
        const defaultSettings = {
            fontSize: 'medium',
            language: 'en',
            autoSimplify: false,
            autoReadAloud: false,
            offlineMode: true,
            highContrast: false,
            reduceMotion: false,
            sidebarEnabled: false,
            voiceSettings: {
                rate: 0.8,
                pitch: 1.0,
                volume: 0.8,
                voice: ''
            }
        };
        chrome.storage.local.set(defaultSettings, () => {
            console.log('Default settings saved');
        });
    }
    handleMessage(message, _sender, sendResponse) {
        switch (message.action) {
            case 'get-ai-availability':
                this.checkAIAvailability().then(result => {
                    sendResponse({ success: true, data: result });
                });
                break;
            case 'simplify-text':
                this.simplifyText(message.text, message.options).then(result => {
                    sendResponse(result);
                });
                break;
            case 'translate-text':
                this.translateText(message.text, message.options).then(result => {
                    sendResponse(result);
                });
                break;
            case 'rewrite-text':
                this.rewriteText(message.text, message.options).then(result => {
                    sendResponse(result);
                });
                break;
            case 'proofread-text':
                this.proofreadText(message.text, message.options).then(result => {
                    sendResponse(result);
                });
                break;
            case 'read-aloud':
                this.readAloud(message.text, message.options).then(result => {
                    sendResponse(result);
                });
                break;
            case 'get-settings':
                chrome.storage.local.get(null, (settings) => {
                    sendResponse({ success: true, data: settings });
                });
                break;
            case 'save-settings':
                chrome.storage.local.set(message.settings, () => {
                    sendResponse({ success: true });
                });
                break;
            case 'show-notification':
                this.showNotification(message.title, message.message, message.options);
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
    handleActionClick(tab) {
        if (!tab.id)
            return;
        // Toggle sidebar on current tab
        chrome.tabs.sendMessage(tab.id, {
            action: 'toggle-sidebar',
            enabled: true
        });
    }
    handleCommand(command, tab) {
        if (!tab?.id)
            return;
        switch (command) {
            case 'toggle-sidebar':
                chrome.tabs.sendMessage(tab.id, { action: 'toggle-sidebar' });
                break;
            case 'simplify-page':
                chrome.tabs.sendMessage(tab.id, { action: 'simplify-page' });
                break;
            case 'read-aloud':
                chrome.tabs.sendMessage(tab.id, { action: 'read-aloud' });
                break;
        }
    }
    async initializeAI() {
        try {
            // Check if Chrome Built-in AI APIs are available
            const availability = aiClient.checkAIAvailability();
            console.log('AI availability:', availability);
            // Store availability in extension storage for popup/content script access
            chrome.storage.local.set({ aiAvailability: availability });
        }
        catch (error) {
            console.error('Failed to initialize AI:', error);
        }
    }
    async checkAIAvailability() {
        return aiClient.checkAIAvailability();
    }
    async simplifyText(text, options = {}) {
        try {
            return await aiClient.summarize(text, {
                maxSentences: options.maxSentences || 3,
                readingLevel: options.readingLevel || 'very-simple'
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Simplification failed'
            };
        }
    }
    async translateText(text, options = {}) {
        try {
            return await aiClient.translate(text, {
                targetLanguage: options.targetLanguage || 'en',
                sourceLanguage: options.sourceLanguage
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Translation failed'
            };
        }
    }
    async rewriteText(text, options = {}) {
        try {
            return await aiClient.rewrite(text, {
                style: options.style || 'simple',
                readingLevel: options.readingLevel || 'very-simple',
                tone: options.tone || 'neutral'
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Rewriting failed'
            };
        }
    }
    async proofreadText(text, options = {}) {
        try {
            return await aiClient.proofread(text, {
                checkGrammar: options.checkGrammar !== false,
                checkSpelling: options.checkSpelling !== false,
                simplifyLanguage: options.simplifyLanguage
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Proofreading failed'
            };
        }
    }
    async readAloud(text, options = {}) {
        try {
            return await aiClient.readAloud(text, {
                rate: options.rate || 0.8,
                pitch: options.pitch || 1.0,
                volume: options.volume || 0.8,
                language: options.language || 'en',
                voice: options.voice
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Read aloud failed'
            };
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
    // Context menu setup (optional) - for future enhancement
    // @ts-ignore - unused method for future feature
    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'simplify-selection',
            title: 'Simplify selected text',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'translate-selection',
            title: 'Translate selected text',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: 'read-selection',
            title: 'Read selected text aloud',
            contexts: ['selection']
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (!tab?.id)
                return;
            switch (info.menuItemId) {
                case 'simplify-selection':
                    if (info.selectionText) {
                        this.simplifyText(info.selectionText).then(result => {
                            this.showNotification('✨ Text Simplified', result.data?.summary);
                        });
                    }
                    break;
                case 'translate-selection':
                    if (info.selectionText) {
                        this.translateText(info.selectionText, { targetLanguage: 'es' }).then(result => {
                            this.showNotification('🌍 Text Translated', result.data?.translatedText);
                        });
                    }
                    break;
                case 'read-selection':
                    if (info.selectionText) {
                        this.readAloud(info.selectionText);
                    }
                    break;
            }
        });
    }
}
// Initialize background service
new BackgroundService();
