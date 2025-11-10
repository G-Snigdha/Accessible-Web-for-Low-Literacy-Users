// Mobile App JavaScript - Optimized for VS Code Simple Browser

class MobileTextReader {
    constructor() {
        this.currentScreen = 'home';
        this.currentFeature = null;
        this.settings = this.loadSettings();
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        
        this.init();
    }
    
    init() {
        console.log('📱 Mobile Text Reader initialized');
        this.applySettings();
        this.setupEventListeners();
    }
    
    loadSettings() {
        const defaultSettings = {
            fontSize: '16',
            speechRate: '0.8',
            autoRead: false
        };
        
        try {
            const saved = localStorage.getItem('mobileTextReaderSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return defaultSettings;
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('mobileTextReaderSettings', JSON.stringify(this.settings));
            console.log('Settings saved:', this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    applySettings() {
        // Apply font size
        document.body.className = `font-${this.settings.fontSize === '14' ? 'small' : 
            this.settings.fontSize === '18' ? 'large' : 
            this.settings.fontSize === '20' ? 'extra-large' : 'medium'}`;
        
        // Update form controls
        const fontSizeSelect = document.getElementById('fontSize');
        const speechRateSelect = document.getElementById('speechRate');
        const autoReadCheck = document.getElementById('autoRead');
        
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
        if (speechRateSelect) speechRateSelect.value = this.settings.speechRate;
        if (autoReadCheck) autoReadCheck.checked = this.settings.autoRead;
    }
    
    setupEventListeners() {
        // Handle form inputs
        document.addEventListener('change', (e) => {
            if (e.target.id === 'fontSize') this.updateFontSize();
            if (e.target.id === 'speechRate') this.updateSpeechRate();
            if (e.target.id === 'autoRead') this.updateAutoRead();
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.clearText();
                        break;
                    case 'v':
                        // Let default paste behavior work
                        break;
                    case 'c':
                        if (document.getSelection().toString()) {
                            // Let default copy behavior work
                        } else {
                            e.preventDefault();
                            this.copyResult();
                        }
                        break;
                }
            }
        });
    }
}

// Screen Management
function showScreen(screenName) {
    console.log(`📱 Switching to ${screenName} screen`);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const navBtn = document.getElementById(screenName + 'Btn');
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    app.currentScreen = screenName;
}

// Feature Selection
function selectFeature(feature) {
    console.log(`📱 Selected feature: ${feature}`);
    app.currentFeature = feature;
    
    const titles = {
        simplify: '✨ Simplify Text',
        rewrite: '📝 Rewrite Text',
        translate: '🌍 Translate Text',
        proofread: '✏️ Proofread Text',
        analyze: '📊 Analyze Text'
    };
    
    document.getElementById('readerTitle').textContent = titles[feature] || 'Text Processing';
    showScreen('reader');
    
    // Focus on text input
    document.getElementById('textInput').focus();
}

// Text Processing
async function processText(action) {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Please enter some text to process.');
        textInput.focus();
        return;
    }
    
    console.log(`📱 Processing text with action: ${action}`);
    
    // Show loading state
    const loadingElement = document.getElementById(`loading${action.charAt(0).toUpperCase() + action.slice(1)}`);
    const btnText = loadingElement?.nextElementSibling;
    
    if (loadingElement && btnText) {
        loadingElement.classList.remove('hidden');
        btnText.classList.add('hidden');
    }
    
    // Disable all action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    try {
        const response = await fetch('/api/text/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                action: action
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result.data, action);
            
            // Auto-read if enabled
            if (app.settings.autoRead && result.data.processed_text) {
                setTimeout(() => readAloud(), 500);
            }
        } else {
            throw new Error(result.error || 'Processing failed');
        }
        
    } catch (error) {
        console.error('Processing error:', error);
        alert(`Failed to process text: ${error.message}`);
    } finally {
        // Hide loading state
        if (loadingElement && btnText) {
            loadingElement.classList.add('hidden');
            btnText.classList.remove('hidden');
        }
        
        // Re-enable action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = false;
        });
    }
}

