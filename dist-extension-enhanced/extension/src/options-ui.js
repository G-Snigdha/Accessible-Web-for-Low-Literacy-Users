import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Options/Settings Page for Chrome Built-in AI Extension
 * Comprehensive settings for accessibility, personalization, and AI features
 */
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src-shared/styles/base.css';
import './styles/extension.css';
const defaultSettings = {
    accessibility: {
        enableHighContrast: false,
        fontSize: 'medium',
        readingMode: false,
        highlightDifficultWords: true,
        enableTextToSpeech: true,
        speechRate: 1.0,
        speechVoice: '',
        enableKeyboardShortcuts: true,
        showTooltips: true,
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
        theme: 'auto',
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
const OptionsUI = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [activeTab, setActiveTab] = useState('accessibility');
    const [voices, setVoices] = useState([]);
    const [isTestingVoice, setIsTestingVoice] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    useEffect(() => {
        loadSettings();
        loadVoices();
    }, []);
    const loadSettings = async () => {
        try {
            const result = await chrome.storage.sync.get('extensionSettings');
            if (result.extensionSettings) {
                setSettings({ ...defaultSettings, ...result.extensionSettings });
            }
        }
        catch (error) {
            console.error('Failed to load settings:', error);
        }
    };
    const saveSettings = async () => {
        setSaveStatus('saving');
        try {
            await chrome.storage.sync.set({ extensionSettings: settings });
            setSaveStatus('saved');
            // Auto-hide save confirmation
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
        catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
        }
    };
    const loadVoices = () => {
        const updateVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);
            // Set default voice if none selected
            if (!settings.accessibility.speechVoice && availableVoices.length > 0) {
                const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
                updateSettings('accessibility', 'speechVoice', defaultVoice.name);
            }
        };
        updateVoices();
        speechSynthesis.addEventListener('voiceschanged', updateVoices);
    };
    const updateSettings = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };
    const testTextToSpeech = () => {
        if (isTestingVoice)
            return;
        setIsTestingVoice(true);
        const utterance = new SpeechSynthesisUtterance("This is how your selected voice will sound when reading text aloud.");
        const voice = voices.find(v => v.name === settings.accessibility.speechVoice);
        if (voice)
            utterance.voice = voice;
        utterance.rate = settings.accessibility.speechRate;
        utterance.onend = () => setIsTestingVoice(false);
        utterance.onerror = () => setIsTestingVoice(false);
        speechSynthesis.speak(utterance);
    };
    const resetToDefaults = () => {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            setSettings(defaultSettings);
        }
    };
    const exportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `accessible-web-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };
    const importSettings = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target?.result);
                setSettings({ ...defaultSettings, ...importedSettings });
                alert('Settings imported successfully!');
            }
            catch (error) {
                alert('Invalid settings file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };
    return (_jsxs("div", { style: { fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }, children: [_jsxs("header", { style: { textAlign: 'center', marginBottom: '40px', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '28px', fontWeight: 600 }, children: "\uD83E\uDDE0 Accessible Web Extension" }), _jsx("p", { style: { margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }, children: "Settings & Accessibility Options" })] }), _jsx("nav", { style: { display: 'flex', gap: '4px', marginBottom: '24px', background: '#f5f5f5', padding: '4px', borderRadius: '12px' }, children: [
                    { id: 'accessibility', label: '♿ Accessibility', icon: '♿' },
                    { id: 'ai', label: '🧠 AI Preferences', icon: '🧠' },
                    { id: 'interface', label: '🎨 Interface', icon: '🎨' },
                    { id: 'privacy', label: '🔒 Privacy', icon: '🔒' },
                    { id: 'keyboard', label: '⌨️ Shortcuts', icon: '⌨️' },
                ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.id), style: {
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === tab.id ? 'white' : 'transparent',
                        color: activeTab === tab.id ? '#333' : '#666',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === tab.id ? 600 : 400,
                        boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                    }, children: tab.label }, tab.id))) }), _jsxs("div", { style: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }, children: [activeTab === 'accessibility' && (_jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 20px', fontSize: '20px', color: '#333' }, children: "\u267F Accessibility Settings" }), _jsxs("div", { style: { display: 'grid', gap: '20px' }, children: [_jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83D\uDC41\uFE0F Visual Accessibility" }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.enableHighContrast, onChange: (e) => updateSettings('accessibility', 'enableHighContrast', e.target.checked) }), _jsx("span", { children: "Enable High Contrast Mode" })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Font Size" }), _jsxs("select", { value: settings.accessibility.fontSize, onChange: (e) => updateSettings('accessibility', 'fontSize', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "small", children: "Small" }), _jsx("option", { value: "medium", children: "Medium (Default)" }), _jsx("option", { value: "large", children: "Large" }), _jsx("option", { value: "xlarge", children: "Extra Large" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.readingMode, onChange: (e) => updateSettings('accessibility', 'readingMode', e.target.checked) }), _jsx("span", { children: "Enable Reading Mode (Focus on text content)" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.highlightDifficultWords, onChange: (e) => updateSettings('accessibility', 'highlightDifficultWords', e.target.checked) }), _jsx("span", { children: "Highlight Difficult Words" })] })] }), _jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83D\uDD0A Audio Accessibility" }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.enableTextToSpeech, onChange: (e) => updateSettings('accessibility', 'enableTextToSpeech', e.target.checked) }), _jsx("span", { children: "Enable Text-to-Speech" })] }), settings.accessibility.enableTextToSpeech && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Voice" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("select", { value: settings.accessibility.speechVoice, onChange: (e) => updateSettings('accessibility', 'speechVoice', e.target.value), style: { flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: voices.map(voice => (_jsxs("option", { value: voice.name, children: [voice.name, " (", voice.lang, ")"] }, voice.name))) }), _jsx("button", { onClick: testTextToSpeech, disabled: isTestingVoice, style: {
                                                                            padding: '8px 16px',
                                                                            borderRadius: '6px',
                                                                            border: 'none',
                                                                            background: isTestingVoice ? '#ccc' : '#667eea',
                                                                            color: 'white',
                                                                            cursor: isTestingVoice ? 'not-allowed' : 'pointer',
                                                                            fontSize: '14px'
                                                                        }, children: isTestingVoice ? '🔊 Testing...' : '🔊 Test' })] })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: ["Speech Rate: ", settings.accessibility.speechRate, "x"] }), _jsx("input", { type: "range", min: "0.5", max: "2", step: "0.1", value: settings.accessibility.speechRate, onChange: (e) => updateSettings('accessibility', 'speechRate', parseFloat(e.target.value)), style: { width: '100%' } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }, children: [_jsx("span", { children: "Slow (0.5x)" }), _jsx("span", { children: "Normal (1.0x)" }), _jsx("span", { children: "Fast (2.0x)" })] })] })] }))] }), _jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\u2328\uFE0F Interaction" }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.enableKeyboardShortcuts, onChange: (e) => updateSettings('accessibility', 'enableKeyboardShortcuts', e.target.checked) }), _jsx("span", { children: "Enable Keyboard Shortcuts" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.accessibility.showTooltips, onChange: (e) => updateSettings('accessibility', 'showTooltips', e.target.checked) }), _jsx("span", { children: "Show Helpful Tooltips" })] })] })] })] })), activeTab === 'ai' && (_jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 20px', fontSize: '20px', color: '#333' }, children: "\uD83E\uDDE0 AI Processing Preferences" }), _jsx("div", { style: { display: 'grid', gap: '20px' }, children: _jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83D\uDCDD Text Processing" }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Default Simplification Level" }), _jsxs("select", { value: settings.aiPreferences.defaultSimplificationLevel, onChange: (e) => updateSettings('aiPreferences', 'defaultSimplificationLevel', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "light", children: "Light - Minor improvements" }), _jsx("option", { value: "medium", children: "Medium - Balanced simplification" }), _jsx("option", { value: "heavy", children: "Heavy - Maximum simplification" })] })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Preferred Language" }), _jsxs("select", { value: settings.aiPreferences.preferredLanguage, onChange: (e) => updateSettings('aiPreferences', 'preferredLanguage', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Spanish" }), _jsx("option", { value: "fr", children: "French" }), _jsx("option", { value: "de", children: "German" }), _jsx("option", { value: "it", children: "Italian" }), _jsx("option", { value: "pt", children: "Portuguese" }), _jsx("option", { value: "zh", children: "Chinese" }), _jsx("option", { value: "ja", children: "Japanese" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.aiPreferences.autoDetectLanguage, onChange: (e) => updateSettings('aiPreferences', 'autoDetectLanguage', e.target.checked) }), _jsx("span", { children: "Auto-detect text language" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.aiPreferences.enableSmartSuggestions, onChange: (e) => updateSettings('aiPreferences', 'enableSmartSuggestions', e.target.checked) }), _jsx("span", { children: "Enable smart content suggestions" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.aiPreferences.processOnSelect, onChange: (e) => updateSettings('aiPreferences', 'processOnSelect', e.target.checked) }), _jsx("span", { children: "Auto-process text when selected" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.aiPreferences.showConfidenceScores, onChange: (e) => updateSettings('aiPreferences', 'showConfidenceScores', e.target.checked) }), _jsx("span", { children: "Show AI confidence scores" })] })] }) })] })), activeTab === 'interface' && (_jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 20px', fontSize: '20px', color: '#333' }, children: "\uD83C\uDFA8 Interface & Experience" }), _jsxs("div", { style: { display: 'grid', gap: '20px' }, children: [_jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83C\uDFA8 Appearance" }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Theme" }), _jsxs("select", { value: settings.interface.theme, onChange: (e) => updateSettings('interface', 'theme', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "light", children: "Light" }), _jsx("option", { value: "dark", children: "Dark" }), _jsx("option", { value: "auto", children: "Auto (Follow system)" })] })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Sidebar Position" }), _jsxs("select", { value: settings.interface.sidebarPosition, onChange: (e) => updateSettings('interface', 'sidebarPosition', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "left", children: "Left Side" }), _jsx("option", { value: "right", children: "Right Side" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.interface.compactMode, onChange: (e) => updateSettings('interface', 'compactMode', e.target.checked) }), _jsx("span", { children: "Compact interface mode" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.interface.enableAnimations, onChange: (e) => updateSettings('interface', 'enableAnimations', e.target.checked) }), _jsx("span", { children: "Enable smooth animations" })] })] }), _jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83D\uDCE2 Notifications" }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: "Notification Level" }), _jsxs("select", { value: settings.interface.notificationLevel, onChange: (e) => updateSettings('interface', 'notificationLevel', e.target.value), style: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }, children: [_jsx("option", { value: "all", children: "All notifications" }), _jsx("option", { value: "important", children: "Important only" }), _jsx("option", { value: "none", children: "No notifications" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.interface.autoSaveResults, onChange: (e) => updateSettings('interface', 'autoSaveResults', e.target.checked) }), _jsx("span", { children: "Auto-save processed results" })] })] })] })] })), activeTab === 'privacy' && (_jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 20px', fontSize: '20px', color: '#333' }, children: "\uD83D\uDD12 Privacy & Data" }), _jsxs("div", { style: { display: 'grid', gap: '20px' }, children: [_jsxs("section", { children: [_jsx("h3", { style: { margin: '0 0 12px', fontSize: '16px', color: '#555' }, children: "\uD83D\uDCCA Data Storage" }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.privacy.saveHistory, onChange: (e) => updateSettings('privacy', 'saveHistory', e.target.checked) }), _jsx("span", { children: "Save processing history" })] }), settings.privacy.saveHistory && (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }, children: ["Maximum History Items: ", settings.privacy.maxHistoryItems] }), _jsx("input", { type: "range", min: "10", max: "500", step: "10", value: settings.privacy.maxHistoryItems, onChange: (e) => updateSettings('privacy', 'maxHistoryItems', parseInt(e.target.value)), style: { width: '100%' } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }, children: [_jsx("span", { children: "10 items" }), _jsx("span", { children: "500 items" })] })] })), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.privacy.enableAnalytics, onChange: (e) => updateSettings('privacy', 'enableAnalytics', e.target.checked) }), _jsx("span", { children: "Enable usage analytics (helps improve the extension)" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: settings.privacy.shareUsageStats, onChange: (e) => updateSettings('privacy', 'shareUsageStats', e.target.checked) }), _jsx("span", { children: "Share anonymous usage statistics" })] })] }), _jsxs("section", { style: { background: '#f0f7ff', padding: '16px', borderRadius: '8px', border: '1px solid #e0f0ff' }, children: [_jsx("h4", { style: { margin: '0 0 8px', fontSize: '14px', color: '#1e40af' }, children: "\uD83D\uDD12 Privacy Guarantee" }), _jsx("p", { style: { margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.4' }, children: "All AI processing happens locally on your device using Chrome's Built-in AI APIs. Your text content is never sent to external servers. This extension respects your privacy completely." })] })] })] })), activeTab === 'keyboard' && (_jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 20px', fontSize: '20px', color: '#333' }, children: "\u2328\uFE0F Keyboard Shortcuts" }), _jsxs("div", { style: { display: 'grid', gap: '16px' }, children: [[
                                        { shortcut: 'Alt + S', action: 'Simplify selected text', description: 'Makes text easier to understand' },
                                        { shortcut: 'Alt + P', action: 'Proofread selected text', description: 'Corrects grammar and spelling' },
                                        { shortcut: 'Alt + T', action: 'Translate selected text', description: 'Translates to your preferred language' },
                                        { shortcut: 'Alt + R', action: 'Rewrite selected text', description: 'Improves clarity and tone' },
                                        { shortcut: 'Alt + L', action: 'Listen to selected text', description: 'Reads text aloud using text-to-speech' },
                                        { shortcut: 'Alt + E', action: 'Explain selected text', description: 'Provides detailed explanations' },
                                        { shortcut: 'Alt + Shift + S', action: 'Toggle sidebar', description: 'Shows/hides the AI assistant sidebar' },
                                        { shortcut: 'Escape', action: 'Close sidebar or notifications', description: 'Dismisses open interface elements' },
                                    ].map((item, index) => (_jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            background: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                        }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: '14px', marginBottom: '4px' }, children: item.action }), _jsx("div", { style: { fontSize: '12px', color: '#666' }, children: item.description })] }), _jsx("code", { style: {
                                                    padding: '6px 12px',
                                                    background: '#e0e7ff',
                                                    color: '#3730a3',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: 600
                                                }, children: item.shortcut })] }, index))), _jsxs("div", { style: { background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fbbf24' }, children: [_jsx("h4", { style: { margin: '0 0 8px', fontSize: '14px', color: '#92400e' }, children: "\uD83D\uDCA1 Pro Tips" }), _jsxs("ul", { style: { margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#92400e' }, children: [_jsx("li", { children: "Select any text on a webpage first, then use shortcuts" }), _jsx("li", { children: "Shortcuts work on any website - no setup required" }), _jsx("li", { children: "Use Escape key to quickly close any open interface" }), _jsx("li", { children: "Keyboard shortcuts can be disabled in Accessibility settings" })] })] })] })] }))] }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: saveSettings, disabled: saveStatus === 'saving', style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: saveStatus === 'saving' ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                            minWidth: '120px'
                        }, children: saveStatus === 'saving' ? '💾 Saving...' :
                            saveStatus === 'saved' ? '✅ Saved!' :
                                saveStatus === 'error' ? '❌ Error' : '💾 Save Settings' }), _jsx("button", { onClick: resetToDefaults, style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: 'white',
                            color: '#666',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDD04 Reset to Defaults" }), _jsx("button", { onClick: exportSettings, style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: 'white',
                            color: '#666',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDCE5 Export Settings" }), _jsxs("label", { style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: 'white',
                            color: '#666',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }, children: ["\uD83D\uDCE4 Import Settings", _jsx("input", { type: "file", accept: ".json", onChange: importSettings, style: { display: 'none' } })] })] }), _jsx("footer", { style: { textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666' }, children: _jsx("p", { children: "Accessible Web Extension \u2022 Privacy-First AI \u2022 Made with \u2764\uFE0F for everyone" }) })] }));
};
// Initialize options page
const container = document.getElementById('options-root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(OptionsUI, {}));
}
