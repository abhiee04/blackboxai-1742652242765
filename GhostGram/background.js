// Background Service Worker for GhostGram

// Constants for tracking endpoints that should be blocked in Ghost Mode
const TRACKING_ENDPOINTS = [
  '*://*.instagram.com/api/v1/stories/reel/seen*',
  '*://*.instagram.com/api/v1/direct_v2/threads/*/items/*/seen*',
  '*://*.instagram.com/api/v1/users/*/story_viewers*'
];

// Store for Ghost Mode state
let ghostModeEnabled = false;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings
  await chrome.storage.local.set({
    ghostMode: false,
    theme: 'default',
    customFont: 'system',
    customEmojis: 'native'
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.type) {
      case 'DOWNLOAD_MEDIA':
        handleMediaDownload(request.data);
        break;
      case 'CAPTURE_VIEW_ONCE':
        handleViewOnceCapture(request.data);
        break;
      case 'EXTRACT_AUDIO':
        handleAudioExtraction(request.data);
        break;
      case 'TOGGLE_GHOST_MODE':
        handleGhostModeToggle(request.enabled);
        break;
    }
    sendResponse({ success: true });
  } catch (error) {
    console.error('Background worker error:', error);
    sendResponse({ success: false, error: error.message });
  }
});

// Media download handler
async function handleMediaDownload({ url, filename, mediaType }) {
  try {
    if (!url) throw new Error('Invalid media URL');
    
    await chrome.downloads.download({
      url: url,
      filename: `Instagram/${mediaType}/${filename}`,
      saveAs: false
    });
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// View-once media capture handler
async function handleViewOnceCapture({ blobUrl, filename }) {
  try {
    // Capture the blob URL before Instagram deletes it
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    await chrome.downloads.download({
      url: objectUrl,
      filename: `Instagram/ViewOnce/${filename}`,
      saveAs: false
    });

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('View-once capture failed:', error);
    throw error;
  }
}

// Audio extraction handler
async function handleAudioExtraction({ videoUrl, filename }) {
  try {
    // Implementation for extracting audio from video
    // This would require additional processing to separate audio
    throw new Error('Audio extraction not implemented yet');
  } catch (error) {
    console.error('Audio extraction failed:', error);
    throw error;
  }
}

// Ghost Mode toggle handler
async function handleGhostModeToggle(enabled) {
  try {
    ghostModeEnabled = enabled;
    await chrome.storage.local.set({ ghostMode: enabled });
    
    if (enabled) {
      // Set up blocking rules for tracking endpoints
      await setupGhostMode();
    } else {
      // Remove blocking rules
      await disableGhostMode();
    }
  } catch (error) {
    console.error('Ghost mode toggle failed:', error);
    throw error;
  }
}

// Set up Ghost Mode blocking rules
async function setupGhostMode() {
  // Implementation for setting up request blocking
  // This would use declarativeNetRequest or webRequest API
}

// Disable Ghost Mode blocking rules
async function disableGhostMode() {
  // Implementation for removing request blocking
  // This would clean up rules set by setupGhostMode
}

// Network request interceptor for view-once content
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.type === 'media' && details.url.includes('view_once')) {
      // Store the URL for later capture
      // This needs to be implemented based on specific Instagram URL patterns
    }
    return { cancel: false };
  },
  { urls: ['*://*.instagram.com/*'] },
  ['blocking']
);