// Create and manage the overlay element
let overlay = null;

function createOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'ai-assistant-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

function showOverlay(content) {
  const overlay = createOverlay();
  overlay.innerHTML = `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">AI Assistant Result</h3>
        <button class="close-btn text-gray-500 hover:text-gray-700">×</button>
      </div>
      <div class="result-content mb-4">${content}</div>
      <div class="flex gap-2">
        <button class="apply-btn btn-primary">Apply Changes</button>
        <button class="close-btn btn-secondary">Cancel</button>
      </div>
    </div>
  `;

  // Add event listeners
  overlay.querySelector('.close-btn').addEventListener('click', () => {
    overlay.remove();
    overlay = null;
  });

  overlay.querySelector('.apply-btn').addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(content));
    }
    overlay.remove();
    overlay = null;
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'showResult':
      showOverlay(message.result);
      break;

    case 'readAloud':
      // Create a new SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(message.text);
      // Use default system voice
      speechSynthesis.speak(utterance);
      break;
  }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Shift + ...
  if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
    const selection = window.getSelection().toString();
    if (!selection) return;

    switch (e.key.toLowerCase()) {
      case 's': // Simplify
        chrome.runtime.sendMessage({ action: 'simplifyText', text: selection });
        break;
      case 't': // Translate
        chrome.runtime.sendMessage({ action: 'translateText', text: selection });
        break;
      case 'p': // Proofread
        chrome.runtime.sendMessage({ action: 'proofreadText', text: selection });
        break;
      case 'r': // Read aloud
        chrome.runtime.sendMessage({ action: 'readAloud', text: selection });
        break;
    }
  }
});