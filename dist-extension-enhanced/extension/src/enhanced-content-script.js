import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Enhanced Content Script for Accessible Web Extension
 * Features: AI processing, text-to-speech, smart sidebar, accessibility tools
 */
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { chromeAI } from './services/chromeAI';
// Default Settings
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
        processOnSelect: false,
    },
    interface: {
        sidebarPosition: 'right',
        theme: 'light',
        enableAnimations: true,
    },
};
// Notification Component
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            background: colors[type],
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000000,
            maxWidth: '400px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out'
        }, onClick: onClose, children: [_jsxs("span", { style: { fontSize: '16px' }, children: [type === 'success' && '✅', type === 'error' && '❌', type === 'info' && 'ℹ️', type === 'warning' && '⚠️'] }), message] }));
};
// Floating Toolbar Component
const FloatingToolbar = ({ selectedText, position, onAction, onClose }) => {
    const actions = [
        { key: 'simplify', label: '✨ Simplify', color: '#667eea' },
        { key: 'proofread', label: '🔤 Proofread', color: '#f093fb' },
        { key: 'translate', label: '🌐 Translate', color: '#4facfe' },
        { key: 'speak', label: '🔊 Speak', color: '#43e97b' },
        { key: 'explain', label: '💡 Explain', color: '#fa709a' },
    ];
    return (_jsxs("div", { style: {
            position: 'fixed',
            left: `${Math.min(position.x, window.innerWidth - 280)}px`,
            top: `${Math.max(position.y - 60, 10)}px`,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            padding: '8px',
            zIndex: 1000000,
            display: 'flex',
            gap: '4px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'fadeIn 0.2s ease-out'
        }, children: [actions.map(action => (_jsx("button", { onClick: () => onAction(action.key, selectedText), style: {
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: action.color,
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }, children: action.label }, action.key))), _jsx("button", { onClick: onClose, style: {
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#6b7280',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                }, children: "\u2715" })] }));
};
// Enhanced Sidebar Component
const EnhancedSidebar = ({ isVisible, position, theme, onClose, onAction }) => {
    const [activeTab, setActiveTab] = useState('ai');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('simplify');
    const sidebarStyle = {
        position: 'fixed',
        top: '0',
        [position]: '0',
        width: '380px',
        height: '100vh',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
        boxShadow: position === 'right' ? '-4px 0 20px rgba(0,0,0,0.1)' : '4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 999999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: isVisible ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: `translateX(${isVisible ? '0' : (position === 'right' ? '100%' : '-100%')})`,
        transition: 'transform 0.3s ease-in-out'
    };
    const processText = async () => {
        if (!inputText.trim())
            return;
        setIsProcessing(true);
        setOutputText('Processing...');
        try {
            let result;
            switch (currentFeature) {
                case 'simplify':
                    result = await chromeAI.prompt(`Simplify this text to make it easier to understand. Keep the same meaning but use simpler words and shorter sentences:\n\n${inputText}`, { systemPrompt: 'You are a helpful assistant that simplifies text for better readability.' });
                    break;
                case 'proofread':
                    result = await chromeAI.proofread(inputText);
                    break;
                case 'translate':
                    result = await chromeAI.translate(inputText, {
                        sourceLanguage: 'en',
                        targetLanguage: 'es'
                    });
                    break;
                case 'explain':
                    result = await chromeAI.prompt(`Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:\n\n${inputText}`, { systemPrompt: 'You are a helpful teacher that explains complex topics in simple, easy-to-understand language.' });
                    break;
            }
            if (result.success && result.data) {
                const output = typeof result.data === 'string' ? result.data :
                    typeof result.data === 'object' && 'correctedText' in result.data ?
                        result.data.correctedText : 'Processing completed';
                setOutputText(output);
                onAction('text-processed', { original: inputText, processed: output, type: currentFeature });
            }
            else {
                setOutputText(`Error: ${result.error || 'Processing failed'}`);
            }
        }
        catch (error) {
            setOutputText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsxs("div", { style: sidebarStyle, children: [_jsxs("div", { style: {
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }, children: [_jsx("h2", { style: { margin: 0, fontSize: '18px', fontWeight: 600 }, children: "\uD83E\uDDE0 AI Assistant" }), _jsx("button", { onClick: onClose, style: {
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }, children: "\u2715" })] }), _jsx("div", { style: {
                    display: 'flex',
                    background: theme === 'dark' ? '#374151' : '#f3f4f6',
                    padding: '4px'
                }, children: [
                    { id: 'ai', label: '🧠 AI Tools', icon: '🧠' },
                    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
                    { id: 'history', label: '📜 History', icon: '📜' },
                ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.id), style: {
                        flex: 1,
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        background: activeTab === tab.id ? 'white' : 'transparent',
                        color: activeTab === tab.id ? '#333' : theme === 'dark' ? '#d1d5db' : '#6b7280',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: activeTab === tab.id ? 600 : 400
                    }, children: tab.label }, tab.id))) }), _jsxs("div", { style: { flex: 1, overflow: 'auto', padding: '16px' }, children: [activeTab === 'ai' && (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }, children: "Choose AI Feature:" }), _jsxs("select", { value: currentFeature, onChange: (e) => setCurrentFeature(e.target.value), style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                            background: theme === 'dark' ? '#374151' : 'white',
                                            color: theme === 'dark' ? '#f9fafb' : '#111827',
                                            fontSize: '14px'
                                        }, children: [_jsx("option", { value: "simplify", children: "\u2728 Simplify Text" }), _jsx("option", { value: "proofread", children: "\uD83D\uDD24 Proofread & Fix" }), _jsx("option", { value: "translate", children: "\uD83C\uDF10 Translate" }), _jsx("option", { value: "explain", children: "\uD83D\uDCA1 Explain Concepts" })] })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }, children: "Input Text:" }), _jsx("textarea", { value: inputText, onChange: (e) => setInputText(e.target.value), placeholder: "Paste or type text here...", style: {
                                            width: '100%',
                                            height: '120px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                            background: theme === 'dark' ? '#374151' : 'white',
                                            color: theme === 'dark' ? '#f9fafb' : '#111827',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        } })] }), _jsx("button", { onClick: processText, disabled: isProcessing || !inputText.trim(), style: {
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isProcessing || !inputText.trim() ? '#9ca3af' :
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: isProcessing || !inputText.trim() ? 'not-allowed' : 'pointer',
                                    marginBottom: '16px'
                                }, children: isProcessing ? '⏳ Processing...' : '✨ Process Text' }), outputText && (_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }, children: "Result:" }), _jsx("div", { style: {
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: theme === 'dark' ? '#1f2937' : '#f9fafb',
                                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }, children: outputText })] }))] })), activeTab === 'settings' && (_jsxs("div", { children: [_jsx("h3", { style: { margin: '0 0 16px', fontSize: '16px' }, children: "Quick Settings" }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", defaultChecked: true }), _jsx("span", { style: { fontSize: '14px' }, children: "Enable keyboard shortcuts" })] }) }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", defaultChecked: true }), _jsx("span", { style: { fontSize: '14px' }, children: "Text-to-speech enabled" })] }) }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", defaultChecked: true }), _jsx("span", { style: { fontSize: '14px' }, children: "Auto-process selected text" })] }) }), _jsx("button", { onClick: () => chrome.runtime.openOptionsPage(), style: {
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: 'white',
                                    color: '#374151',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }, children: "\u2699\uFE0F Open Full Settings" })] })), activeTab === 'history' && (_jsxs("div", { children: [_jsx("h3", { style: { margin: '0 0 16px', fontSize: '16px' }, children: "Recent Activity" }), _jsx("p", { style: { fontSize: '14px', color: '#6b7280' }, children: "Your processing history will appear here..." })] }))] })] }));
};
// Main Content Script Class
class EnhancedContentScript {
    constructor() {
        this.settings = defaultSettings;
        this.sidebarVisible = false;
        this.sidebarRoot = null;
        this.notificationRoot = null;
        this.toolbarRoot = null;
        this.currentSpeech = null;
        this.init();
    }
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupTextSelection();
        this.setupNotificationSystem();
        this.applyAccessibilitySettings();
        console.log('🧠 Enhanced Accessible Web Extension loaded');
    }
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('extensionSettings');
            if (result.extensionSettings) {
                this.settings = { ...defaultSettings, ...result.extensionSettings };
            }
        }
        catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    setupEventListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }
    handleMessage(message, _sender, sendResponse) {
        switch (message.action) {
            case 'toggle-sidebar':
                this.toggleSidebar();
                sendResponse({ success: true });
                break;
            case 'speak-text':
                this.speakText(message.text);
                sendResponse({ success: true });
                break;
            case 'process-selection':
                this.processSelectedText(message.type).then(result => {
                    sendResponse(result);
                });
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
    setupKeyboardShortcuts() {
        if (!this.settings.accessibility.enableKeyboardShortcuts)
            return;
        document.addEventListener('keydown', async (event) => {
            // Alt + Shift + S = Toggle sidebar
            if (event.altKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                this.toggleSidebar();
            }
            // Alt + S = Simplify selection
            if (event.altKey && event.key === 's') {
                event.preventDefault();
                await this.processSelectedText('simplify');
            }
            // Alt + P = Proofread selection
            if (event.altKey && event.key === 'p') {
                event.preventDefault();
                await this.processSelectedText('proofread');
            }
            // Alt + T = Translate selection
            if (event.altKey && event.key === 't') {
                event.preventDefault();
                await this.processSelectedText('translate');
            }
            // Alt + L = Listen to selection (Text-to-Speech)
            if (event.altKey && event.key === 'l') {
                event.preventDefault();
                await this.processSelectedText('speak');
            }
            // Alt + E = Explain selection
            if (event.altKey && event.key === 'e') {
                event.preventDefault();
                await this.processSelectedText('explain');
            }
            // Escape = Close sidebar/stop speech
            if (event.key === 'Escape') {
                if (this.currentSpeech) {
                    speechSynthesis.cancel();
                    this.currentSpeech = null;
                }
                if (this.sidebarVisible) {
                    event.preventDefault();
                    this.hideSidebar();
                }
                this.hideFloatingToolbar();
            }
        });
    }
    setupTextSelection() {
        let selectionTimeout;
        document.addEventListener('mouseup', () => {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                const selection = window.getSelection();
                const selectedText = selection?.toString().trim();
                if (selectedText && selectedText.length > 10) {
                    if (this.settings.aiPreferences.processOnSelect) {
                        this.processSelectedText('simplify');
                    }
                    else {
                        this.showFloatingToolbar(selectedText, {
                            x: selection.getRangeAt(0).getBoundingClientRect().left,
                            y: selection.getRangeAt(0).getBoundingClientRect().top
                        });
                    }
                }
            }, 300);
        });
        document.addEventListener('mousedown', () => {
            clearTimeout(selectionTimeout);
            this.hideFloatingToolbar();
        });
    }
    setupNotificationSystem() {
        const container = document.createElement('div');
        container.id = 'accessible-web-notifications';
        document.body.appendChild(container);
        this.notificationRoot = createRoot(container);
    }
    showNotification(message, type = 'info') {
        if (!this.notificationRoot)
            return;
        let notificationVisible = true;
        const NotificationWrapper = () => {
            return notificationVisible ? (_jsx(Notification, { message: message, type: type, onClose: () => {
                    notificationVisible = false;
                    this.notificationRoot.render(null);
                } })) : null;
        };
        this.notificationRoot.render(_jsx(NotificationWrapper, {}));
    }
    showFloatingToolbar(text, position) {
        this.hideFloatingToolbar();
        const container = document.createElement('div');
        container.id = 'accessible-web-toolbar';
        document.body.appendChild(container);
        this.toolbarRoot = createRoot(container);
        const ToolbarWrapper = () => {
            const [visible, setVisible] = useState(true);
            if (!visible)
                return null;
            return (_jsx(FloatingToolbar, { selectedText: text, position: position, onAction: (action, selectedText) => {
                    this.processSelectedText(action, selectedText);
                    setVisible(false);
                }, onClose: () => setVisible(false) }));
        };
        this.toolbarRoot.render(_jsx(ToolbarWrapper, {}));
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideFloatingToolbar();
        }, 10000);
    }
    hideFloatingToolbar() {
        if (this.toolbarRoot) {
            this.toolbarRoot.render(null);
            const container = document.getElementById('accessible-web-toolbar');
            if (container) {
                container.remove();
            }
            this.toolbarRoot = null;
        }
    }
    toggleSidebar() {
        if (this.sidebarVisible) {
            this.hideSidebar();
        }
        else {
            this.showSidebar();
        }
    }
    showSidebar() {
        if (this.sidebarVisible)
            return;
        const container = document.createElement('div');
        container.id = 'accessible-web-sidebar';
        document.body.appendChild(container);
        this.sidebarRoot = createRoot(container);
        const SidebarWrapper = () => {
            const [visible, setVisible] = useState(true);
            return (_jsx(EnhancedSidebar, { isVisible: visible, position: this.settings.interface.sidebarPosition, theme: this.settings.interface.theme, onClose: () => {
                    setVisible(false);
                    this.hideSidebar();
                }, onAction: (action, data) => {
                    console.log('Sidebar action:', action, data);
                } }));
        };
        this.sidebarRoot.render(_jsx(SidebarWrapper, {}));
        this.sidebarVisible = true;
        chrome.storage.local.set({ sidebarEnabled: true });
    }
    hideSidebar() {
        if (!this.sidebarVisible)
            return;
        if (this.sidebarRoot) {
            this.sidebarRoot.render(null);
            const container = document.getElementById('accessible-web-sidebar');
            if (container) {
                container.remove();
            }
            this.sidebarRoot = null;
        }
        this.sidebarVisible = false;
        chrome.storage.local.set({ sidebarEnabled: false });
    }
    async processSelectedText(action, providedText) {
        const selection = window.getSelection();
        const selectedText = providedText || (selection ? selection.toString().trim() : '');
        if (!selectedText) {
            this.showNotification('Please select some text first', 'warning');
            return { success: false, error: 'No text selected' };
        }
        try {
            let result;
            switch (action) {
                case 'simplify':
                    result = await chromeAI.prompt(`Simplify this text to make it easier to understand. Keep the same meaning but use simpler words and shorter sentences:\n\n${selectedText}`, { systemPrompt: 'You are a helpful assistant that simplifies text for better readability.' });
                    break;
                case 'proofread':
                    result = await chromeAI.proofread(selectedText);
                    break;
                case 'translate':
                    result = await chromeAI.translate(selectedText, {
                        sourceLanguage: 'en',
                        targetLanguage: this.settings.aiPreferences.preferredLanguage
                    });
                    break;
                case 'speak':
                    this.speakText(selectedText);
                    return { success: true, message: 'Text is being read aloud' };
                case 'explain':
                    result = await chromeAI.prompt(`Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:\n\n${selectedText}`, { systemPrompt: 'You are a helpful teacher that explains complex topics in simple, easy-to-understand language.' });
                    break;
                default:
                    throw new Error('Unknown action');
            }
            if (result && result.success && result.data) {
                const processedText = typeof result.data === 'string' ? result.data :
                    typeof result.data === 'object' && 'correctedText' in result.data ?
                        result.data.correctedText : 'Processing completed';
                this.showNotification(`✨ ${action.charAt(0).toUpperCase() + action.slice(1)} completed!`, 'success');
                // Could show result in a modal or copy to clipboard
                navigator.clipboard.writeText(processedText).then(() => {
                    this.showNotification('Result copied to clipboard!', 'info');
                });
                return { success: true, data: processedText };
            }
            else {
                throw new Error(result?.error || 'Processing failed');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.showNotification(`❌ Error: ${errorMessage}`, 'error');
            return { success: false, error: errorMessage };
        }
    }
    speakText(text) {
        if (!this.settings.accessibility.enableTextToSpeech) {
            this.showNotification('Text-to-speech is disabled in settings', 'warning');
            return;
        }
        // Stop any current speech
        if (this.currentSpeech) {
            speechSynthesis.cancel();
        }
        this.currentSpeech = new SpeechSynthesisUtterance(text);
        this.currentSpeech.rate = this.settings.accessibility.speechRate;
        if (this.settings.accessibility.speechVoice) {
            const voices = speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.name === this.settings.accessibility.speechVoice);
            if (selectedVoice) {
                this.currentSpeech.voice = selectedVoice;
            }
        }
        this.currentSpeech.onstart = () => {
            this.showNotification('🔊 Reading text aloud...', 'info');
        };
        this.currentSpeech.onend = () => {
            this.currentSpeech = null;
        };
        this.currentSpeech.onerror = () => {
            this.showNotification('❌ Text-to-speech error', 'error');
            this.currentSpeech = null;
        };
        speechSynthesis.speak(this.currentSpeech);
    }
    applyAccessibilitySettings() {
        // Apply font size
        if (this.settings.accessibility.fontSize !== 'medium') {
            const style = document.createElement('style');
            const fontSizes = {
                small: '0.9em',
                medium: '1em',
                large: '1.2em',
                xlarge: '1.4em'
            };
            style.textContent = `
        * { font-size: ${fontSizes[this.settings.accessibility.fontSize]} !important; }
      `;
            document.head.appendChild(style);
        }
        // Apply high contrast mode
        if (this.settings.accessibility.enableHighContrast) {
            const style = document.createElement('style');
            style.textContent = `
        * {
          background: black !important;
          color: white !important;
          border-color: white !important;
        }
        a, a * { color: yellow !important; }
        img { filter: contrast(1.5) brightness(1.2); }
      `;
            document.head.appendChild(style);
        }
        // Add CSS animations if enabled
        if (this.settings.interface.enableAnimations) {
            const style = document.createElement('style');
            style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
            document.head.appendChild(style);
        }
    }
}
// Initialize the enhanced content script
new EnhancedContentScript();
