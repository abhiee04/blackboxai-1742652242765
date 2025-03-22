// Content Script for GhostGram

// Store for DOM selectors and settings
let domSelectors = {};
let settings = {};

// Initialize the extension
async function initialize() {
  try {
    // Load DOM mappings
    const response = await fetch(chrome.runtime.getURL('domMappings.json'));
    domSelectors = await response.json();
    
    // Set up observers and inject initial UI elements
    setupMutationObserver();
    injectSettingsButton();
    
    // Load user settings
    await loadSettings();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

// Load user settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(null);
    settings = {
      ghostMode: result.ghostMode || false,
      theme: result.theme || 'default',
      customFont: result.customFont || 'system',
      customEmojis: result.customEmojis || 'native'
    };
    applySettings();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Apply current settings to the page
function applySettings() {
  applyTheme(settings.theme);
  applyFont(settings.customFont);
  applyEmojis(settings.customEmojis);
}

// Set up MutationObserver to watch for new content
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processNewElement(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Process newly added elements
function processNewElement(element) {
  // Check for media elements
  if (isMediaElement(element)) {
    injectDownloadButton(element);
  }
  
  // Check for story elements
  if (isStoryElement(element)) {
    injectStoryDownloadButton(element);
  }
  
  // Check for reel elements
  if (isReelElement(element)) {
    injectReelControls(element);
  }
}

// Inject the settings button into Instagram's header
function injectSettingsButton() {
  const header = document.querySelector(domSelectors.navHeader);
  if (!header) return;

  const settingsButton = createSettingsButton();
  header.appendChild(settingsButton);
}

// Create the settings button element
function createSettingsButton() {
  const button = document.createElement('button');
  button.className = 'ghostgram-settings-btn';
  button.innerHTML = '🎨'; // Replace with proper icon
  button.addEventListener('click', showSettingsPanel);
  return button;
}

// Show the settings panel
function showSettingsPanel() {
  const panel = createSettingsPanel();
  document.body.appendChild(panel);
}

// Create the settings panel element
function createSettingsPanel() {
  const panel = document.createElement('div');
  panel.className = 'ghostgram-settings-panel';
  panel.innerHTML = `
    <div class="ghostgram-settings-content">
      <h2>GhostGram Settings</h2>
      
      <div class="setting-group">
        <label>
          <input type="checkbox" ${settings.ghostMode ? 'checked' : ''}
                 onchange="handleGhostModeToggle(this.checked)">
          Ghost Mode
        </label>
      </div>
      
      <div class="setting-group">
        <label>Theme</label>
        <select onchange="handleThemeChange(this.value)">
          <option value="default" ${settings.theme === 'default' ? 'selected' : ''}>Default</option>
          <option value="ios" ${settings.theme === 'ios' ? 'selected' : ''}>iOS</option>
          <option value="android" ${settings.theme === 'android' ? 'selected' : ''}>Android</option>
          <option value="windows" ${settings.theme === 'windows' ? 'selected' : ''}>Windows</option>
        </select>
      </div>
      
      <div class="setting-group">
        <label>Custom Font</label>
        <select onchange="handleFontChange(this.value)">
          <option value="system" ${settings.customFont === 'system' ? 'selected' : ''}>System</option>
          <option value="ios" ${settings.customFont === 'ios' ? 'selected' : ''}>iOS</option>
          <option value="android" ${settings.customFont === 'android' ? 'selected' : ''}>Android</option>
        </select>
      </div>
      
      <div class="setting-group">
        <label>Custom Emojis</label>
        <select onchange="handleEmojiChange(this.value)">
          <option value="native" ${settings.customEmojis === 'native' ? 'selected' : ''}>Native</option>
          <option value="ios" ${settings.customEmojis === 'ios' ? 'selected' : ''}>iOS</option>
          <option value="whatsapp" ${settings.customEmojis === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
        </select>
      </div>
      
      <div class="warning-banner">
        ⚠️ This extension violates Instagram's Terms of Service. Use at your own risk.
      </div>
    </div>
  `;
  return panel;
}

// Inject download button for media elements
function injectDownloadButton(element) {
  const button = document.createElement('button');
  button.className = 'ghostgram-download-btn';
  button.innerHTML = '⬇️'; // Replace with proper icon
  button.addEventListener('click', () => handleDownload(element));
  element.appendChild(button);
}

// Handle media download
async function handleDownload(element) {
  try {
    const mediaUrl = extractMediaUrl(element);
    if (!mediaUrl) throw new Error('Could not extract media URL');

    const isPrivate = checkIfPrivateAccount(element);
    if (isPrivate) throw new Error('Cannot download from private accounts');

    await chrome.runtime.sendMessage({
      type: 'DOWNLOAD_MEDIA',
      data: {
        url: mediaUrl,
        filename: generateFilename(element),
        mediaType: determineMediaType(element)
      }
    });
  } catch (error) {
    console.error('Download failed:', error);
    showError(error.message);
  }
}

// Utility functions
function isMediaElement(element) {
  return element.matches(domSelectors.posts) ||
         element.matches(domSelectors.reels) ||
         element.matches(domSelectors.highlights);
}

function isStoryElement(element) {
  return element.matches(domSelectors.stories);
}

function isReelElement(element) {
  return element.matches(domSelectors.reels);
}

function extractMediaUrl(element) {
  // Implementation to extract media URL from element
  // This needs to be customized based on Instagram's current DOM structure
}

function checkIfPrivateAccount(element) {
  // Implementation to check if content is from a private account
  // This needs to be customized based on Instagram's current DOM structure
}

function generateFilename(element) {
  // Implementation to generate meaningful filename
  // This needs to be customized based on Instagram's current DOM structure
}

function determineMediaType(element) {
  // Implementation to determine if it's a photo, video, story, etc.
  // This needs to be customized based on Instagram's current DOM structure
}

// Error handling
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ghostgram-error';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}