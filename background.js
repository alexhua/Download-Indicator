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
      controller.start('complete');
      currentDownloadId = null;
    } else if (delta.error?.current) {
      controller.start('error');
      currentDownloadId = null;
    }
  }
});