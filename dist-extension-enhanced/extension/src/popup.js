import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { aiClient } from '../../src-shared/ai/aiClient';
import '../../src-shared/styles/base.css';
import './styles/extension.css';
const Popup = () => {
    const [state, setState] = useState({
        sidebarEnabled: false,
        lastSimplification: '',
        selectedLanguage: 'en',
        fontSize: 'medium',
        isProcessing: false
    });
    useEffect(() => {
        // Load settings from chrome.storage
        chrome.storage.local.get(['sidebarEnabled', 'lastSimplification', 'selectedLanguage', 'fontSize'], (result) => {
            setState(prev => ({ ...prev, ...result }));
        });
    }, []);
    const toggleSidebar = async () => {
        const newState = !state.sidebarEnabled;
        setState(prev => ({ ...prev, sidebarEnabled: newState }));
        // Save to storage
        chrome.storage.local.set({ sidebarEnabled: newState });
        // Send message to content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggle-sidebar',
                enabled: newState
            });
        }
    };
    const simplifyCurrentPage = async () => {
        setState(prev => ({ ...prev, isProcessing: true }));
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: 'simplify-page' }, (response) => {
                    if (response && response.success) {
                        setState(prev => ({
                            ...prev,
                            lastSimplification: response.data.summary,
                            isProcessing: false
                        }));
                        chrome.storage.local.set({ lastSimplification: response.data.summary });
                    }
                    else {
                        setState(prev => ({ ...prev, isProcessing: false }));
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to simplify page:', error);
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };
    const changeLanguage = (language) => {
        setState(prev => ({ ...prev, selectedLanguage: language }));
        chrome.storage.local.set({ selectedLanguage: language });
    };
    const readLastSimplification = async () => {
        if (state.lastSimplification) {
            const result = await aiClient.readAloud(state.lastSimplification, {
                rate: 0.8,
                language: state.selectedLanguage
            });
            if (!result.success) {
                console.error('TTS failed:', result.error);
            }
        }
    };
    const openOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    };
    return (_jsxs("div", { className: "extension-popup", children: [_jsx("h1", { children: "\uD83C\uDF1F Accessible Web" }), _jsxs("div", { className: "actions", children: [_jsxs("a", { href: "#", className: `quick-action ${state.sidebarEnabled ? 'active' : ''}`, onClick: (e) => { e.preventDefault(); toggleSidebar(); }, "aria-label": state.sidebarEnabled ? 'Hide sidebar' : 'Show sidebar', children: [_jsx("div", { className: "icon", children: "\uD83D\uDCD6" }), _jsxs("div", { className: "text", children: [_jsx("div", { className: "title", children: state.sidebarEnabled ? 'Hide Sidebar' : 'Show Sidebar' }), _jsx("p", { className: "description", children: "Toggle reading assistance panel" })] })] }), _jsxs("a", { href: "#", className: "quick-action", onClick: (e) => { e.preventDefault(); simplifyCurrentPage(); }, "aria-label": "Simplify current page", children: [_jsx("div", { className: "icon", children: "\u2728" }), _jsxs("div", { className: "text", children: [_jsx("div", { className: "title", children: state.isProcessing ? 'Simplifying...' : 'Simplify Page' }), _jsx("p", { className: "description", children: "Make content easier to understand" })] })] }), state.lastSimplification && (_jsxs("a", { href: "#", className: "quick-action", onClick: (e) => { e.preventDefault(); readLastSimplification(); }, "aria-label": "Read last simplification aloud", children: [_jsx("div", { className: "icon", children: "\uD83D\uDD0A" }), _jsxs("div", { className: "text", children: [_jsx("div", { className: "title", children: "Read Aloud" }), _jsx("p", { className: "description", children: "Hear the simplified content" })] })] })), _jsxs("a", { href: "#", className: "quick-action", onClick: (e) => { e.preventDefault(); openOptionsPage(); }, children: [_jsx("div", { className: "icon", children: "\u2699\uFE0F" }), _jsxs("div", { className: "text", children: [_jsx("div", { className: "title", children: "Settings" }), _jsx("p", { className: "description", children: "Customize accessibility options" })] })] })] }), _jsxs("div", { className: "mb-lg", children: [_jsx("label", { htmlFor: "language-select", children: "Language for translations:" }), _jsxs("select", { id: "language-select", value: state.selectedLanguage, onChange: (e) => changeLanguage(e.target.value), children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Spanish" }), _jsx("option", { value: "fr", children: "French" }), _jsx("option", { value: "de", children: "German" }), _jsx("option", { value: "it", children: "Italian" }), _jsx("option", { value: "pt", children: "Portuguese" })] })] }), state.lastSimplification && (_jsxs("div", { className: "card", children: [_jsx("h3", { children: "Last Simplification:" }), _jsx("p", { children: state.lastSimplification })] }))] }));
};
// Initialize popup
const container = document.getElementById('popup-root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(Popup, {}));
}
