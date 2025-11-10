// Enhanced Accessible Text Reader - Interactive JavaScript
// Beautiful & User-Friendly Implementation

// Configuration
const CONFIG = {
    apiEndpoint: 'http://localhost:3001',
    maxTextLength: 10000,
    defaultSettings: {
        fontSize: 'medium',
        highContrast: false,
        darkMode: false,
        enableAnimations: true,
        autoSave: true,
        language: 'en',
        voiceRate: 1.0,
        voicePitch: 1.0
    },
    languages: {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ar': 'Arabic'
    }
};

// State Management
class AppState {
    constructor() {
        this.currentText = '';
        this.currentResults = {};
        this.isProcessing = false;
        this.settings = { ...CONFIG.defaultSettings };
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('accessibleTextSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('accessibleTextSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        document.body.className = '';
        
        // Apply font size
        document.body.classList.add(`font-${this.settings.fontSize}`);
        
        // Apply themes
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Apply animations
        if (!this.settings.enableAnimations) {
            document.body.style.setProperty('--transition-fast', '0s');
            document.body.style.setProperty('--transition-normal', '0s');
            document.body.style.setProperty('--transition-slow', '0s');
        }
    }
}

// Initialize app state
const appState = new AppState();

// DOM Elements
const elements = {
    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),
    
    // Input methods
    inputMethods: document.querySelectorAll('.input-method'),
    inputSections: document.querySelectorAll('.input-section'),
    textInput: document.querySelector('#text-input-field'),
    urlInput: document.querySelector('#url-input-field'),
    fileUpload: document.querySelector('#file-input-field'),
    fileUploadArea: document.querySelector('.file-upload-area'),
    
    // Actions
    clearBtn: document.querySelector('.clear-btn'),
    pasteBtn: document.querySelector('.paste-btn'),
    
    // Features
    featureBtns: document.querySelectorAll('.feature-btn'),
    
    // Results
    resultsSection: document.querySelector('.results-section'),
    closeResults: document.querySelector('.close-results'),
    resultTabs: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    resultTexts: document.querySelectorAll('.result-text'),
    
    // Modal
    settingsBtn: document.querySelector('[data-action="settings"]'),
    modalOverlay: document.querySelector('#settings-modal'),
    modalClose: document.querySelector('.modal-close'),
    settingsForm: document.querySelector('#settings-form'),
    
    // Loading
    loadingOverlay: document.querySelector('.loading-overlay'),
    
    // PWA
    installBtn: document.querySelector('.install-pwa')
};

// Utility Functions
class Utils {
    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    static showLoading(text = 'Processing...', subtext = 'Please wait while we work on your text') {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.querySelector('.loading-text').textContent = text;
            elements.loadingOverlay.querySelector('.loading-subtext').textContent = subtext;
            elements.loadingOverlay.classList.remove('hidden');
        }
    }

    static hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.add('hidden');
        }
    }

    static sanitizeText(text) {
        return text.replace(/<[^>]*>?/gm, '').trim();
    }

    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Text copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showToast('Failed to copy text', 'error');
        }
    }

    static downloadAsFile(text, filename = 'processed-text.txt') {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showToast('File downloaded successfully!');
    }
}

// API Service
class APIService {
    static async processText(text, operation) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/api/text/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    action: operation,
                    language: appState.settings.language
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Failed to process text. Please check your connection and try again.');
        }
    }

    static async extractTextFromUrl(url) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/api/text/extract-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('URL extraction error:', error);
            throw new Error('Failed to extract text from URL. Please check the URL and try again.');
        }
    }
}

// Text Processing Functions
class TextProcessor {
    static async processWithOperation(operation) {
        if (!appState.currentText.trim()) {
            Utils.showToast('Please enter some text first', 'error');
            return;
        }

        if (appState.currentText.length > CONFIG.maxTextLength) {
            Utils.showToast(`Text is too long. Maximum ${CONFIG.maxTextLength} characters allowed.`, 'error');
            return;
        }

        appState.isProcessing = true;
        
        try {
            let loadingText, loadingSubtext;
            
            switch (operation) {
                case 'simplify':
                    loadingText = 'Simplifying text...';
                    loadingSubtext = 'Making complex words and sentences easier to understand';
                    break;
                case 'rewrite':
                    loadingText = 'Rewriting text...';
                    loadingSubtext = 'Creating a clearer, more accessible version';
                    break;
                case 'translate':
                    loadingText = 'Translating text...';
                    loadingSubtext = `Translating to ${CONFIG.languages[appState.settings.language]}`;
                    break;
                case 'proofread':
                    loadingText = 'Proofreading text...';
                    loadingSubtext = 'Checking grammar, spelling, and clarity';
                    break;
                case 'analyze':
                    loadingText = 'Analyzing text...';
                    loadingSubtext = 'Examining readability, complexity, and structure';
                    break;
                default:
                    loadingText = 'Processing text...';
                    loadingSubtext = 'Please wait while we work on your request';
            }

            Utils.showLoading(loadingText, loadingSubtext);

            const result = await APIService.processText(appState.currentText, operation);
            
            appState.currentResults[operation] = result;
            
            this.displayResults(operation, result);
            
            // Auto-save if enabled
            if (appState.settings.autoSave) {
                this.saveToHistory(operation, appState.currentText, result);
            }

        } catch (error) {
            console.error('Processing error:', error);
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
            appState.isProcessing = false;
        }
    }

