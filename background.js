import { AnimationController } from './AnimationController.js';

const controller = new AnimationController();
let currentDownloadId = null;

chrome.downloads.onCreated.addListener((downloadItem) => {
  currentDownloadId = downloadItem.id;
  controller.start('download');
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.id === currentDownloadId) {
    if (delta.state?.current === 'complete') {
      currentDownloadId = null;
    } else if (delta.error?.current) {
      controller.start('error');
      currentDownloadId = null;
    } else {
      // simulate download progress
      let progress = 1;
      const id = setInterval(() => {
        controller.start('progress', progress / 100);
        progress += 10;
        if (progress >= 100) {
          controller.start('complete');
          clearInterval(id);
        }
      }, 1000);
    }
  }
});