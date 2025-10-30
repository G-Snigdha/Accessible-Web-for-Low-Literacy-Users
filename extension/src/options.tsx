import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/extension.css';
import '../../src-shared/styles/base.css';

interface SettingsState {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  autoSimplify: boolean;
  autoReadAloud: boolean;
  offlineMode: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
    voice: string;
  };
}

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
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

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
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
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateVoiceSetting = (key: keyof SettingsState['voiceSettings'], value: any) => {
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
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = settings.voiceSettings.rate;
    utterance.pitch = settings.voiceSettings.pitch;
    utterance.volume = settings.voiceSettings.volume;
    
    speechSynthesis.speak(utterance);
  };

  const resetToDefaults = () => {
    const defaultSettings: SettingsState = {
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

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>🌟 Accessible Web Settings</h1>
        <p>Customize your reading experience</p>
      </header>

      <div className="settings-sections">
        {/* Display Settings */}
        <section className="settings-section">
          <h2>📱 Display Settings</h2>
          
          <div className="setting-item">
            <label htmlFor="font-size">Text Size:</label>
            <select
              id="font-size"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              className="setting-select"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="high-contrast">
              <input
                type="checkbox"
                id="high-contrast"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
              />
              High Contrast Mode
            </label>
            <p className="setting-description">Improves text visibility</p>
          </div>

          <div className="setting-item">
            <label htmlFor="reduce-motion">
              <input
                type="checkbox"
                id="reduce-motion"
                checked={settings.reduceMotion}
                onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
              />
              Reduce Motion
            </label>
            <p className="setting-description">Minimizes animations</p>
          </div>
        </section>

        {/* Language Settings */}
        <section className="settings-section">
          <h2>🌍 Language Settings</h2>
          
          <div className="setting-item">
            <label htmlFor="language">Primary Language:</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </section>

        {/* Voice Settings */}
        <section className="settings-section">
          <h2>🔊 Voice Settings</h2>
          
          <div className="setting-item">
            <label htmlFor="voice-select">Voice:</label>
            <select
              id="voice-select"
              value={settings.voiceSettings.voice}
              onChange={(e) => updateVoiceSetting('voice', e.target.value)}
              className="setting-select"
            >
              <option value="">Default Voice</option>
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="speech-rate">Speed: {settings.voiceSettings.rate.toFixed(1)}</label>
            <input
              type="range"
              id="speech-rate"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.voiceSettings.rate}
              onChange={(e) => updateVoiceSetting('rate', parseFloat(e.target.value))}
              className="setting-range"
            />
          </div>

          <div className="setting-item">
            <label htmlFor="speech-pitch">Pitch: {settings.voiceSettings.pitch.toFixed(1)}</label>
            <input
              type="range"
              id="speech-pitch"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.voiceSettings.pitch}
              onChange={(e) => updateVoiceSetting('pitch', parseFloat(e.target.value))}
              className="setting-range"
            />
          </div>

          <div className="setting-item">
            <label htmlFor="speech-volume">Volume: {Math.round(settings.voiceSettings.volume * 100)}%</label>
            <input
              type="range"
              id="speech-volume"
              min="0"
              max="1"
              step="0.1"
              value={settings.voiceSettings.volume}
              onChange={(e) => updateVoiceSetting('volume', parseFloat(e.target.value))}
              className="setting-range"
            />
          </div>

          <button className="test-btn" onClick={testVoice}>
            🎤 Test Voice
          </button>
        </section>

        {/* Behavior Settings */}
        <section className="settings-section">
          <h2>⚡ Behavior Settings</h2>
          
          <div className="setting-item">
            <label htmlFor="auto-simplify">
              <input
                type="checkbox"
                id="auto-simplify"
                checked={settings.autoSimplify}
                onChange={(e) => updateSetting('autoSimplify', e.target.checked)}
              />
              Auto-simplify pages
            </label>
            <p className="setting-description">Automatically simplify text when pages load</p>
          </div>

          <div className="setting-item">
            <label htmlFor="auto-read">
              <input
                type="checkbox"
                id="auto-read"
                checked={settings.autoReadAloud}
                onChange={(e) => updateSetting('autoReadAloud', e.target.checked)}
              />
              Auto-read simplified text
            </label>
            <p className="setting-description">Start reading aloud after simplification</p>
          </div>

          <div className="setting-item">
            <label htmlFor="offline-mode">
              <input
                type="checkbox"
                id="offline-mode"
                checked={settings.offlineMode}
                onChange={(e) => updateSetting('offlineMode', e.target.checked)}
              />
              Prefer offline processing
            </label>
            <p className="setting-description">Use local AI when possible for privacy</p>
          </div>
        </section>
      </div>

      <div className="options-actions">
        <button className="save-btn" onClick={saveSettings} disabled={isSaving}>
          {isSaving ? '💾 Saving...' : '💾 Save Settings'}
        </button>
        
        <button className="reset-btn" onClick={resetToDefaults}>
          🔄 Reset to Defaults
        </button>
      </div>

      <footer className="options-footer">
        <p>
          📖 <strong>Accessibility Features:</strong> All processing happens on your device. 
          No data is sent to external servers unless you explicitly enable cloud features.
        </p>
        <p>
          💡 <strong>Tip:</strong> Adjust text size and contrast for the best reading experience.
        </p>
      </footer>
    </div>
  );
};

// Initialize options page
const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(<Options />);
}