    static displayResults(operation, result) {
        // Show results section
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Update the processed text panel
        const processedTextDiv = document.getElementById('processed-text');
        const originalTextDiv = document.getElementById('original-text');
        const improvedTextDiv = document.getElementById('improved-text');
        const analysisContentDiv = document.getElementById('analysis-content');

        // Update processed text
        if (processedTextDiv) {
            processedTextDiv.textContent = result.data?.processed_text || result.processedText || result.text || 'Processing completed';
        }

        // Update comparison view
        if (originalTextDiv) {
            originalTextDiv.textContent = result.data?.original_text || appState.currentText || 'Original text';
        }
        if (improvedTextDiv) {
            improvedTextDiv.textContent = result.data?.processed_text || result.processedText || result.text || 'Improved text';
        }

        // Update analysis panel if available
        if (analysisContentDiv && result.data?.analysis) {
            this.updateAnalysisPanel(result.data.analysis);
        }

        // Activate the processed text tab by default
        const processedTab = document.querySelector('[data-tab="processed"]');
        const processedPanel = document.getElementById('processed-panel');
        
        if (processedTab && processedPanel) {
            // Reset all tabs
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            // Activate processed tab
            processedTab.classList.add('active');
            processedPanel.classList.add('active');
        }

        // Update stats
        this.updateStats();
    }

    static updateAnalysisPanel(analysis) {
        const analysisContent = document.getElementById('analysis-content');
        if (!analysisContent) return;

        const analysisHTML = `
            <div class="analysis-card">
                <h4>📊 Reading Level</h4>
                <p>Grade: ${analysis.reading_level?.grade || 'N/A'}</p>
                <p>Level: ${analysis.reading_level?.level || 'N/A'}</p>
            </div>
            <div class="analysis-card">
                <h4>📈 Statistics</h4>
                <p>Word Count: ${analysis.word_count || 0}</p>
                <p>Sentence Count: ${analysis.sentence_count || 0}</p>
                <p>Complexity Score: ${analysis.complexity_score || 'N/A'}</p>
            </div>
            <div class="analysis-card">
                <h4>💭 Sentiment</h4>
                <p>${analysis.sentiment || 'Neutral'}</p>
            </div>
            ${analysis.difficult_words?.length ? `
            <div class="analysis-card">
                <h4>🔤 Difficult Words</h4>
                <p>${analysis.difficult_words.join(', ')}</p>
            </div>` : ''}
        `;
        
        analysisContent.innerHTML = analysisHTML;
    }

    static updateTabContent(operation, result, tabPanel) {
        const resultText = tabPanel.querySelector('.result-text');
        
        switch (operation) {
            case 'simplify':
            case 'rewrite':
            case 'translate':
                resultText.textContent = result.processedText || result.text || 'No result available';
                break;
                
            case 'proofread':
                if (result.corrections && result.corrections.length > 0) {
                    resultText.innerHTML = this.formatCorrections(result.corrections);
                } else {
                    resultText.textContent = 'No corrections needed - your text looks great!';
                }
                break;
                
            case 'analyze':
                if (result.analysis) {
                    resultText.innerHTML = this.formatAnalysis(result.analysis);
                } else {
                    resultText.textContent = 'Analysis completed successfully';
                }
                break;
        }

        // Update action buttons for this tab
        this.updateActionButtons(operation, result, tabPanel);
    }

