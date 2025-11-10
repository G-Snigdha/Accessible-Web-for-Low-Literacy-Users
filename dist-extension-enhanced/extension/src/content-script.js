import { jsx as _jsx } from "react/jsx-runtime";
// Content Script - Injected into web pages
// React import removed - not used in this content script
import { createRoot } from 'react-dom/client';
import Sidebar from './sidebar-root';
import { aiClient } from '@/ai/aiClient';
class ContentScript {
    constructor() {
        this.state = {
            sidebarVisible: false,
            sidebarContainer: null,
            sidebarRoot: null
        };
        this.init();
    }
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupContentScript());
        }
        else {
            this.setupContentScript();
        }
    }
    setupContentScript() {
        console.log('🌟 Accessible Web extension loaded');
        // Listen for messages from popup/background
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });
        // Listen for window messages from sidebar
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'HIDE_SIDEBAR') {
                this.hideSidebar();
            }
        });
        // Create keyboard shortcuts
        this.setupKeyboardShortcuts();
        // Check initial sidebar state
        chrome.storage.local.get(['sidebarEnabled'], (result) => {
            if (result.sidebarEnabled) {
                this.showSidebar();
            }
        });
    }
    handleMessage(message, _sender, sendResponse) {
        switch (message.action) {
            case 'toggle-sidebar':
                if (message.enabled) {
                    this.showSidebar();
                }
                else {
                    this.hideSidebar();
                }
                sendResponse({ success: true });
                break;
            case 'simplify-page':
                this.simplifyPage().then(result => {
                    sendResponse(result);
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                break;
            case 'get-selected-text':
                const selection = window.getSelection();
                const selectedText = selection ? selection.toString().trim() : '';
                sendResponse({ success: true, data: { text: selectedText } });
                break;
            case 'update-settings':
                this.updateSettings(message.settings);
                sendResponse({ success: true });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Alt + A = Toggle sidebar
            if (event.altKey && event.key === 'a') {
                event.preventDefault();
                this.toggleSidebar();
            }
            // Alt + S = Simplify selected text or page
            if (event.altKey && event.key === 's') {
                event.preventDefault();
                this.simplifyPage();
            }
            // Alt + R = Read aloud
            if (event.altKey && event.key === 'r') {
                event.preventDefault();
                this.readAloud();
            }
            // Escape = Hide sidebar
            if (event.key === 'Escape' && this.state.sidebarVisible) {
                event.preventDefault();
                this.hideSidebar();
            }
        });
    }
    toggleSidebar() {
        if (this.state.sidebarVisible) {
            this.hideSidebar();
        }
        else {
            this.showSidebar();
        }
    }
    showSidebar() {
        if (this.state.sidebarVisible)
            return;
        // Create sidebar container
        const container = document.createElement('div');
        container.id = 'accessible-web-sidebar';
        container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      z-index: 999999;
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
        document.body.appendChild(container);
        // Render React sidebar
        const root = createRoot(container);
        root.render(_jsx(Sidebar, {}));
        this.state.sidebarContainer = container;
        this.state.sidebarRoot = root;
        this.state.sidebarVisible = true;
        // Update storage
        chrome.storage.local.set({ sidebarEnabled: true });
    }
    hideSidebar() {
        if (!this.state.sidebarVisible)
            return;
        // Clean up React root
        if (this.state.sidebarRoot) {
            this.state.sidebarRoot.unmount();
        }
        // Remove DOM element
        if (this.state.sidebarContainer) {
            this.state.sidebarContainer.remove();
        }
        this.state.sidebarVisible = false;
        this.state.sidebarContainer = null;
        this.state.sidebarRoot = null;
        // Update storage
        chrome.storage.local.set({ sidebarEnabled: false });
    }
    async simplifyPage() {
        try {
            // Get selected text or main content
            const selection = window.getSelection();
            let text = selection ? selection.toString().trim() : '';
            if (!text) {
                text = this.getMainContent();
            }
            if (!text) {
                return { success: false, error: 'No text found to simplify' };
            }
            const result = await aiClient.summarize(text, {
                maxSentences: 3,
                readingLevel: 'very-simple'
            });
            if (result.success) {
                // Show notification
                this.showNotification('✨ Text simplified!', result.data?.summary?.substring(0, 100) + '...');
                return result;
            }
            else {
                return result;
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async readAloud() {
        try {
            const selection = window.getSelection();
            let text = selection ? selection.toString().trim() : '';
            if (!text) {
                text = this.getMainContent();
            }
            if (!text) {
                this.showNotification('❌ No text found to read');
                return;
            }
            this.showNotification('🔊 Reading aloud...');
            const result = await aiClient.readAloud(text, {
                rate: 0.8,
                language: 'en'
            });
            if (!result.success) {
                this.showNotification('❌ Failed to read aloud: ' + result.error);
            }
        }
        catch (error) {
            console.error('Read aloud error:', error);
            this.showNotification('❌ Failed to read aloud');
        }
    }
    getMainContent() {
        // Try to find main content using various selectors
        const selectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '.content',
            '#content',
            '.post-content',
            '.entry-content',
            'h1, h2, h3, p'
        ];
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                const text = Array.from(elements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 50)
                    .join(' ');
                if (text.length > 100) {
                    return text;
                }
            }
        }
        // Fallback: get text from body, excluding navigation and sidebars
        const body = document.body.cloneNode(true);
        const excludeSelectors = [
            'nav', 'header', 'footer', '.nav', '.navigation',
            '.sidebar', '#sidebar', '.menu', '.ads',
            'script', 'style', '.cookie-notice'
        ];
        excludeSelectors.forEach(selector => {
            const elements = body.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        return body.textContent?.trim() || '';
    }
    updateSettings(settings) {
        // Update sidebar if visible
        if (this.state.sidebarVisible && this.state.sidebarContainer) {
            // Apply font size
            this.state.sidebarContainer.className = `sidebar ${settings.fontSize}`;
            // Apply high contrast
            if (settings.highContrast) {
                this.state.sidebarContainer.classList.add('high-contrast');
            }
            else {
                this.state.sidebarContainer.classList.remove('high-contrast');
            }
        }
    }
    showNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
        notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: ${message ? '4px' : '0'};">${title}</div>
      ${message ? `<div style="font-size: 12px; opacity: 0.9;">${message}</div>` : ''}
    `;
        document.body.appendChild(notification);
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}
// Initialize content script
new ContentScript();