function displayResults(data, action) {
    const resultsSection = document.getElementById('resultsSection');
    const resultText = document.getElementById('resultText');
    const analysisResults = document.getElementById('analysisResults');
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Display processed text
    if (data.processed_text) {
        resultText.textContent = data.processed_text;
        resultText.classList.remove('hidden');
    }
    
    // Display analysis if available
    if (data.analysis) {
        let analysisHTML = '<h4>📊 Text Analysis:</h4>';
        
        if (data.analysis.word_count) {
            analysisHTML += `<p>📝 Words: ${data.analysis.word_count}</p>`;
        }
        
        if (data.analysis.sentence_count) {
            analysisHTML += `<p>📄 Sentences: ${data.analysis.sentence_count}</p>`;
        }
        
        if (data.analysis.reading_level) {
            analysisHTML += `<p>📈 Reading Level: Grade ${data.analysis.reading_level.grade} (${data.analysis.reading_level.level})</p>`;
        }
        
        if (data.analysis.complexity_score) {
            analysisHTML += `<p>🎯 Complexity Score: ${data.analysis.complexity_score}/10</p>`;
        }
        
        analysisResults.innerHTML = analysisHTML;
        analysisResults.classList.remove('hidden');
    } else {
        analysisResults.classList.add('hidden');
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    console.log('📱 Results displayed successfully');
}

// Text Input Functions
function clearText() {
    document.getElementById('textInput').value = '';
    document.getElementById('resultsSection').classList.add('hidden');
    stopReading();
    console.log('📱 Text cleared');
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('textInput').value = text;
        console.log('📱 Text pasted from clipboard');
    } catch (error) {
        console.error('Failed to paste text:', error);
        alert('Could not paste text. Please paste manually with Ctrl+V.');
    }
}

async function copyResult() {
    const resultText = document.getElementById('resultText').textContent;
    
    if (!resultText) {
        alert('No results to copy.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(resultText);
        
        // Show feedback
        const originalText = document.querySelector('.result-actions .result-btn:nth-child(2)').textContent;
        const btn = document.querySelector('.result-actions .result-btn:nth-child(2)');
        btn.textContent = '✅ Copied!';
        
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
        
        console.log('📱 Results copied to clipboard');
    } catch (error) {
        console.error('Failed to copy text:', error);
        alert('Could not copy text. Please copy manually.');
    }
}

// Speech Functions
function readAloud() {
    const resultText = document.getElementById('resultText').textContent;
    
    if (!resultText) {
        alert('No text to read aloud.');
        return;
    }
    
    stopReading(); // Stop any current speech
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(resultText);
        utterance.rate = parseFloat(app.settings.speechRate);
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            console.log('📱 Started reading results');
        };
        
        utterance.onend = () => {
            console.log('📱 Finished reading results');
            app.currentUtterance = null;
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            app.currentUtterance = null;
        };
        
        app.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in this browser.');
    }
}

function readOriginal() {
    const originalText = document.getElementById('textInput').value.trim();
    
    if (!originalText) {
        alert('No text to read aloud.');
        return;
    }
    
    stopReading(); // Stop any current speech
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(originalText);
        utterance.rate = parseFloat(app.settings.speechRate);
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            console.log('📱 Started reading original text');
        };
        
        utterance.onend = () => {
            console.log('📱 Finished reading original text');
            app.currentUtterance = null;
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            app.currentUtterance = null;
        };
        
        app.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in this browser.');
    }
}

function stopReading() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        app.currentUtterance = null;
        console.log('📱 Stopped all speech synthesis');
    }
}

// Settings Functions
function updateFontSize() {
    const fontSize = document.getElementById('fontSize').value;
    app.settings.fontSize = fontSize;
    app.saveSettings();
    app.applySettings();
    console.log(`📱 Font size updated to: ${fontSize}px`);
}

function updateSpeechRate() {
    const speechRate = document.getElementById('speechRate').value;
    app.settings.speechRate = speechRate;
    app.saveSettings();
    console.log(`📱 Speech rate updated to: ${speechRate}x`);
}

function updateAutoRead() {
    const autoRead = document.getElementById('autoRead').checked;
    app.settings.autoRead = autoRead;
    app.saveSettings();
    console.log(`📱 Auto-read ${autoRead ? 'enabled' : 'disabled'}`);
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
        localStorage.removeItem('mobileTextReaderSettings');
        app.settings = app.loadSettings();
        app.applySettings();
        console.log('📱 Settings reset to defaults');
        alert('Settings have been reset to their default values.');
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MobileTextReader();
    console.log('📱 Mobile Text Reader app loaded successfully');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopReading();
    }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
    stopReading();
});