    static formatCorrections(corrections) {
        let html = '<div class="corrections-list">';
        corrections.forEach((correction, index) => {
            html += `
                <div class="correction-item">
                    <strong>Issue ${index + 1}:</strong> ${correction.issue}<br>
                    <span class="correction-before">Before: "${correction.before}"</span><br>
                    <span class="correction-after">After: "${correction.after}"</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    static formatAnalysis(analysis) {
        return `
            <div class="analysis-results">
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <strong>Reading Level:</strong> ${analysis.readingLevel || 'N/A'}
                    </div>
                    <div class="analysis-item">
                        <strong>Word Count:</strong> ${analysis.wordCount || 'N/A'}
                    </div>
                    <div class="analysis-item">
                        <strong>Sentence Count:</strong> ${analysis.sentenceCount || 'N/A'}
                    </div>
                    <div class="analysis-item">
                        <strong>Avg Sentence Length:</strong> ${analysis.avgSentenceLength || 'N/A'}
                    </div>
                    <div class="analysis-item">
                        <strong>Complex Words:</strong> ${analysis.complexWords || 'N/A'}%
                    </div>
                    <div class="analysis-item">
                        <strong>Readability Score:</strong> ${analysis.readabilityScore || 'N/A'}
                    </div>
                </div>
                ${analysis.suggestions ? `
                    <div class="suggestions">
                        <h4>Suggestions for Improvement:</h4>
                        <ul>
                            ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    static updateActionButtons(operation, result, tabPanel) {
        const actionsContainer = tabPanel.querySelector('.result-actions');
        const text = result.processedText || result.text || appState.currentText;
        
        // Clear existing buttons
        actionsContainer.innerHTML = '';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn primary';
        copyBtn.innerHTML = '📋 Copy Text';
        copyBtn.onclick = () => Utils.copyToClipboard(text);
        actionsContainer.appendChild(copyBtn);
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn secondary';
        downloadBtn.innerHTML = '💾 Download';
        downloadBtn.onclick = () => Utils.downloadAsFile(text, `${operation}-result.txt`);
        actionsContainer.appendChild(downloadBtn);
        
        // Read aloud button
        const readBtn = document.createElement('button');
        readBtn.className = 'action-btn secondary';
        readBtn.innerHTML = '🔊 Read Aloud';
        readBtn.onclick = () => TextToSpeech.speak(text);
        actionsContainer.appendChild(readBtn);
        
        // Share button (if Web Share API is supported)
        if (navigator.share) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'action-btn secondary';
            shareBtn.innerHTML = '📤 Share';
            shareBtn.onclick = () => this.shareText(text, operation);
            actionsContainer.appendChild(shareBtn);
        }
    }

    static async shareText(text, operation) {
        try {
            await navigator.share({
                title: `Text ${operation} result`,
                text: text
            });
        } catch (error) {
            console.error('Share failed:', error);
            Utils.copyToClipboard(text);
        }
    }

    static saveToHistory(operation, originalText, result) {
        try {
            const history = JSON.parse(localStorage.getItem('textProcessingHistory') || '[]');
            const entry = {
                id: Date.now(),
                operation,
                originalText: originalText.substring(0, 100) + (originalText.length > 100 ? '...' : ''),
                result: result.processedText || result.text || 'Analysis completed',
                timestamp: new Date().toISOString()
            };
            
            history.unshift(entry);
            
            // Keep only last 50 entries
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem('textProcessingHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save to history:', error);
        }
    }

    static updateStats() {
        // Update processing stats in hero section
        const stats = {
            textsProcessed: parseInt(localStorage.getItem('textsProcessed') || '0') + 1,
            wordsProcessed: parseInt(localStorage.getItem('wordsProcessed') || '0') + appState.currentText.split(' ').length,
            timesSaved: parseInt(localStorage.getItem('timesSaved') || '0') + Math.ceil(appState.currentText.length / 200)
        };
        
        localStorage.setItem('textsProcessed', stats.textsProcessed.toString());
        localStorage.setItem('wordsProcessed', stats.wordsProcessed.toString());
        localStorage.setItem('timesSaved', stats.timesSaved.toString());
        
        // Update display
        document.querySelectorAll('.stat-number').forEach((el, index) => {
            const values = [stats.textsProcessed, stats.wordsProcessed, stats.timesSaved];
            if (values[index]) {
                el.textContent = values[index].toLocaleString();
            }
        });
    }
}

// Text-to-Speech Service
class TextToSpeech {
    static speak(text) {
        if (!('speechSynthesis' in window)) {
            Utils.showToast('Text-to-speech not supported in your browser', 'error');
            return;
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = appState.settings.voiceRate;
        utterance.pitch = appState.settings.voicePitch;
        utterance.lang = appState.settings.language;

        utterance.onstart = () => {
            Utils.showToast('Reading text aloud...');
        };

        utterance.onend = () => {
            Utils.showToast('Finished reading');
        };

        utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            Utils.showToast('Failed to read text aloud', 'error');
        };

        speechSynthesis.speak(utterance);
    }

    static stop() {
        speechSynthesis.cancel();
    }
}

// Input Handlers
class InputHandler {
    static switchInputMethod(method) {
        // Update active method button
        elements.inputMethods.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.method === method) {
                btn.classList.add('active');
            }
        });

        // Show corresponding input section
        elements.inputSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${method}-input`) {
                section.classList.add('active');
            }
        });
    }

