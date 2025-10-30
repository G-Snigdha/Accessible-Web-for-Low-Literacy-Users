// Chrome AI API integration
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'simplifyText':
        chrome.runtime.sendMessage({
          target: "generative-content",
          prompt: `Simplify this text for better readability: ${message.text}`
        }).then(simplifiedResult => {
          sendResponse({ success: true, result: simplifiedResult });
        });
        break;

      case 'translateText':
        chrome.runtime.sendMessage({
          target: "generative-content",
          prompt: `Translate this text to ${message.targetLanguage}: ${message.text}`
        }).then(translatedResult => {
          sendResponse({ success: true, result: translatedResult });
        });
        break;

      case 'proofreadText':
        chrome.runtime.sendMessage({
          target: "generative-content",
          prompt: `Proofread this text and suggest improvements: ${message.text}`
        }).then(proofreadResult => {
          sendResponse({ success: true, result: proofreadResult });
        });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
      } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  });

// Handle extension installation/update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension settings
  chrome.storage.local.set({
    defaultLanguage: 'en',
    autoSimplify: false,
    readAloudEnabled: true
  });
});