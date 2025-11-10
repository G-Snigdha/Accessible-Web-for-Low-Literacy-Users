/**
 * Options/Settings Page for Chrome Built-in AI Extension
 * Comprehensive settings for accessibility, personalization, and AI features
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src-shared/styles/base.css';
import './styles/extension.css';

interface Settings {
  // Accessibility Settings
  accessibility: {
    enableHighContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    readingMode: boolean;
    highlightDifficultWords: boolean;
    enableTextToSpeech: boolean;
    speechRate: number; // 0.5 to 2.0
    speechVoice: string;
    enableKeyboardShortcuts: boolean;
    showTooltips: boolean;
  };

  // AI Processing Settings
  aiPreferences: {
    defaultSimplificationLevel: 'light' | 'medium' | 'heavy';
    preferredLanguage: string;
    autoDetectLanguage: boolean;
    enableSmartSuggestions: boolean;
    processOnSelect: boolean;
    showConfidenceScores: boolean;
  };

  // UI/UX Settings
  interface: {
    theme: 'light' | 'dark' | 'auto';
    sidebarPosition: 'left' | 'right';
    compactMode: boolean;
    enableAnimations: boolean;
    notificationLevel: 'all' | 'important' | 'none';
    autoSaveResults: boolean;
  };

  // Privacy & Performance
  privacy: {
    saveHistory: boolean;
    maxHistoryItems: number;
    enableAnalytics: boolean;
    shareUsageStats: boolean;
  };
}

const defaultSettings: Settings = {
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

const OptionsUI: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'accessibility' | 'ai' | 'interface' | 'privacy' | 'keyboard'>('accessibility');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
    } catch (error) {
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
    } catch (error) {
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

  const updateSettings = <K extends keyof Settings, SK extends keyof Settings[K]>(
    section: K,
    key: SK,
    value: Settings[K][SK]
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const testTextToSpeech = () => {
    if (isTestingVoice) return;
    
    setIsTestingVoice(true);
    const utterance = new SpeechSynthesisUtterance("This is how your selected voice will sound when reading text aloud.");
    
    const voice = voices.find(v => v.name === settings.accessibility.speechVoice);
    if (voice) utterance.voice = voice;
    
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

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...importedSettings });
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Invalid settings file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>🧠 Accessible Web Extension</h1>
        <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }}>Settings & Accessibility Options</p>
      </header>

      {/* Tab Navigation */}
      <nav style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f5f5f5', padding: '4px', borderRadius: '12px' }}>
        {[
          { id: 'accessibility', label: '♿ Accessibility', icon: '♿' },
          { id: 'ai', label: '🧠 AI Preferences', icon: '🧠' },
          { id: 'interface', label: '🎨 Interface', icon: '🎨' },
          { id: 'privacy', label: '🔒 Privacy', icon: '🔒' },
          { id: 'keyboard', label: '⌨️ Shortcuts', icon: '⌨️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
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
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', color: '#333' }}>♿ Accessibility Settings</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Visual Accessibility */}
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>👁️ Visual Accessibility</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.enableHighContrast}
                    onChange={(e) => updateSettings('accessibility', 'enableHighContrast', e.target.checked)}
                  />
                  <span>Enable High Contrast Mode</span>
                </label>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Font Size</label>
                  <select
                    value={settings.accessibility.fontSize}
                    onChange={(e) => updateSettings('accessibility', 'fontSize', e.target.value as any)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium (Default)</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.readingMode}
                    onChange={(e) => updateSettings('accessibility', 'readingMode', e.target.checked)}
                  />
                  <span>Enable Reading Mode (Focus on text content)</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.highlightDifficultWords}
                    onChange={(e) => updateSettings('accessibility', 'highlightDifficultWords', e.target.checked)}
                  />
                  <span>Highlight Difficult Words</span>
                </label>
              </section>

              {/* Audio Accessibility */}
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>🔊 Audio Accessibility</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.enableTextToSpeech}
                    onChange={(e) => updateSettings('accessibility', 'enableTextToSpeech', e.target.checked)}
                  />
                  <span>Enable Text-to-Speech</span>
                </label>
                
                {settings.accessibility.enableTextToSpeech && (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Voice</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={settings.accessibility.speechVoice}
                          onChange={(e) => updateSettings('accessibility', 'speechVoice', e.target.value)}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                        >
                          {voices.map(voice => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={testTextToSpeech}
                          disabled={isTestingVoice}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isTestingVoice ? '#ccc' : '#667eea',
                            color: 'white',
                            cursor: isTestingVoice ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {isTestingVoice ? '🔊 Testing...' : '🔊 Test'}
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Speech Rate: {settings.accessibility.speechRate}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.accessibility.speechRate}
                        onChange={(e) => updateSettings('accessibility', 'speechRate', parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                        <span>Slow (0.5x)</span>
                        <span>Normal (1.0x)</span>
                        <span>Fast (2.0x)</span>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Interaction Accessibility */}
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>⌨️ Interaction</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.enableKeyboardShortcuts}
                    onChange={(e) => updateSettings('accessibility', 'enableKeyboardShortcuts', e.target.checked)}
                  />
                  <span>Enable Keyboard Shortcuts</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.accessibility.showTooltips}
                    onChange={(e) => updateSettings('accessibility', 'showTooltips', e.target.checked)}
                  />
                  <span>Show Helpful Tooltips</span>
                </label>
              </section>
            </div>
          </div>
        )}

        {/* AI Preferences Tab */}
        {activeTab === 'ai' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', color: '#333' }}>🧠 AI Processing Preferences</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>📝 Text Processing</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Default Simplification Level</label>
                  <select
                    value={settings.aiPreferences.defaultSimplificationLevel}
                    onChange={(e) => updateSettings('aiPreferences', 'defaultSimplificationLevel', e.target.value as any)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="light">Light - Minor improvements</option>
                    <option value="medium">Medium - Balanced simplification</option>
                    <option value="heavy">Heavy - Maximum simplification</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Preferred Language</label>
                  <select
                    value={settings.aiPreferences.preferredLanguage}
                    onChange={(e) => updateSettings('aiPreferences', 'preferredLanguage', e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.aiPreferences.autoDetectLanguage}
                    onChange={(e) => updateSettings('aiPreferences', 'autoDetectLanguage', e.target.checked)}
                  />
                  <span>Auto-detect text language</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.aiPreferences.enableSmartSuggestions}
                    onChange={(e) => updateSettings('aiPreferences', 'enableSmartSuggestions', e.target.checked)}
                  />
                  <span>Enable smart content suggestions</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.aiPreferences.processOnSelect}
                    onChange={(e) => updateSettings('aiPreferences', 'processOnSelect', e.target.checked)}
                  />
                  <span>Auto-process text when selected</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.aiPreferences.showConfidenceScores}
                    onChange={(e) => updateSettings('aiPreferences', 'showConfidenceScores', e.target.checked)}
                  />
                  <span>Show AI confidence scores</span>
                </label>
              </section>
            </div>
          </div>
        )}

        {/* Interface Tab */}
        {activeTab === 'interface' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', color: '#333' }}>🎨 Interface & Experience</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>🎨 Appearance</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Theme</label>
                  <select
                    value={settings.interface.theme}
                    onChange={(e) => updateSettings('interface', 'theme', e.target.value as any)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (Follow system)</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Sidebar Position</label>
                  <select
                    value={settings.interface.sidebarPosition}
                    onChange={(e) => updateSettings('interface', 'sidebarPosition', e.target.value as any)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="left">Left Side</option>
                    <option value="right">Right Side</option>
                  </select>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.interface.compactMode}
                    onChange={(e) => updateSettings('interface', 'compactMode', e.target.checked)}
                  />
                  <span>Compact interface mode</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.interface.enableAnimations}
                    onChange={(e) => updateSettings('interface', 'enableAnimations', e.target.checked)}
                  />
                  <span>Enable smooth animations</span>
                </label>
              </section>

              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>📢 Notifications</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Notification Level</label>
                  <select
                    value={settings.interface.notificationLevel}
                    onChange={(e) => updateSettings('interface', 'notificationLevel', e.target.value as any)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="all">All notifications</option>
                    <option value="important">Important only</option>
                    <option value="none">No notifications</option>
                  </select>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.interface.autoSaveResults}
                    onChange={(e) => updateSettings('interface', 'autoSaveResults', e.target.checked)}
                  />
                  <span>Auto-save processed results</span>
                </label>
              </section>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', color: '#333' }}>🔒 Privacy & Data</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#555' }}>📊 Data Storage</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.privacy.saveHistory}
                    onChange={(e) => updateSettings('privacy', 'saveHistory', e.target.checked)}
                  />
                  <span>Save processing history</span>
                </label>
                
                {settings.privacy.saveHistory && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                      Maximum History Items: {settings.privacy.maxHistoryItems}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={settings.privacy.maxHistoryItems}
                      onChange={(e) => updateSettings('privacy', 'maxHistoryItems', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                      <span>10 items</span>
                      <span>500 items</span>
                    </div>
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.privacy.enableAnalytics}
                    onChange={(e) => updateSettings('privacy', 'enableAnalytics', e.target.checked)}
                  />
                  <span>Enable usage analytics (helps improve the extension)</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareUsageStats}
                    onChange={(e) => updateSettings('privacy', 'shareUsageStats', e.target.checked)}
                  />
                  <span>Share anonymous usage statistics</span>
                </label>
              </section>

              <section style={{ background: '#f0f7ff', padding: '16px', borderRadius: '8px', border: '1px solid #e0f0ff' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#1e40af' }}>🔒 Privacy Guarantee</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.4' }}>
                  All AI processing happens locally on your device using Chrome's Built-in AI APIs. 
                  Your text content is never sent to external servers. This extension respects your privacy completely.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Tab */}
        {activeTab === 'keyboard' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', color: '#333' }}>⌨️ Keyboard Shortcuts</h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { shortcut: 'Alt + S', action: 'Simplify selected text', description: 'Makes text easier to understand' },
                { shortcut: 'Alt + P', action: 'Proofread selected text', description: 'Corrects grammar and spelling' },
                { shortcut: 'Alt + T', action: 'Translate selected text', description: 'Translates to your preferred language' },
                { shortcut: 'Alt + R', action: 'Rewrite selected text', description: 'Improves clarity and tone' },
                { shortcut: 'Alt + L', action: 'Listen to selected text', description: 'Reads text aloud using text-to-speech' },
                { shortcut: 'Alt + E', action: 'Explain selected text', description: 'Provides detailed explanations' },
                { shortcut: 'Alt + Shift + S', action: 'Toggle sidebar', description: 'Shows/hides the AI assistant sidebar' },
                { shortcut: 'Escape', action: 'Close sidebar or notifications', description: 'Dismisses open interface elements' },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.action}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                  </div>
                  <code style={{
                    padding: '6px 12px',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {item.shortcut}
                  </code>
                </div>
              ))}
              
              <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#92400e' }}>💡 Pro Tips</h4>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#92400e' }}>
                  <li>Select any text on a webpage first, then use shortcuts</li>
                  <li>Shortcuts work on any website - no setup required</li>
                  <li>Use Escape key to quickly close any open interface</li>
                  <li>Keyboard shortcuts can be disabled in Accessibility settings</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: saveStatus === 'saving' ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            minWidth: '120px'
          }}
        >
          {saveStatus === 'saving' ? '💾 Saving...' : 
           saveStatus === 'saved' ? '✅ Saved!' :
           saveStatus === 'error' ? '❌ Error' : '💾 Save Settings'}
        </button>
        
        <button
          onClick={resetToDefaults}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: 'white',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset to Defaults
        </button>
        
        <button
          onClick={exportSettings}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: 'white',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          📥 Export Settings
        </button>
        
        <label style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: 'white',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}>
          📤 Import Settings
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666' }}>
        <p>Accessible Web Extension • Privacy-First AI • Made with ❤️ for everyone</p>
      </footer>
    </div>
  );
};

// Initialize options page
const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsUI />);
}