    static async handleTextInput(text) {
        appState.currentText = Utils.sanitizeText(text);
        if (appState.currentText.length > CONFIG.maxTextLength) {
            Utils.showToast(`Text truncated to ${CONFIG.maxTextLength} characters`, 'warning');
            appState.currentText = appState.currentText.substring(0, CONFIG.maxTextLength);
            elements.textInput.value = appState.currentText;
        }
    }

    static async handleUrlInput(url) {
        if (!Utils.validateUrl(url)) {
            Utils.showToast('Please enter a valid URL', 'error');
            return;
        }

        try {
            Utils.showLoading('Extracting text from URL...', 'Please wait while we fetch the content');
            const extractedText = await APIService.extractTextFromUrl(url);
            
            if (extractedText) {
                appState.currentText = Utils.sanitizeText(extractedText);
                elements.textInput.value = appState.currentText;
                this.switchInputMethod('text');
                Utils.showToast('Text extracted successfully from URL!');
            } else {
                throw new Error('No text found at the provided URL');
            }
        } catch (error) {
            console.error('URL processing error:', error);
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    static async handleFileUpload(file) {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['text/plain', 'text/csv', 'application/json'];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
            Utils.showToast('Please upload a text file (.txt, .csv, or .json)', 'error');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showToast('File size must be less than 5MB', 'error');
            return;
        }

        try {
            Utils.showLoading('Reading file...', `Processing ${file.name} (${Utils.formatFileSize(file.size)})`);
            
            const text = await this.readFileAsText(file);
            appState.currentText = Utils.sanitizeText(text);
            
            if (appState.currentText.length > CONFIG.maxTextLength) {
                appState.currentText = appState.currentText.substring(0, CONFIG.maxTextLength);
                Utils.showToast(`File content truncated to ${CONFIG.maxTextLength} characters`, 'warning');
            }
            
            elements.textInput.value = appState.currentText;
            this.switchInputMethod('text');
            Utils.showToast(`File "${file.name}" loaded successfully!`);
        } catch (error) {
            console.error('File reading error:', error);
            Utils.showToast('Failed to read file. Please try again.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    static async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                elements.textInput.value = text;
                await this.handleTextInput(text);
                Utils.showToast('Text pasted from clipboard!');
            }
        } catch (error) {
            console.error('Clipboard access error:', error);
            Utils.showToast('Failed to access clipboard. Please paste manually.', 'error');
        }
    }

    static clearInput() {
        elements.textInput.value = '';
        elements.urlInput.value = '';
        if (elements.fileUpload) elements.fileUpload.value = '';
        appState.currentText = '';
        Utils.showToast('Input cleared');
    }
}

// Settings Management
class SettingsManager {
    static openModal() {
        elements.modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.populateSettings();
    }

