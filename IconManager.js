export class IconManager {
  static async setIcon(imageData) {
    try {
      await chrome.action.setIcon({ imageData });
    } catch (error) {
      console.error('Failed to set extension icon:', error);
    }
  }

  static async resetToDefault() {
    try {
      await chrome.action.setIcon({
        path: {
          "16": "icon16.png",
          "32": "icon32.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      });
    } catch (error) {
      console.error('Failed to reset extension icon:', error);
    }
  }
}