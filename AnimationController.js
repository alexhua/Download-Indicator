import { DownloadAnimation, CompleteAnimation, ErrorAnimation, ProgressAnimation } from './Animation.js';
import { FRAME_INTERVAL, FADE_INTERVAL } from './Constants.js';
import { IconManager } from './IconManager.js';
import { TransitionManager } from './TransitionManager.js';

export class AnimationController {
  constructor() {
    this.transitionManager = new TransitionManager();
    this.intervalId = null;
    this.timeoutId = null;
    this.fadeIntervalId = null;
    this.progressAnimation = null;
  }

  start(type, progress) {
    let newAnimation = null;
    switch (type) {
      case 'download':
        newAnimation = new DownloadAnimation();
        break;
      case 'complete':
        newAnimation = new CompleteAnimation();
        break;
      case 'error':
        newAnimation = new ErrorAnimation();
        break;
      case 'progress':
        if (progress < 0 || progress > 1) {
          console.error("AnimationController: Invalid progress value.")
          return;
        }
        if (!this.progressAnimation) {
          this.progressAnimation = new ProgressAnimation();
        }
        newAnimation = this.progressAnimation;
        this.progressAnimation.setProgress(progress);
        break;
      default:
        throw new Error(`AnimationController: Invalid animation type: ${type}`);
    }

    const currentAnimation = this.transitionManager.isTransitioning ?
      this.transitionManager.nextAnimation : this.transitionManager.currentAnimation;

    if (currentAnimation?.constructor !== newAnimation.constructor) {
      this.transitionManager.startTransition(currentAnimation, newAnimation);
    } else if (!this.transitionManager.isTransitioning) {
      this.transitionManager.currentAnimation = newAnimation;
    }

    // Stop existing fadeout
    if (this.fadeIntervalId) {
      clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    // Start animation loop
    if (!this.intervalId) {
      this.#startAnimationLoop();
    }

    // Clear any existing timeout auto-stop
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout for auto-stop
    this.timeoutId = setTimeout(() => {
      this.#stop(type);
    }, newAnimation.duration);
  }

  #startAnimationLoop() {
    this.intervalId = setInterval(async () => {
      const currentTime = performance.now();
      const imageData = this.transitionManager.requestFrame(currentTime);
      if (imageData) {
        await IconManager.setIcon(imageData);
      }
    }, FRAME_INTERVAL);
  }

  async #stop(type) {
    // Clear the auto-stop timeout if it exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.transitionManager.currentAnimation) {
      let progress = 0;
      this.fadeIntervalId = setInterval(async () => {
        progress += 0.1;
        const imageData = this.transitionManager.currentAnimation.draw(1 - progress);
        await IconManager.setIcon(imageData);

        if (progress >= 1) {
          clearInterval(this.fadeIntervalId);
          this.fadeIntervalId = null;
          this.transitionManager.currentAnimation = null;
          await IconManager.resetToDefault();
        }
      }, FADE_INTERVAL);
    } else {
      await IconManager.resetToDefault();
    }
  }
}