    static closeModal() {
        elements.modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    static populateSettings() {
        // Font size
        const fontSizeSelect = document.querySelector('#font-size');
        if (fontSizeSelect) {
            fontSizeSelect.value = appState.settings.fontSize;
        }

        // Language
        const languageSelect = document.querySelector('#language');
        if (languageSelect) {
            languageSelect.value = appState.settings.language;
        }

        // Checkboxes
        const checkboxes = {
            'high-contrast': appState.settings.highContrast,
            'dark-mode': appState.settings.darkMode,
            'enable-animations': appState.settings.enableAnimations,
            'auto-save': appState.settings.autoSave
        };

        Object.keys(checkboxes).forEach(id => {
            const checkbox = document.querySelector(`#${id}`);
            if (checkbox) {
                checkbox.checked = checkboxes[id];
            }
        });

        // Range inputs
        const voiceRateInput = document.querySelector('#voice-rate');
        const voicePitchInput = document.querySelector('#voice-pitch');
        
        if (voiceRateInput) {
            voiceRateInput.value = appState.settings.voiceRate;
            document.querySelector('#voice-rate-value').textContent = appState.settings.voiceRate;
        }
        
        if (voicePitchInput) {
            voicePitchInput.value = appState.settings.voicePitch;
            document.querySelector('#voice-pitch-value').textContent = appState.settings.voicePitch;
        }
    }

    static saveSettings(formData) {
        // Update settings from form
        appState.settings.fontSize = formData.get('font-size') || appState.settings.fontSize;
        appState.settings.language = formData.get('language') || appState.settings.language;
        appState.settings.highContrast = formData.has('high-contrast');
        appState.settings.darkMode = formData.has('dark-mode');
        appState.settings.enableAnimations = formData.has('enable-animations');
        appState.settings.autoSave = formData.has('auto-save');
        appState.settings.voiceRate = parseFloat(formData.get('voice-rate')) || appState.settings.voiceRate;
        appState.settings.voicePitch = parseFloat(formData.get('voice-pitch')) || appState.settings.voicePitch;

        // Save and apply
        appState.saveSettings();
        appState.applySettings();
        
        this.closeModal();
        Utils.showToast('Settings saved successfully!');
    }

    static resetSettings() {
        appState.settings = { ...CONFIG.defaultSettings };
        appState.saveSettings();
        appState.applySettings();
        this.populateSettings();
        Utils.showToast('Settings reset to defaults');
    }
}

// PWA Installation
class PWAInstaller {
    static init() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            if (elements.installBtn) {
                elements.installBtn.style.display = 'inline-block';
            }
        });

        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        Utils.showToast('App installed successfully!');
                    }
                    
                    deferredPrompt = null;
                    elements.installBtn.style.display = 'none';
                }
            });
        }
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'settings') {
                SettingsManager.openModal();
            } else {
                const targetSection = document.querySelector(`#${action}-section`);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Input method switching
    elements.inputMethods.forEach(btn => {
        btn.addEventListener('click', (e) => {
            InputHandler.switchInputMethod(e.target.dataset.method);
        });
    });

    // Text input
    if (elements.textInput) {
        elements.textInput.addEventListener('input', (e) => {
            InputHandler.handleTextInput(e.target.value);
        });

        elements.textInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                InputHandler.handleTextInput(e.target.value);
            }, 10);
        });
    }

    // URL input
    if (elements.urlInput) {
        elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                InputHandler.handleUrlInput(e.target.value);
            }
        });
    }

    // File upload
    if (elements.fileUpload) {
        elements.fileUpload.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                InputHandler.handleFileUpload(e.target.files[0]);
            }
        });
    }

    // File drop area
    if (elements.fileUploadArea) {
        elements.fileUploadArea.addEventListener('click', () => {
            elements.fileUpload.click();
        });

        elements.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.fileUploadArea.style.borderColor = 'var(--primary-500)';
            elements.fileUploadArea.style.backgroundColor = 'var(--primary-50)';
        });

        elements.fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.fileUploadArea.style.borderColor = '';
            elements.fileUploadArea.style.backgroundColor = '';
        });

        elements.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.fileUploadArea.style.borderColor = '';
            elements.fileUploadArea.style.backgroundColor = '';
            
            if (e.dataTransfer.files[0]) {
                InputHandler.handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    // Action buttons
    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', InputHandler.clearInput);
    }

    if (elements.pasteBtn) {
        elements.pasteBtn.addEventListener('click', InputHandler.pasteFromClipboard);
    }

    // Feature buttons
    elements.featureBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operation = e.target.dataset.operation;
            if (operation) {
                TextProcessor.processWithOperation(operation);
            }
        });
    });

    // Results section
    if (elements.closeResults) {
        elements.closeResults.addEventListener('click', () => {
            elements.resultsSection.classList.add('hidden');
        });
    }

    // Result tabs
    elements.resultTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.dataset.tab;
            
            elements.resultTabs.forEach(t => t.classList.remove('active'));
            elements.tabPanels.forEach(panel => panel.classList.remove('active'));
            
            e.target.classList.add('active');
            document.querySelector(`#${targetTab}-panel`).classList.add('active');
        });
    });

    // Modal events
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) {
                SettingsManager.closeModal();
            }
        });
    }

    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', SettingsManager.closeModal);
    }

    // Settings form
    if (elements.settingsForm) {
        elements.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            SettingsManager.saveSettings(formData);
        });

        // Range input updates
        const voiceRateInput = document.querySelector('#voice-rate');
        const voicePitchInput = document.querySelector('#voice-pitch');
        
        if (voiceRateInput) {
            voiceRateInput.addEventListener('input', (e) => {
                document.querySelector('#voice-rate-value').textContent = e.target.value;
            });
        }
        
        if (voicePitchInput) {
            voicePitchInput.addEventListener('input', (e) => {
                document.querySelector('#voice-pitch-value').textContent = e.target.value;
            });
        }

        // Reset settings button
        const resetBtn = document.querySelector('#reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', SettingsManager.resetSettings);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    if (appState.currentText && !appState.isProcessing) {
                        TextProcessor.processWithOperation('simplify');
                    }
                    break;
                case ',':
                    e.preventDefault();
                    SettingsManager.openModal();
                    break;
                case 'l':
                    e.preventDefault();
                    elements.textInput.focus();
                    break;
            }
        }

        if (e.key === 'Escape') {
            if (!elements.modalOverlay.classList.contains('hidden')) {
                SettingsManager.closeModal();
            }
        }
    });
}

