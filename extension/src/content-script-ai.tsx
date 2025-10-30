/**
 * Enhanced Content Script for Chrome Built-in AI Challenge 2025
 * Uses Chrome's Built-in AI APIs for real-time on-page text processing
 */

import { createRoot } from 'react-dom/client';
import Sidebar from './sidebar-root';
import { chromeAI } from './services/chromeAI';

interface ContentScriptState {
  sidebarVisible: boolean;
  sidebarContainer: HTMLElement | null;
  sidebarRoot: any;
  aiAvailability: any;
}

class ContentScriptAI {
  private state: ContentScriptState = {
    sidebarVisible: false,
    sidebarContainer: null,
    sidebarRoot: null,
    aiAvailability: null
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupContentScript());
    } else {
      this.setupContentScript();
    }
    
    // Check AI availability
    this.state.aiAvailability = await chromeAI.checkAvailability();
  }

  private setupContentScript() {
    console.log('🧠 Chrome Built-in AI extension loaded');

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Setup context menu integration
    this.setupTextSelection();

    // Check initial sidebar state
    chrome.storage.local.get(['sidebarEnabled'], (result) => {
      if (result.sidebarEnabled) {
        this.showSidebar();
      }
    });
  }

  private handleMessage(message: any, _sender: any, sendResponse: (response?: any) => void) {
    switch (message.action) {
      case 'toggle-sidebar':
        if (message.enabled) {
          this.showSidebar();
        } else {
          this.hideSidebar();
        }
        sendResponse({ success: true });
        break;

      case 'simplify-selection':
        this.simplifySelection().then(result => {
          sendResponse(result);
        });
        break;

      case 'summarize-page':
        this.summarizePage().then(result => {
          sendResponse(result);
        });
        break;
        
      case 'proofread-selection':
        this.proofreadSelection().then(result => {
          sendResponse(result);
        });
        break;
        
      case 'translate-selection':
        this.translateSelection(message.targetLanguage).then(result => {
          sendResponse(result);
        });
        break;
        
      case 'rewrite-selection':
        this.rewriteSelection(message.options).then(result => {
          sendResponse(result);
        });
        break;

      case 'get-selected-text':
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';
        sendResponse({ success: true, data: { text: selectedText } });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', async (event) => {
      // Alt + A = Toggle sidebar
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        this.toggleSidebar();
      }

      // Alt + S = Simplify selected text
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        await this.simplifySelection();
      }

      // Alt + P = Proofread selected text
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        await this.proofreadSelection();
      }

      // Alt + T = Translate selected text
      if (event.altKey && event.key === 't') {
        event.preventDefault();
        await this.translateSelection('es');
      }
      
      // Alt + R = Rewrite selected text
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        await this.rewriteSelection({ tone: 'more-formal' });
      }
      
      // Alt + U = Summarize page
      if (event.altKey && event.key === 'u') {
        event.preventDefault();
        await this.summarizePage();
      }

      // Escape = Hide sidebar
      if (event.key === 'Escape' && this.state.sidebarVisible) {
        event.preventDefault();
        this.hideSidebar();
      }
    });
  }
  
  private setupTextSelection() {
    // Show AI processing tooltip on text selection
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 10) {
        // Could show floating toolbar with AI options
        // For now, just log availability
        console.log('Text selected. Use Alt+S (Simplify), Alt+P (Proofread), Alt+T (Translate), Alt+R (Rewrite)');
      }
    });
  }

  private toggleSidebar() {
    if (this.state.sidebarVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

  private showSidebar() {
    if (this.state.sidebarVisible) return;

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

    const root = createRoot(container);
    root.render(<Sidebar />);

    this.state.sidebarContainer = container;
    this.state.sidebarRoot = root;
    this.state.sidebarVisible = true;

    chrome.storage.local.set({ sidebarEnabled: true });
  }

  private hideSidebar() {
    if (!this.state.sidebarVisible) return;

    if (this.state.sidebarRoot) {
      this.state.sidebarRoot.unmount();
    }

    if (this.state.sidebarContainer) {
      this.state.sidebarContainer.remove();
    }

    this.state.sidebarVisible = false;
    this.state.sidebarContainer = null;
    this.state.sidebarRoot = null;

    chrome.storage.local.set({ sidebarEnabled: false });
  }

  private async simplifySelection(): Promise<any> {
    try {
      const selectedText = this.getSelectedText();
      
      if (!selectedText) {
        this.showNotification('ℹ️ No text selected', 'Please select some text first');
        return { success: false, error: 'No text selected' };
      }

      this.showNotification('⏳ Simplifying...', 'Using Chrome Built-in AI');

      const result = await chromeAI.simplify(selectedText);

      if (result.success && result.data) {
        this.showNotification('✨ Simplified!', result.data.substring(0, 100) + '...');
        
        // Replace selected text with simplified version
        this.replaceSelection(result.data);
        
        return result;
      } else {
        this.showNotification('❌ Simplification failed', result.error || 'Unknown error');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.showNotification('❌ Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  }
  
  private async proofreadSelection(): Promise<any> {
    try {
      const selectedText = this.getSelectedText();
      
      if (!selectedText) {
        this.showNotification('ℹ️ No text selected', 'Please select some text first');
        return { success: false, error: 'No text selected' };
      }

      this.showNotification('⏳ Proofreading...', 'Using Chrome Built-in AI');

      const result = await chromeAI.proofread(selectedText);

      if (result.success && result.data) {
        const { correctedText, corrections } = result.data;
        const correctionCount = corrections.length;
        
        this.showNotification(
          correctionCount > 0 ? `✅ Found ${correctionCount} correction(s)` : '✅ No errors found!',
          correctedText.substring(0, 100) + (correctedText.length > 100 ? '...' : '')
        );
        
        return result;
      } else {
        this.showNotification('❌ Proofreading failed', result.error || 'Unknown error');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.showNotification('❌ Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  }
  
  private async translateSelection(targetLanguage: string = 'es'): Promise<any> {
    try {
      const selectedText = this.getSelectedText();
      
      if (!selectedText) {
        this.showNotification('ℹ️ No text selected', 'Please select some text first');
        return { success: false, error: 'No text selected' };
      }

      this.showNotification('⏳ Translating...', `To ${targetLanguage.toUpperCase()}`);

      const result = await chromeAI.translate(selectedText, {
        sourceLanguage: 'en',
        targetLanguage
      });

      if (result.success && result.data) {
        this.showNotification('🌐 Translated!', result.data.substring(0, 100) + '...');
        return result;
      } else {
        this.showNotification('❌ Translation failed', result.error || 'Unknown error');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.showNotification('❌ Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  }
  
  private async rewriteSelection(options?: { tone?: any; length?: any }): Promise<any> {
    try {
      const selectedText = this.getSelectedText();
      
      if (!selectedText) {
        this.showNotification('ℹ️ No text selected', 'Please select some text first');
        return { success: false, error: 'No text selected' };
      }

      this.showNotification('⏳ Rewriting...', 'Using Chrome Built-in AI');

      const result = await chromeAI.rewrite(selectedText, options);

      if (result.success && result.data) {
        this.showNotification('🖊️ Rewritten!', result.data.substring(0, 100) + '...');
        return result;
      } else {
        this.showNotification('❌ Rewriting failed', result.error || 'Unknown error');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.showNotification('❌ Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  private async summarizePage(): Promise<any> {
    try {
      const mainContent = this.getMainContent();
      
      if (!mainContent || mainContent.length < 100) {
        this.showNotification('ℹ️ Not enough content', 'Could not find substantial text to summarize');
        return { success: false, error: 'Not enough content' };
      }

      this.showNotification('⏳ Summarizing page...', 'Using Chrome Built-in AI');

      const result = await chromeAI.summarize(mainContent, {
        type: 'tl;dr',
        length: 'short',
        format: 'plain-text'
      });

      if (result.success && result.data) {
        this.showNotification('📄 Page Summary', result.data, 8000); // Show longer
        return result;
      } else {
        this.showNotification('❌ Summarization failed', result.error || 'Unknown error');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.showNotification('❌ Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  private getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  }

  private getMainContent(): string {
    // Try to find main content using various selectors
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '.post-content',
      '.entry-content'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const text = Array.from(elements)
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 50)
          .join(' ');
        
        if (text.length > 100) {
          return text.substring(0, 5000); // Limit to 5000 chars
        }
      }
    }

    // Fallback: get all paragraph text
    const paragraphs = document.querySelectorAll('p');
    const text = Array.from(paragraphs)
      .map(p => p.textContent?.trim())
      .filter(text => text && text.length > 20)
      .join(' ');
    
    return text.substring(0, 5000); // Limit to 5000 chars
  }

  // Replace selected text with new content (used for simplify, rewrite, translate)
  private replaceSelection(newText: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
  }

  private showNotification(title: string, message?: string, duration: number = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      z-index: 10000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: ${message ? '8px' : '0'}; font-size: 15px;">${title}</div>
      ${message ? `<div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">${message}</div>` : ''}
      <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">🧠 Chrome Built-in AI • Privacy-First</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove with animation
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
        style.remove();
      }, 300);
    }, duration);
  }
}

// Initialize content script
new ContentScriptAI();
