import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Popup for Chrome Built-in AI Challenge 2025
 * Showcases all 6 Chrome Built-in AI APIs:
 * - Prompt API (with multimodal support)
 * - Summarizer API
 * - Writer API
 * - Rewriter API
 * - Translator API
 * - Proofreader API (via Prompt API)
 */
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { chromeAI } from './services/chromeAI';
import '../../src-shared/styles/base.css';
import './styles/extension.css';
const PopupAI = () => {
    const [state, setState] = useState({
        activeFeature: 'prompt',
        inputText: '',
        outputText: '',
        isProcessing: false,
        aiAvailability: null,
        promptSystemPrompt: 'You are a helpful AI assistant.',
        promptTemperature: 0.7,
        summaryType: 'tl;dr',
        summaryLength: 'short',
        writerTone: 'neutral',
        writerLength: 'medium',
        rewriterTone: 'as-is',
        rewriterLength: 'as-is',
        sourceLang: 'en',
        targetLang: '', // Start with no target language selected
        correctGrammar: true,
        correctSpelling: true,
        improvePunctuation: true
    });
    const fileInputRef = useRef(null);
    useEffect(() => {
        checkAIAvailability();
        loadSavedState();
    }, []);
    const checkAIAvailability = async () => {
        const availability = await chromeAI.checkAvailability();
        setState(prev => ({ ...prev, aiAvailability: availability }));
        if (!availability.isAnyAvailable) {
            setState(prev => ({
                ...prev,
                outputText: '⚠️ Chrome Built-in AI APIs are not available.\n\n' +
                    'Please ensure you:\n' +
                    '1. Use Chrome Dev or Canary (v127+)\n' +
                    '2. Enable chrome://flags/#optimization-guide-on-device-model\n' +
                    '3. Enable chrome://flags/#prompt-api-for-gemini-nano\n' +
                    '4. Sign up for Early Preview Program'
            }));
        }
    };
    const loadSavedState = () => {
        chrome.storage.local.get(['lastInputText', 'lastOutputText'], (result) => {
            if (result.lastInputText) {
                setState(prev => ({ ...prev, inputText: result.lastInputText }));
            }
            if (result.lastOutputText) {
                setState(prev => ({ ...prev, outputText: result.lastOutputText }));
            }
        });
    };
    const saveState = (input, output) => {
        chrome.storage.local.set({
            lastInputText: input,
            lastOutputText: output
        });
    };
    const processWithAI = async () => {
        if (!state.inputText.trim()) {
            alert('Please enter some text to process');
            return;
        }
        setState(prev => ({ ...prev, isProcessing: true, outputText: 'Processing...' }));
        try {
            let result;
            switch (state.activeFeature) {
                case 'prompt':
                    result = await chromeAI.prompt(state.inputText, {
                        systemPrompt: state.promptSystemPrompt,
                        temperature: state.promptTemperature
                    });
                    break;
                case 'summarize':
                    result = await chromeAI.summarize(state.inputText, {
                        type: state.summaryType,
                        length: state.summaryLength,
                        format: 'plain-text'
                    });
                    break;
                case 'write':
                    result = await chromeAI.write(state.inputText, {
                        tone: state.writerTone,
                        length: state.writerLength,
                        format: 'plain-text'
                    });
                    break;
                case 'rewrite':
                    result = await chromeAI.rewrite(state.inputText, {
                        tone: state.rewriterTone,
                        length: state.rewriterLength
                    });
                    break;
                case 'translate':
                    // Validate language selection
                    if (!state.targetLang) {
                        setState(prev => ({
                            ...prev,
                            outputText: '⚠️ Please select a target language first!',
                            isProcessing: false
                        }));
                        return;
                    }
                    if (state.sourceLang === state.targetLang) {
                        setState(prev => ({
                            ...prev,
                            outputText: '⚠️ Source and target languages must be different!',
                            isProcessing: false
                        }));
                        return;
                    }
                    result = await chromeAI.translate(state.inputText, {
                        sourceLanguage: state.sourceLang,
                        targetLanguage: state.targetLang
                    });
                    break;
                case 'proofread':
                    const proofResult = await chromeAI.proofread(state.inputText, {
                        correctGrammar: state.correctGrammar,
                        correctSpelling: state.correctSpelling,
                        improvePunctuation: state.improvePunctuation
                    });
                    if (proofResult.success && proofResult.data) {
                        const { correctedText, corrections } = proofResult.data;
                        const correctionsList = corrections && corrections.length > 0
                            ? '\n\n📝 Corrections made:\n' + corrections.map(c => `• "${c.original}" → "${c.corrected}" (${c.reason})`).join('\n')
                            : '\n\n✅ No corrections needed! Your text looks great.';
                        setState(prev => ({
                            ...prev,
                            outputText: correctedText + correctionsList,
                            isProcessing: false
                        }));
                        saveState(state.inputText, correctedText);
                        return;
                    }
                    else {
                        // If proofreader fails, show helpful error
                        setState(prev => ({
                            ...prev,
                            outputText: `❌ Proofreader Error: ${proofResult.error || 'Unknown error'}\n\n💡 Note: Proofreader uses Prompt API. Make sure Prompt API is available (check the 🟢 indicator). If Prompt works but Proofreader doesn't, the AI might be having trouble with the response format. Try shorter text or simpler sentences.`,
                            isProcessing: false
                        }));
                        return;
                    }
                    break;
            }
            if (result.success && result.data) {
                const outputData = typeof result.data === 'string' ? result.data : 'No output generated';
                setState(prev => ({
                    ...prev,
                    outputText: outputData,
                    isProcessing: false
                }));
                saveState(state.inputText, outputData);
            }
            else {
                setState(prev => ({
                    ...prev,
                    outputText: `❌ Error: ${result.error || 'Unknown error occurred'}`,
                    isProcessing: false
                }));
            }
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                outputText: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false
            }));
        }
    };
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                setState(prev => ({ ...prev, inputText: text }));
            };
            reader.readAsText(file);
        }
        else if (file.type.startsWith('image/')) {
            // For future: multimodal Prompt API support
            alert('Image input support coming soon with multimodal Prompt API!');
        }
        else {
            alert('Please upload a text file or image');
        }
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText(state.outputText);
        // Show brief notification
        const btn = document.getElementById('copy-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1500);
        }
    };
    const getAvailabilityBadge = (api) => {
        if (!state.aiAvailability)
            return null;
        const status = state.aiAvailability[api];
        if (typeof status !== 'string')
            return null;
        const colors = {
            'readily': '🟢',
            'after-download': '🟡',
            'no': '🔴',
            'not-supported': '⚫'
        };
        return _jsx("span", { title: status, children: colors[status] });
    };
    const exampleTexts = {
        prompt: 'Write a creative story about a robot learning to paint.',
        summarize: 'Artificial intelligence is transforming the way we interact with technology. From voice assistants to recommendation systems, AI is becoming increasingly integrated into our daily lives. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions. Deep learning, a subset of machine learning, uses neural networks to model complex relationships in data. As AI continues to advance, it raises important questions about ethics, privacy, and the future of work. Companies are investing billions in AI research, and governments are developing policies to regulate its use. The potential applications of AI are vast, ranging from healthcare diagnostics to autonomous vehicles, and from climate modeling to personalized education.',
        write: 'Write a professional email requesting a meeting with a potential client',
        rewrite: 'The thing is, like, we really gotta meet up soon to talk about the project stuff, you know?',
        translate: 'Hello, how are you today? I hope you are having a wonderful day!',
        proofread: 'Me and my frend went to the stor yesterday. We buyed some apples and orangs. Its was a nice day out their.'
    };
    const loadExample = () => {
        setState(prev => ({
            ...prev,
            inputText: exampleTexts[state.activeFeature]
        }));
    };
    return (_jsxs("div", { className: "extension-popup ai-popup", style: { width: '500px', maxHeight: '600px', overflowY: 'auto' }, children: [_jsxs("header", { style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '16px', marginBottom: '16px' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '18px', fontWeight: 600 }, children: "\uD83E\uDDE0 Chrome Built-in AI Challenge 2025" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }, children: "Powered by Gemini Nano \u2022 100% Client-Side \u2022 Privacy-First" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px', overflowX: 'auto' }, children: [_jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'prompt' })), className: state.activeFeature === 'prompt' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'prompt' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'prompt' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\uD83D\uDCAD Prompt ", getAvailabilityBadge('promptAPI')] }), _jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'summarize' })), className: state.activeFeature === 'summarize' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'summarize' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'summarize' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\uD83D\uDCC4 Summarize ", getAvailabilityBadge('summarizerAPI')] }), _jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'write' })), className: state.activeFeature === 'write' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'write' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'write' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\u270F\uFE0F Write ", getAvailabilityBadge('writerAPI')] }), _jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'rewrite' })), className: state.activeFeature === 'rewrite' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'rewrite' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'rewrite' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\uD83D\uDD8A\uFE0F Rewrite ", getAvailabilityBadge('rewriterAPI')] }), _jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'translate' })), className: state.activeFeature === 'translate' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'translate' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'translate' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\uD83C\uDF10 Translate ", getAvailabilityBadge('translatorAPI')] }), _jsxs("button", { onClick: () => setState(prev => ({ ...prev, activeFeature: 'proofread' })), className: state.activeFeature === 'proofread' ? 'active' : '', style: {
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.activeFeature === 'proofread' ? '#667eea' : '#f0f0f0',
                            color: state.activeFeature === 'proofread' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '13px',
                            whiteSpace: 'nowrap'
                        }, children: ["\uD83D\uDD24 Proofread ", getAvailabilityBadge('proofreaderAPI')] })] }), _jsxs("div", { style: { padding: '0 16px' }, children: [state.activeFeature === 'prompt' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "System Prompt:" }), _jsx("input", { type: "text", value: state.promptSystemPrompt, onChange: (e) => setState(prev => ({ ...prev, promptSystemPrompt: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' } }), _jsxs("label", { style: { display: 'block', fontSize: '12px', marginTop: '8px', marginBottom: '4px', fontWeight: 500 }, children: ["Temperature: ", state.promptTemperature] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: state.promptTemperature, onChange: (e) => setState(prev => ({ ...prev, promptTemperature: parseFloat(e.target.value) })), style: { width: '100%' } })] })), state.activeFeature === 'summarize' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Type:" }), _jsxs("select", { value: state.summaryType, onChange: (e) => setState(prev => ({ ...prev, summaryType: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "tl;dr", children: "TL;DR" }), _jsx("option", { value: "key-points", children: "Key Points" }), _jsx("option", { value: "teaser", children: "Teaser" }), _jsx("option", { value: "headline", children: "Headline" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Length:" }), _jsxs("select", { value: state.summaryLength, onChange: (e) => setState(prev => ({ ...prev, summaryLength: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "short", children: "Short" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "long", children: "Long" })] })] })] })), state.activeFeature === 'write' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Tone:" }), _jsxs("select", { value: state.writerTone, onChange: (e) => setState(prev => ({ ...prev, writerTone: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "formal", children: "Formal" }), _jsx("option", { value: "neutral", children: "Neutral" }), _jsx("option", { value: "casual", children: "Casual" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Length:" }), _jsxs("select", { value: state.writerLength, onChange: (e) => setState(prev => ({ ...prev, writerLength: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "short", children: "Short" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "long", children: "Long" })] })] })] })), state.activeFeature === 'rewrite' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Tone:" }), _jsxs("select", { value: state.rewriterTone, onChange: (e) => setState(prev => ({ ...prev, rewriterTone: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "as-is", children: "As-Is" }), _jsx("option", { value: "more-formal", children: "More Formal" }), _jsx("option", { value: "more-casual", children: "More Casual" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "Length:" }), _jsxs("select", { value: state.rewriterLength, onChange: (e) => setState(prev => ({ ...prev, rewriterLength: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "as-is", children: "As-Is" }), _jsx("option", { value: "shorter", children: "Shorter" }), _jsx("option", { value: "longer", children: "Longer" })] })] })] })), state.activeFeature === 'translate' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "From:" }), _jsxs("select", { value: state.sourceLang, onChange: (e) => setState(prev => ({ ...prev, sourceLang: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Spanish" }), _jsx("option", { value: "fr", children: "French" }), _jsx("option", { value: "de", children: "German" }), _jsx("option", { value: "it", children: "Italian" }), _jsx("option", { value: "pt", children: "Portuguese" }), _jsx("option", { value: "zh", children: "Chinese" }), _jsx("option", { value: "ja", children: "Japanese" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }, children: "To:" }), _jsxs("select", { value: state.targetLang, onChange: (e) => setState(prev => ({ ...prev, targetLang: e.target.value })), style: { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }, children: [_jsx("option", { value: "", children: "-- Select Language --" }), _jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Spanish" }), _jsx("option", { value: "fr", children: "French" }), _jsx("option", { value: "de", children: "German" }), _jsx("option", { value: "it", children: "Italian" }), _jsx("option", { value: "pt", children: "Portuguese" }), _jsx("option", { value: "zh", children: "Chinese" }), _jsx("option", { value: "ja", children: "Japanese" }), _jsx("option", { value: "ko", children: "Korean" }), _jsx("option", { value: "ar", children: "Arabic" }), _jsx("option", { value: "ru", children: "Russian" }), _jsx("option", { value: "hi", children: "Hindi" })] })] })] })), state.activeFeature === 'proofread' && (_jsxs("div", { style: { marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }, children: [_jsx("input", { type: "checkbox", checked: state.correctGrammar, onChange: (e) => setState(prev => ({ ...prev, correctGrammar: e.target.checked })) }), "Correct Grammar"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }, children: [_jsx("input", { type: "checkbox", checked: state.correctSpelling, onChange: (e) => setState(prev => ({ ...prev, correctSpelling: e.target.checked })) }), "Correct Spelling"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: state.improvePunctuation, onChange: (e) => setState(prev => ({ ...prev, improvePunctuation: e.target.checked })) }), "Improve Punctuation"] })] })), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '13px', fontWeight: 500 }, children: "Input:" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: loadExample, style: {
                                                    padding: '4px 8px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    background: 'white',
                                                    cursor: 'pointer'
                                                }, children: "\uD83D\uDCDD Load Example" }), _jsx("input", { ref: fileInputRef, type: "file", accept: "text/*,image/*", onChange: handleFileUpload, style: { display: 'none' } }), _jsx("button", { onClick: () => fileInputRef.current?.click(), style: {
                                                    padding: '4px 8px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    background: 'white',
                                                    cursor: 'pointer'
                                                }, children: "\uD83D\uDCCE Upload File" })] })] }), _jsx("textarea", { value: state.inputText, onChange: (e) => setState(prev => ({ ...prev, inputText: e.target.value })), placeholder: `Enter text for ${state.activeFeature}...`, style: {
                                    width: '100%',
                                    height: '100px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                } })] }), _jsx("button", { onClick: processWithAI, disabled: state.isProcessing || !state.inputText.trim(), style: {
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: state.isProcessing || !state.inputText.trim() ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: state.isProcessing || !state.inputText.trim() ? 'not-allowed' : 'pointer',
                            marginBottom: '12px'
                        }, children: state.isProcessing ? '⏳ Processing...' : `✨ ${state.activeFeature.charAt(0).toUpperCase() + state.activeFeature.slice(1)} with AI` }), state.outputText && (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '13px', fontWeight: 500 }, children: "Output:" }), _jsx("button", { id: "copy-btn", onClick: copyToClipboard, style: {
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "\uD83D\uDCCB Copy" })] }), _jsx("div", { style: {
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: '#f8f9fa',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '13px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }, children: state.outputText })] })), _jsxs("div", { style: {
                            padding: '12px',
                            background: '#f0f7ff',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#1e40af',
                            marginTop: '16px'
                        }, children: [_jsx("strong", { children: "\uD83D\uDD12 Privacy First:" }), " All AI processing happens locally on your device using Chrome's Built-in AI APIs. No data is sent to external servers. Works offline!"] })] })] }));
};
// Initialize popup
const container = document.getElementById('popup-root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(PopupAI, {}));
}