// Smooth animations for chart bars (demo)
function animateChartBars() {
    const bars = document.querySelectorAll('.bar-fill');
    const heights = [120, 90, 150, 80]; // Example heights
    
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.height = heights[index] + 'px';
        }, index * 200);
    });
}

// Initialize Application
function initializeApp() {
    console.log('Initializing Enhanced Accessible Text Reader...');
    
    try {
        // Apply initial settings
        appState.applySettings();
        
        // Set up all event listeners
        setupEventListeners();
        
        // Initialize PWA
        PWAInstaller.init();
        
        // Set default input method
        InputHandler.switchInputMethod('text');
        
        // Hide loading overlay if present
        Utils.hideLoading();
        
        // Animate demo elements
        setTimeout(animateChartBars, 1000);
        
        // Show welcome message for first-time users
        if (!localStorage.getItem('hasVisited')) {
            setTimeout(() => {
                Utils.showToast('Welcome! Try typing some text and click a feature button to get started.');
                localStorage.setItem('hasVisited', 'true');
            }, 1000);
        }
        
        console.log('App initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        Utils.showToast('Failed to initialize application. Please refresh the page.', 'error');
    }
}

// Initialize tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            const targetPanel = document.getElementById(`${targetTab}-panel`);

            if (targetPanel) {
                // Remove active class from all tabs and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                button.classList.add('active');
                targetPanel.classList.add('active');
            }
        });
    });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        initializeTabs();
    });
} else {
    initializeApp();
    initializeTabs();
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Utils.showToast('An unexpected error occurred. Please try refreshing the page.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showToast('A network error occurred. Please check your connection.', 'error');
    event.preventDefault();
});

// Global functions for HTML onclick handlers
window.processWithFeature = async (action) => {
    try {
        const textInput = document.getElementById('text-input-field');
        
        if (!textInput) {
            console.error('Text input field not found!');
            Utils.showToast('Error: Text input not found. Please refresh the page.', 'error');
            return;
        }
        
        const text = textInput.value.trim();
        
        if (!text) {
            // Scroll to input and highlight it
            textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            textInput.focus();
            Utils.showToast('⚠️ Please enter some text first to use this feature!', 'error');
            
            // Add a visual shake effect
            textInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                textInput.style.animation = '';
            }, 500);
            return;
        }
        
        if (action === 'speech') {
            TextToSpeech.speak(text);
            Utils.showToast('🔊 Reading text aloud...');
            return;
        }
        
        console.log('Processing with action:', action);
        console.log('Text length:', text.length);
        
        appState.currentText = text;
        
        // Show loading state
        Utils.showToast(`⏳ Processing text with ${action} feature...`);
        
        await TextProcessor.processWithOperation(action);
        
        Utils.showToast('✅ Processing completed successfully!');
        
    } catch (error) {
        console.error('Process feature error:', error);
        Utils.showToast(`❌ Failed: ${error.message}`, 'error');
    }
};

window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

window.toggleSettings = () => {
    SettingsManager.openModal();
};

window.switchInputMethod = (method) => {
    InputHandler.switchInputMethod(method);
};

window.clearInput = () => {
    const textInput = document.getElementById('text-input-field');
    const urlInput = document.getElementById('url-input-field');
    const fileInput = document.getElementById('file-input-field');
    
    if (textInput) textInput.value = '';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    
    appState.currentText = '';
    Utils.showToast('Input cleared');
};

window.pasteFromClipboard = async () => {
    try {
        const text = await navigator.clipboard.readText();
        const textInput = document.getElementById('text-input-field');
        if (textInput && text) {
            textInput.value = text;
            appState.currentText = text;
            Utils.showToast('Text pasted from clipboard');
        } else {
            Utils.showToast('No text found in clipboard', 'error');
        }
    } catch (error) {
        Utils.showToast('Failed to access clipboard. Please paste manually.', 'error');
    }
};

window.hideResults = () => {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
};

window.readResultAloud = () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        const resultText = activePanel.querySelector('.result-text') || activePanel.querySelector('.comparison-text');
        if (resultText) {
            TextToSpeech.speak(resultText.textContent);
            Utils.showToast('Reading result aloud...');
        }
    }
};

