// GhostGram Options Handler

class GhostGramOptions {
  constructor() {
    this.settings = {
      ghostMode: false,
      theme: 'default',
      customFont: 'system',
      customEmojis: 'native',
      adBlocking: true,
      audioExtraction: true
    };
    
    this.themes = {
      default: {
        primary: '#0095f6',
        background: '#ffffff',
        text: '#262626'
      },
      ios: {
        primary: '#007AFF',
        background: '#F2F2F7',
        text: '#000000'
      },
      android: {
        primary: '#1A73E8',
        background: '#FFFFFF',
        text: '#202124'
      },
      windows: {
        primary: '#0078D4',
        background: '#FFFFFF',
        text: '#323130'
      }
    };
    
    this.fonts = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      ios: '-apple-system, BlinkMacSystemFont, "SF Pro Text"',
      android: 'Roboto, "Helvetica Neue", sans-serif'
    };
  }

  // Initialize options
  async init() {
    try {
      await this.loadSettings();
      this.applySettings();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize options:', error);
    }
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const stored = await chrome.storage.local.get(null);
      this.settings = {
        ...this.settings,
        ...stored
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw error;
    }
  }

  // Save settings to storage
  async saveSettings() {
    try {
      await chrome.storage.local.set(this.settings);
      this.applySettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  // Apply current settings to the page
  applySettings() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    this.applyThemeColors(this.settings.theme);

    // Apply font
    if (this.settings.customFont !== 'system') {
      this.applyCustomFont(this.settings.customFont);
    }

    // Apply emoji style
    if (this.settings.customEmojis !== 'native') {
      this.applyCustomEmojis(this.settings.customEmojis);
    }

    // Update Ghost Mode
    this.updateGhostMode(this.settings.ghostMode);

    // Notify background script of settings change
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      settings: this.settings
    });
  }

  // Apply theme colors
  applyThemeColors(themeName) {
    const theme = this.themes[themeName] || this.themes.default;
    const root = document.documentElement;

    root.style.setProperty('--ghostgram-primary', theme.primary);
    root.style.setProperty('--ghostgram-background', theme.background);
    root.style.setProperty('--ghostgram-text', theme.text);
  }

  // Apply custom font
  applyCustomFont(fontName) {
    const fontFamily = this.fonts[fontName];
    if (fontFamily) {
      document.documentElement.style.setProperty('--ghostgram-font-family', fontFamily);
    }
  }

  // Apply custom emojis
  applyCustomEmojis(emojiStyle) {
    // Implementation depends on the emoji library being used
    // This could involve loading a custom emoji font or image sprites
  }

  // Update Ghost Mode
  async updateGhostMode(enabled) {
    try {
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_GHOST_MODE',
        enabled: enabled
      });
      
      this.settings.ghostMode = enabled;
      await this.saveSettings();
    } catch (error) {
      console.error('Failed to update Ghost Mode:', error);
      throw error;
    }
  }

  // Set up event listeners for settings changes
  setupEventListeners() {
    // Ghost Mode toggle
    document.getElementById('ghostMode')?.addEventListener('change', async (e) => {
      await this.updateGhostMode(e.target.checked);
    });

    // Theme selection
    document.getElementById('theme')?.addEventListener('change', async (e) => {
      this.settings.theme = e.target.value;
      await this.saveSettings();
    });

    // Font selection
    document.getElementById('customFont')?.addEventListener('change', async (e) => {
      this.settings.customFont = e.target.value;
      await this.saveSettings();
    });

    // Emoji style selection
    document.getElementById('customEmojis')?.addEventListener('change', async (e) => {
      this.settings.customEmojis = e.target.value;
      await this.saveSettings();
    });

    // Ad blocking toggle
    document.getElementById('adBlocking')?.addEventListener('change', async (e) => {
      this.settings.adBlocking = e.target.checked;
      await this.saveSettings();
    });

    // Audio extraction toggle
    document.getElementById('audioExtraction')?.addEventListener('change', async (e) => {
      this.settings.audioExtraction = e.target.checked;
      await this.saveSettings();
    });
  }

  // Create settings panel HTML
  createSettingsPanel() {
    return `
      <div class="ghostgram-settings-panel">
        <div class="ghostgram-settings-content">
          <h2>GhostGram Settings</h2>
          
          <div class="setting-group">
            <label for="ghostMode">
              <input type="checkbox" id="ghostMode" 
                     ${this.settings.ghostMode ? 'checked' : ''}>
              Ghost Mode
            </label>
            <small>Browse stories and messages anonymously</small>
          </div>
          
          <div class="setting-group">
            <label for="theme">Theme</label>
            <select id="theme">
              ${Object.keys(this.themes).map(theme => `
                <option value="${theme}" 
                        ${this.settings.theme === theme ? 'selected' : ''}>
                  ${theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              `).join('')}
            </select>
          </div>
          
          <div class="setting-group">
            <label for="customFont">Font Style</label>
            <select id="customFont">
              ${Object.keys(this.fonts).map(font => `
                <option value="${font}"
                        ${this.settings.customFont === font ? 'selected' : ''}>
                  ${font.charAt(0).toUpperCase() + font.slice(1)}
                </option>
              `).join('')}
            </select>
          </div>
          
          <div class="setting-group">
            <label for="customEmojis">Emoji Style</label>
            <select id="customEmojis">
              <option value="native" ${this.settings.customEmojis === 'native' ? 'selected' : ''}>Native</option>
              <option value="ios" ${this.settings.customEmojis === 'ios' ? 'selected' : ''}>iOS</option>
              <option value="whatsapp" ${this.settings.customEmojis === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="adBlocking">
              <input type="checkbox" id="adBlocking"
                     ${this.settings.adBlocking ? 'checked' : ''}>
              Block Ads
            </label>
            <small>Remove sponsored posts and advertisements</small>
          </div>
          
          <div class="setting-group">
            <label for="audioExtraction">
              <input type="checkbox" id="audioExtraction"
                     ${this.settings.audioExtraction ? 'checked' : ''}>
              Audio Extraction
            </label>
            <small>Enable audio extraction from Reels</small>
          </div>
          
          <div class="warning-banner">
            ⚠️ This extension violates Instagram's Terms of Service. Use at your own risk.
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize options when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ghostgramOptions = new GhostGramOptions();
    window.ghostgramOptions.init();
  });
} else {
  window.ghostgramOptions = new GhostGramOptions();
  window.ghostgramOptions.init();
}