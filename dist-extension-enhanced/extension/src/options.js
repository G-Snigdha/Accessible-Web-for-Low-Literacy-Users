import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/extension.css';
import '../../src-shared/styles/base.css';
const Options = () => {
    const [settings, setSettings] = useState({
        fontSize: 'medium',
        language: 'en',
        autoSimplify: false,
        autoReadAloud: false,
        offlineMode: true,
        highContrast: false,
        reduceMotion: false,
        voiceSettings: {
            rate: 0.8,
            pitch: 1.0,
            volume: 0.8,
            voice: ''
        }
    });
    const [voices, setVoices] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        // Load settings from storage
        chrome.storage.local.get(Object.keys(settings), (result) => {
            if (result) {
                setSettings(prev => ({ ...prev, ...result }));
            }
        });
        // Load available voices
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);
        };
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;
    }, []);
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            await chrome.storage.local.set(settings);
            // Apply settings to current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'update-settings',
                    settings
                });
            }
            setTimeout(() => setIsSaving(false), 500);
        }
        catch (error) {
            console.error('Failed to save settings:', error);
            setIsSaving(false);
        }
    };
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const updateVoiceSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            voiceSettings: {
                ...prev.voiceSettings,
                [key]: value
            }
        }));
    };
    const testVoice = () => {
        const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your voice settings.");
        const selectedVoice = voices.find(v => v.name === settings.voiceSettings.voice);
        if (selectedVoice)
            utterance.voice = selectedVoice;
        utterance.rate = settings.voiceSettings.rate;
        utterance.pitch = settings.voiceSettings.pitch;
        utterance.volume = settings.voiceSettings.volume;
        speechSynthesis.speak(utterance);
    };
    const resetToDefaults = () => {
        const defaultSettings = {
            fontSize: 'medium',
            language: 'en',
            autoSimplify: false,
            autoReadAloud: false,
            offlineMode: true,
            highContrast: false,
            reduceMotion: false,
            voiceSettings: {
                rate: 0.8,
                pitch: 1.0,
                volume: 0.8,
                voice: ''
            }
        };
        setSettings(defaultSettings);
    };
    return (_jsxs("div", { className: "options-container", children: [_jsxs("header", { className: "options-header", children: [_jsx("h1", { children: "\uD83C\uDF1F Accessible Web Settings" }), _jsx("p", { children: "Customize your reading experience" })] }), _jsxs("div", { className: "settings-sections", children: [_jsxs("section", { className: "settings-section", children: [_jsx("h2", { children: "\uD83D\uDCF1 Display Settings" }), _jsxs("div", { className: "setting-item", children: [_jsx("label", { htmlFor: "font-size", children: "Text Size:" }), _jsxs("select", { id: "font-size", value: settings.fontSize, onChange: (e) => updateSetting('fontSize', e.target.value), className: "setting-select", children: [_jsx("option", { value: "small", children: "Small" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "large", children: "Large" }), _jsx("option", { value: "extra-large", children: "Extra Large" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "high-contrast", children: [_jsx("input", { type: "checkbox", id: "high-contrast", checked: settings.highContrast, onChange: (e) => updateSetting('highContrast', e.target.checked) }), "High Contrast Mode"] }), _jsx("p", { className: "setting-description", children: "Improves text visibility" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "reduce-motion", children: [_jsx("input", { type: "checkbox", id: "reduce-motion", checked: settings.reduceMotion, onChange: (e) => updateSetting('reduceMotion', e.target.checked) }), "Reduce Motion"] }), _jsx("p", { className: "setting-description", children: "Minimizes animations" })] })] }), _jsxs("section", { className: "settings-section", children: [_jsx("h2", { children: "\uD83C\uDF0D Language Settings" }), _jsxs("div", { className: "setting-item", children: [_jsx("label", { htmlFor: "language", children: "Primary Language:" }), _jsxs("select", { id: "language", value: settings.language, onChange: (e) => updateSetting('language', e.target.value), className: "setting-select", children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Espa\u00F1ol" }), _jsx("option", { value: "fr", children: "Fran\u00E7ais" }), _jsx("option", { value: "de", children: "Deutsch" }), _jsx("option", { value: "it", children: "Italiano" }), _jsx("option", { value: "pt", children: "Portugu\u00EAs" }), _jsx("option", { value: "zh", children: "\u4E2D\u6587" }), _jsx("option", { value: "ja", children: "\u65E5\u672C\u8A9E" })] })] })] }), _jsxs("section", { className: "settings-section", children: [_jsx("h2", { children: "\uD83D\uDD0A Voice Settings" }), _jsxs("div", { className: "setting-item", children: [_jsx("label", { htmlFor: "voice-select", children: "Voice:" }), _jsxs("select", { id: "voice-select", value: settings.voiceSettings.voice, onChange: (e) => updateVoiceSetting('voice', e.target.value), className: "setting-select", children: [_jsx("option", { value: "", children: "Default Voice" }), voices.map(voice => (_jsxs("option", { value: voice.name, children: [voice.name, " (", voice.lang, ")"] }, voice.name)))] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "speech-rate", children: ["Speed: ", settings.voiceSettings.rate.toFixed(1)] }), _jsx("input", { type: "range", id: "speech-rate", min: "0.5", max: "2.0", step: "0.1", value: settings.voiceSettings.rate, onChange: (e) => updateVoiceSetting('rate', parseFloat(e.target.value)), className: "setting-range" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "speech-pitch", children: ["Pitch: ", settings.voiceSettings.pitch.toFixed(1)] }), _jsx("input", { type: "range", id: "speech-pitch", min: "0.5", max: "2.0", step: "0.1", value: settings.voiceSettings.pitch, onChange: (e) => updateVoiceSetting('pitch', parseFloat(e.target.value)), className: "setting-range" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "speech-volume", children: ["Volume: ", Math.round(settings.voiceSettings.volume * 100), "%"] }), _jsx("input", { type: "range", id: "speech-volume", min: "0", max: "1", step: "0.1", value: settings.voiceSettings.volume, onChange: (e) => updateVoiceSetting('volume', parseFloat(e.target.value)), className: "setting-range" })] }), _jsx("button", { className: "test-btn", onClick: testVoice, children: "\uD83C\uDFA4 Test Voice" })] }), _jsxs("section", { className: "settings-section", children: [_jsx("h2", { children: "\u26A1 Behavior Settings" }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "auto-simplify", children: [_jsx("input", { type: "checkbox", id: "auto-simplify", checked: settings.autoSimplify, onChange: (e) => updateSetting('autoSimplify', e.target.checked) }), "Auto-simplify pages"] }), _jsx("p", { className: "setting-description", children: "Automatically simplify text when pages load" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "auto-read", children: [_jsx("input", { type: "checkbox", id: "auto-read", checked: settings.autoReadAloud, onChange: (e) => updateSetting('autoReadAloud', e.target.checked) }), "Auto-read simplified text"] }), _jsx("p", { className: "setting-description", children: "Start reading aloud after simplification" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("label", { htmlFor: "offline-mode", children: [_jsx("input", { type: "checkbox", id: "offline-mode", checked: settings.offlineMode, onChange: (e) => updateSetting('offlineMode', e.target.checked) }), "Prefer offline processing"] }), _jsx("p", { className: "setting-description", children: "Use local AI when possible for privacy" })] })] })] }), _jsxs("div", { className: "options-actions", children: [_jsx("button", { className: "save-btn", onClick: saveSettings, disabled: isSaving, children: isSaving ? '💾 Saving...' : '💾 Save Settings' }), _jsx("button", { className: "reset-btn", onClick: resetToDefaults, children: "\uD83D\uDD04 Reset to Defaults" })] }), _jsxs("footer", { className: "options-footer", children: [_jsxs("p", { children: ["\uD83D\uDCD6 ", _jsx("strong", { children: "Accessibility Features:" }), " All processing happens on your device. No data is sent to external servers unless you explicitly enable cloud features."] }), _jsxs("p", { children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Adjust text size and contrast for the best reading experience."] })] })] }));
};
// Initialize options page
const container = document.getElementById('options-root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(Options, {}));
}