window.copyResult = async () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        const resultText = activePanel.querySelector('.result-text') || activePanel.querySelector('.comparison-text');
        if (resultText) {
            try {
                await navigator.clipboard.writeText(resultText.textContent);
                Utils.showToast('Result copied to clipboard');
            } catch (error) {
                Utils.showToast('Failed to copy to clipboard', 'error');
            }
        }
    }
};

window.downloadResult = () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        const resultText = activePanel.querySelector('.result-text');
        if (resultText) {
            Utils.downloadText(resultText.textContent, 'processed-text.txt');
        }
    }
};

window.shareResult = () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        const resultText = activePanel.querySelector('.result-text');
        if (resultText && navigator.share) {
            navigator.share({
                title: 'Processed Text Result',
                text: resultText.textContent
            }).then(() => {
                Utils.showToast('Result shared successfully');
            }).catch(() => {
                // Fallback to copying to clipboard
                window.copyResult();
            });
        } else {
            // Fallback to copying to clipboard
            window.copyResult();
        }
    }
};

// Enhanced feature processing with options
window.processWithFeatureOptions = async (action) => {
    try {
        const textInput = document.getElementById('text-input-field');
        
        if (!textInput) {
            console.error('Text input field not found!');
            Utils.showToast('Error: Text input not found. Please refresh the page.', 'error');
            return;
        }
        
        const text = textInput.value.trim();
        
        if (!text) {
            // Scroll to input and highlight it
            textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            textInput.focus();
            Utils.showToast('⚠️ Please enter some text first to use this feature!', 'error');
            
            // Add a visual shake effect
            textInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                textInput.style.animation = '';
            }, 500);
            return;
        }
        
        // Get options for each feature
        let options = {};
        
        switch (action) {
            case 'simplify':
                const simplifyLevel = document.getElementById('simplify-level')?.value || 'middle';
                options.level = simplifyLevel;
                Utils.showToast(`✨ Simplifying text for ${simplifyLevel} school level...`);
                break;
                
            case 'translate':
                const fromLang = document.getElementById('translate-from')?.value || 'auto';
                const toLang = document.getElementById('translate-to')?.value || 'es';
                options.from = fromLang;
                options.to = toLang;
                
                const fromName = getLanguageName(fromLang);
                const toName = getLanguageName(toLang);
                Utils.showToast(`🌍 Translating from ${fromName} to ${toName}...`);
                break;
                
            case 'rewrite':
                const style = document.getElementById('rewrite-style')?.value || 'casual';
                options.style = style;
                Utils.showToast(`📝 Rewriting in ${style} style...`);
                break;
                
            case 'speech':
                const voice = document.getElementById('voice-select')?.value || 'default';
                const speed = parseFloat(document.getElementById('speech-speed')?.value || '1');
                const pitch = parseFloat(document.getElementById('speech-pitch')?.value || '1');
                
                // Use TextToSpeech directly for speech
                TextToSpeech.speak(text, { voice, rate: speed, pitch });
                Utils.showToast('🔊 Reading text aloud with your settings...');
                return;
                
            case 'proofread':
                const fixGrammar = document.getElementById('fix-grammar')?.checked || true;
                const fixSpelling = document.getElementById('fix-spelling')?.checked || true;
                const improveStyle = document.getElementById('improve-style')?.checked || false;
                
                options.grammar = fixGrammar;
                options.spelling = fixSpelling;
                options.style = improveStyle;
                Utils.showToast('✏️ Proofreading your text...');
                break;
                
            case 'analyze':
                Utils.showToast('📊 Analyzing your text...');
                break;
                
            default:
                Utils.showToast(`⏳ Processing text with ${action} feature...`);
        }
        
        console.log('Processing with action:', action, 'and options:', options);
        console.log('Text length:', text.length);
        
        appState.currentText = text;
        appState.currentOptions = options; // Store options for use in processing
        
        // Process with the enhanced operation
        await TextProcessor.processWithOperation(action, options);
        
        Utils.showToast('✅ Processing completed successfully!');
        
    } catch (error) {
        console.error('Process feature with options error:', error);
        Utils.showToast(`❌ Failed: ${error.message}`, 'error');
    }
};

// Helper function to get language names
function getLanguageName(code) {
    const languages = {
        'auto': 'Auto-detect',
        'en': 'English',
        'es': 'Spanish', 
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese'
    };
    return languages[code] || code;
}

