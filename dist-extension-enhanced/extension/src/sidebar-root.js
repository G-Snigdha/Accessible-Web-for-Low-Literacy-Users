import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// createRoot import removed - using ReactDOM.render for now
import { aiClient } from '@/ai/aiClient';
import './styles/extension.css';
import '../../src-shared/styles/base.css';
const Sidebar = () => {
    const [state, setState] = useState({
        isVisible: true,
        selectedText: '',
        currentAction: 'none',
        results: {},
        settings: {
            fontSize: 'medium',
            language: 'en',
            highContrast: false
        }
    });
    useEffect(() => {
        // Load settings
        chrome.storage.local.get(['fontSize', 'language', 'highContrast'], (result) => {
            if (result) {
                setState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, ...result }
                }));
            }
        });
        // Listen for text selection
        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection ? selection.toString().trim() : '';
            if (text) {
                setState(prev => ({ ...prev, selectedText: text }));
            }
        };
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, []);
    const getMainContent = () => {
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
            const element = document.querySelector(selector);
            if (element) {
                return element.textContent?.trim() || '';
            }
        }
        // Fallback: get text from body, excluding navigation and sidebar elements
        const body = document.body.cloneNode(true);
        const excludeSelectors = ['nav', 'header', 'footer', '.sidebar', '.navigation', '#sidebar', 'script', 'style'];
        excludeSelectors.forEach(selector => {
            const elements = body.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        return body.textContent?.trim() || '';
    };
    const handleSimplify = async () => {
        const text = state.selectedText || getMainContent();
        if (!text)
            return;
        setState(prev => ({ ...prev, currentAction: 'simplifying' }));
        try {
            const result = await aiClient.summarize(text, {
                maxSentences: 3,
                readingLevel: 'very-simple'
            });
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentAction: 'none',
                    results: { ...prev.results, simplified: result.data?.summary || 'Simplification failed' }
                }));
            }
            else {
                console.error('Simplification failed:', result.error);
                setState(prev => ({ ...prev, currentAction: 'none' }));
            }
        }
        catch (error) {
            console.error('Simplification error:', error);
            setState(prev => ({ ...prev, currentAction: 'none' }));
        }
    };
    const handleTranslate = async (targetLanguage) => {
        const text = state.selectedText || state.results.simplified || getMainContent();
        if (!text)
            return;
        setState(prev => ({ ...prev, currentAction: 'translating' }));
        try {
            const result = await aiClient.translate(text, {
                targetLanguage,
                sourceLanguage: 'auto'
            });
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentAction: 'none',
                    results: { ...prev.results, translated: result.data?.translatedText || 'Translation failed' }
                }));
            }
        }
        catch (error) {
            console.error('Translation error:', error);
            setState(prev => ({ ...prev, currentAction: 'none' }));
        }
    };
    const handleRewrite = async () => {
        const text = state.selectedText || getMainContent();
        if (!text)
            return;
        setState(prev => ({ ...prev, currentAction: 'rewriting' }));
        try {
            const result = await aiClient.rewrite(text, {
                style: 'simple',
                readingLevel: 'very-simple',
                tone: 'encouraging'
            });
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentAction: 'none',
                    results: { ...prev.results, rewritten: result.data?.rewrittenText || 'Rewriting failed' }
                }));
            }
        }
        catch (error) {
            console.error('Rewrite error:', error);
            setState(prev => ({ ...prev, currentAction: 'none' }));
        }
    };
    const handleProofread = async () => {
        const text = state.selectedText;
        if (!text)
            return;
        setState(prev => ({ ...prev, currentAction: 'proofreading' }));
        try {
            const result = await aiClient.proofread(text, {
                checkGrammar: true,
                checkSpelling: true,
                simplifyLanguage: true
            });
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentAction: 'none',
                    results: { ...prev.results, proofread: result.data?.correctedText || 'Proofreading failed' }
                }));
            }
        }
        catch (error) {
            console.error('Proofread error:', error);
            setState(prev => ({ ...prev, currentAction: 'none' }));
        }
    };
    const handleReadAloud = async (text) => {
        const textToRead = text || state.results.simplified || state.selectedText || getMainContent();
        if (!textToRead)
            return;
        setState(prev => ({ ...prev, currentAction: 'reading' }));
        try {
            const result = await aiClient.readAloud(textToRead, {
                rate: 0.8,
                language: state.settings.language
            });
            setState(prev => ({ ...prev, currentAction: 'none' }));
            if (!result.success) {
                console.error('Read aloud failed:', result.error);
            }
        }
        catch (error) {
            console.error('Read aloud error:', error);
            setState(prev => ({ ...prev, currentAction: 'none' }));
        }
    };
    const stopSpeech = () => {
        aiClient.stopSpeech();
        setState(prev => ({ ...prev, currentAction: 'none' }));
    };
    const closeSidebar = () => {
        setState(prev => ({ ...prev, isVisible: false }));
        // Notify content script to hide sidebar
        window.postMessage({ type: 'HIDE_SIDEBAR' }, '*');
    };
    if (!state.isVisible)
        return null;
    return (_jsxs("div", { className: `accessible-sidebar ${state.settings.fontSize} ${state.settings.highContrast ? 'high-contrast' : ''}`, role: "complementary", "aria-label": "Accessibility Tools", children: [_jsxs("div", { className: "sidebar-header", children: [_jsx("h2", { children: "\uD83C\uDF1F Accessible Tools" }), _jsx("button", { className: "close-btn", onClick: closeSidebar, "aria-label": "Close accessibility tools", children: "\u2715" })] }), _jsxs("div", { className: "sidebar-content", children: [state.selectedText && (_jsxs("div", { className: "selected-text", children: [_jsx("h3", { children: "Selected Text:" }), _jsxs("p", { className: "text-preview", children: [state.selectedText.substring(0, 100), "..."] })] })), _jsxs("div", { className: "action-buttons", children: [_jsxs("button", { className: "action-btn primary", onClick: handleSimplify, disabled: state.currentAction === 'simplifying', "aria-label": "Simplify text to make it easier to read", children: [_jsx("span", { className: "btn-icon", children: "\u2728" }), _jsx("span", { className: "btn-text", children: state.currentAction === 'simplifying' ? 'Simplifying...' : 'Simplify' })] }), _jsxs("button", { className: "action-btn", onClick: () => handleTranslate(state.settings.language === 'en' ? 'es' : 'en'), disabled: state.currentAction === 'translating', "aria-label": "Translate text to another language", children: [_jsx("span", { className: "btn-icon", children: "\uD83C\uDF0D" }), _jsx("span", { className: "btn-text", children: state.currentAction === 'translating' ? 'Translating...' : 'Translate' })] }), _jsxs("button", { className: "action-btn", onClick: () => handleReadAloud(), disabled: state.currentAction === 'reading', "aria-label": "Read text aloud", children: [_jsx("span", { className: "btn-icon", children: "\uD83D\uDD0A" }), _jsx("span", { className: "btn-text", children: state.currentAction === 'reading' ? 'Reading...' : 'Read Aloud' })] }), state.currentAction === 'reading' && (_jsxs("button", { className: "action-btn stop", onClick: stopSpeech, "aria-label": "Stop reading aloud", children: [_jsx("span", { className: "btn-icon", children: "\u23F9\uFE0F" }), _jsx("span", { className: "btn-text", children: "Stop" })] })), _jsxs("button", { className: "action-btn", onClick: handleRewrite, disabled: state.currentAction === 'rewriting', "aria-label": "Rewrite text for better clarity", children: [_jsx("span", { className: "btn-icon", children: "\uD83D\uDCDD" }), _jsx("span", { className: "btn-text", children: state.currentAction === 'rewriting' ? 'Rewriting...' : 'Rewrite' })] }), state.selectedText && (_jsxs("button", { className: "action-btn", onClick: handleProofread, disabled: state.currentAction === 'proofreading', "aria-label": "Check spelling and grammar", children: [_jsx("span", { className: "btn-icon", children: "\u270F\uFE0F" }), _jsx("span", { className: "btn-text", children: state.currentAction === 'proofreading' ? 'Checking...' : 'Proofread' })] }))] }), _jsxs("div", { className: "results", children: [state.results.simplified && (_jsxs("div", { className: "result-item", children: [_jsx("h4", { children: "\uD83D\uDCD6 Simplified:" }), _jsx("p", { className: "result-text", children: state.results.simplified }), _jsx("button", { className: "read-btn", onClick: () => handleReadAloud(state.results.simplified), "aria-label": "Read simplified text aloud", children: "\uD83D\uDD0A Read This" })] })), state.results.translated && (_jsxs("div", { className: "result-item", children: [_jsx("h4", { children: "\uD83C\uDF0D Translated:" }), _jsx("p", { className: "result-text", children: state.results.translated }), _jsx("button", { className: "read-btn", onClick: () => handleReadAloud(state.results.translated), "aria-label": "Read translated text aloud", children: "\uD83D\uDD0A Read This" })] })), state.results.rewritten && (_jsxs("div", { className: "result-item", children: [_jsx("h4", { children: "\uD83D\uDCDD Rewritten:" }), _jsx("p", { className: "result-text", children: state.results.rewritten }), _jsx("button", { className: "read-btn", onClick: () => handleReadAloud(state.results.rewritten), "aria-label": "Read rewritten text aloud", children: "\uD83D\uDD0A Read This" })] })), state.results.proofread && (_jsxs("div", { className: "result-item", children: [_jsx("h4", { children: "\u270F\uFE0F Proofread:" }), _jsx("p", { className: "result-text", children: state.results.proofread })] }))] }), _jsxs("div", { className: "quick-settings", children: [_jsx("h4", { children: "Quick Settings:" }), _jsx("div", { className: "setting-controls", children: _jsxs("label", { children: ["Text Size:", _jsxs("select", { value: state.settings.fontSize, onChange: (e) => setState(prev => ({
                                                ...prev,
                                                settings: { ...prev.settings, fontSize: e.target.value }
                                            })), children: [_jsx("option", { value: "small", children: "A" }), _jsx("option", { value: "medium", children: "A+" }), _jsx("option", { value: "large", children: "A++" }), _jsx("option", { value: "extra-large", children: "A+++" })] })] }) })] })] }), _jsx("div", { className: "sidebar-footer", children: _jsx("p", { children: "\uD83D\uDD12 Privacy-first \u2022 All processing on-device" }) })] }));
};
export default Sidebar;