// Language swap function
window.swapLanguages = () => {
    const fromSelect = document.getElementById('translate-from');
    const toSelect = document.getElementById('translate-to');
    
    if (fromSelect && toSelect) {
        const fromValue = fromSelect.value;
        const toValue = toSelect.value;
        
        // Don't swap if from is auto-detect
        if (fromValue === 'auto') {
            Utils.showToast('Cannot swap when auto-detect is selected', 'error');
            return;
        }
        
        fromSelect.value = toValue;
        toSelect.value = fromValue;
        
        Utils.showToast('🔄 Languages swapped!');
    }
};

window.loadExampleText = () => {
    const exampleTexts = [
        "Utilize comprehensive methodologies to facilitate optimal implementation of sophisticated algorithms in order to demonstrate the efficacious application of contemporary technological paradigms.",
        "The implementation of sustainable environmental initiatives necessitates collaborative engagement from governmental entities, commercial enterprises, and individual stakeholders to ameliorate the deleterious effects of anthropogenic climate transformation.",
        "Contemporary pedagogical frameworks emphasize the importance of fostering critical thinking competencies and metacognitive awareness among students to facilitate autonomous learning trajectories.",
        "The proliferation of digital communication technologies has fundamentally transformed interpersonal relationships and societal discourse, engendering both opportunities for global connectivity and challenges regarding information veracity."
    ];
    
    const randomExample = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
    const textInput = document.getElementById('text-input-field');
    
    if (textInput) {
        textInput.value = randomExample;
        appState.currentText = randomExample;
        textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a subtle highlight animation
        textInput.style.transition = 'all 0.3s ease';
        textInput.style.background = 'var(--primary-50)';
        setTimeout(() => {
            textInput.style.background = '';
        }, 1000);
        
        Utils.showToast('✨ Example text loaded! Now click a feature button below to try it out.');
    }
};

window.simplifyAll = async () => {
    try {
        const textInput = document.getElementById('text-input-field');
        
        if (!textInput) {
            console.error('Text input field not found!');
            Utils.showToast('Error: Text input not found. Please refresh the page.', 'error');
            return;
        }
        
        // Check if there's already text in the input
        let text = textInput.value.trim();
        
        if (!text) {
            // Load example text first
            const exampleTexts = [
                "Utilize comprehensive methodologies to facilitate optimal implementation of sophisticated algorithms in order to demonstrate the efficacious application of contemporary technological paradigms.",
                "The implementation of sustainable environmental initiatives necessitates collaborative engagement from governmental entities, commercial enterprises, and individual stakeholders to ameliorate the deleterious effects of anthropogenic climate transformation.",
                "Contemporary pedagogical frameworks emphasize the importance of fostering critical thinking competencies and metacognitive awareness among students to facilitate autonomous learning trajectories.",
                "The proliferation of digital communication technologies has fundamentally transformed interpersonal relationships and societal discourse, engendering both opportunities for global connectivity and challenges regarding information veracity."
            ];
            
            const randomExample = exampleTexts[Math.floor(Math.random() * exampleTexts.length)];
            textInput.value = randomExample;
            text = randomExample;
            
            // Scroll to input field
            textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a subtle highlight animation
            textInput.style.transition = 'all 0.3s ease';
            textInput.style.background = 'var(--primary-50)';
            setTimeout(() => {
                textInput.style.background = '';
            }, 1000);
            
            Utils.showToast('📝 Example text loaded! Now simplifying...');
            
            // Wait a moment for the user to see the loaded text
            await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
            Utils.showToast('🚀 Simplifying your text...');
        }
        
        // Set the current text in app state
        appState.currentText = text;
        
        // Automatically trigger simplification
        await TextProcessor.processWithOperation('simplify');
        
        Utils.showToast('✅ Text simplified successfully! Check the results below.');
        
    } catch (error) {
        console.error('Simplify All error:', error);
        Utils.showToast(`❌ Failed to simplify: ${error.message}`, 'error');
    }
};

// Export for global access (if needed)
window.AccessibleTextReader = {
    TextProcessor,
    InputHandler,
    SettingsManager,
    TextToSpeech,
    Utils,
    appState
};

// Update range value displays
document.addEventListener('DOMContentLoaded', () => {
    // Speed control
    const speedRange = document.getElementById('speech-speed');
    const speedValue = document.getElementById('speed-value');
    if (speedRange && speedValue) {
        speedRange.addEventListener('input', (e) => {
            speedValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });
    }
    
    // Pitch control
    const pitchRange = document.getElementById('speech-pitch');
    const pitchValue = document.getElementById('pitch-value');
    if (pitchRange && pitchValue) {
        pitchRange.addEventListener('input', (e) => {
            pitchValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });
    }
});