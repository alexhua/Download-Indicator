import { Canvas } from "./Canvas.js";
import { FRAME_RATE, ANIMATION_DURATION } from "./Constants.js"

class BaseAnimation {
  constructor() {
    this.canvas = new Canvas();
    this.ctx = this.canvas.getContext();
    this.frameId = 0;
    this.totalFrames = FRAME_RATE;
    this.scaleFactor = this.canvas.getSize() / 16;
    this.duration = ANIMATION_DURATION;
  }

  setupContext() {
    this.canvas.clear();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  addShadow(color = 'rgba(0, 0, 0, 0.3)', blur = 1) {
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowOffsetX = 0.5;
    this.ctx.shadowOffsetY = 0.5;
  }

  createGradient(colorStops, x0, y0, x1, y1) {
    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
    colorStops.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    return gradient;
  }

  draw(alpha = 1) {
    this.setupContext();
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    this.render();
    this.ctx.globalAlpha = 1;
    this.frameId = (this.frameId + 1) % this.totalFrames;
    this.ctx.restore();
    return this.canvas.getImageData();
  }

  render() {
    throw new Error('render method must be implemented');
  }
}

export class DownloadAnimation extends BaseAnimation {
  constructor() {
    super();
    this.colors = [
      [0, '#4FC3F7'],    // Light blue
      [0.5, '#2196F3'],  // Medium blue
      [1, '#1976D2']     // Dark blue
    ];
  }

  render() {
    const progress = this.frameId / this.totalFrames;
    const bounceOffset = Math.sin(progress * Math.PI * 2) * 2 + 2;

    // Draw arrow shaft
    this.addShadow('rgba(33, 150, 243, 0.3)', 2);
    this.ctx.lineWidth = 2.5;

    const gradient = this.createGradient(this.colors, 8, 0, 8, 16);
    this.ctx.strokeStyle = gradient;

    this.ctx.beginPath();
    this.ctx.moveTo(8, bounceOffset);
    this.ctx.lineTo(8, bounceOffset + 12);
    this.ctx.moveTo(4, bounceOffset + 9);
    this.ctx.lineTo(8, bounceOffset + 12);
    this.ctx.lineTo(12, bounceOffset + 9);
    this.ctx.stroke();
  }
}

export class ErrorAnimation extends BaseAnimation {
  constructor() {
    super();
    this.colors = [
      [0, '#FF5252'],    // Light red
      [0.5, '#F44336'],  // Medium red
      [1, '#D32F2F']     // Dark red
    ];
  }

  render() {
    const progress = this.frameId / this.totalFrames;
    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.15;
    const alpha = 0.7 + Math.sin(progress * Math.PI * 2) * 0.3;

    this.ctx.save();
    this.ctx.translate(8, 8);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-8, -8);

    const gradient = this.createGradient(
      this.colors.map(([stop, color]) => [
        stop,
        color.replace(')', `, ${alpha})`)
      ]),
      4, 4, 12, 12
    );

    this.addShadow('rgba(255, 0, 0, 0.4)', 3);
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;

    // Draw X with curved lines
    this.ctx.beginPath();
    this.ctx.moveTo(4, 4);
    this.ctx.quadraticCurveTo(8, 8, 13, 13);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(13, 4);
    this.ctx.quadraticCurveTo(8, 8, 4, 13);
    this.ctx.stroke();

    this.ctx.restore();
  }
}

export class CompleteAnimation extends BaseAnimation {
  constructor() {
    super();
    this.colors = [
      [0, '#64DD17'],    // Light green
      [0.5, '#4CAF50'],  // Medium green
      [1, '#388E3C']     // Dark green
    ];
    // Checkmark path points
    this.pathPoints = [
      [2, 8],    // Start point
      [7, 14],   // Corner point
      [15, 4]    // End point
    ];
  }

  render() {
    const progress = this.frameId / this.totalFrames;

    // Calculate animation progress for drawing the checkmark
    const drawProgress = Math.min(1, progress * 1.5);

    // Add shadow effect
    this.addShadow('rgba(76, 175, 80, 0.3)', 2);
    this.ctx.lineWidth = 2.5;

    // Create gradient for stroke
    const gradient = this.createGradient(
      this.colors,
      this.pathPoints[0][0],
      this.pathPoints[0][1],
      this.pathPoints[2][0],
      this.pathPoints[2][1]
    );
    this.ctx.strokeStyle = gradient;

    // Draw animated checkmark
    this.ctx.beginPath();
    this.ctx.moveTo(this.pathPoints[0][0], this.pathPoints[0][1]);

    // First segment (down-right)
    if (drawProgress <= 0.5) {
      const t = drawProgress * 2;
      const x = this.pathPoints[0][0] + (this.pathPoints[1][0] - this.pathPoints[0][0]) * t;
      const y = this.pathPoints[0][1] + (this.pathPoints[1][1] - this.pathPoints[0][1]) * t;
      this.ctx.lineTo(x, y);
    } else {
      this.ctx.lineTo(this.pathPoints[1][0], this.pathPoints[1][1]);

      // Second segment (up-right)
      const t = (drawProgress - 0.5) * 2;
      const x = this.pathPoints[1][0] + (this.pathPoints[2][0] - this.pathPoints[1][0]) * t;
      const y = this.pathPoints[1][1] + (this.pathPoints[2][1] - this.pathPoints[1][1]) * t;
      this.ctx.lineTo(x, y);
    }

    this.ctx.stroke();
  }
}

export class ProgressAnimation extends BaseAnimation {
  constructor() {
    super();
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.animationSpeed = 0.02;
    this.ctx.lineWidth = 1.5;
    this.colors = [
      [0, '#4FC3F7'],    // Light blue
      [0.5, '#2196F3'],  // Medium blue
      [1, '#1976D2']     // Dark blue
    ];
  }

  setProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }

  #updateProgress() {
    if (this.currentProgress !== this.targetProgress) {
      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) < this.animationSpeed) {
        this.currentProgress = this.targetProgress;
      } else {
        this.currentProgress += diff > 0 ? this.animationSpeed : -this.animationSpeed;
      }
    }
  }

  #drawArrow() {
    const gradient = this.createGradient(this.colors, 8, 0, 8, 16);

    this.ctx.beginPath();

    // Arrow shaft
    this.ctx.moveTo(8, 4);
    this.ctx.lineTo(8, 12);

    // Arrow head
    this.ctx.lineTo(5, 9);
    this.ctx.moveTo(8, 12);
    this.ctx.lineTo(11, 9);

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = gradient;
    this.ctx.stroke();
  }

  #drawProgressCircle() {
    const centerX = 8;
    const centerY = 8;
    const radius = 7;

    // Background circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.2)';
    this.ctx.stroke();

    const gradient = this.ctx.createConicGradient(
      -Math.PI / 2,
      centerX,
      centerY
    );

    gradient.addColorStop(0, this.colors[0][1]);
    gradient.addColorStop(this.currentProgress, this.colors[2][1]);
    gradient.addColorStop(1, this.colors[0][1]);

    // Progress arc
    this.ctx.beginPath();
    this.ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + this.currentProgress * Math.PI * 2
    );
    this.ctx.strokeStyle = gradient;
    this.ctx.stroke();
  }

  render() {
    this.addShadow('rgba(33, 150, 243, 0.3)', 2);

    this.#updateProgress();
    this.ctx.clearRect(0, 0, 16, 16);

    this.#drawProgressCircle();
    this.#drawArrow();
  }
}

export class ProgressAnimation2 extends BaseAnimation {
  constructor() {
    super();
    this.colors = [
      [0, 'rgb(145, 195, 242)'],
      [0.5, 'rgb(129, 183, 250)'],
      [1, 'rgb(79, 138, 247)']
    ];
    this.waveAmplitude = 0.5;
    this.waveFrequency = 0.8;
    this.cornerRadius = 3;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.animationSpeed = 0.02;
    this.waveOffset = 0;
    this.waveSpeed = 0.2;

    // Matrix-style particle properties
    this.particles = [];
    this.shouldShowParticles = true;
    this.initParticles();
  }

  /**
   * Initialize Matrix-style digital particles
   */
  initParticles() {
    const columns = 8; // Number of vertical columns
    const particlesPerColumn = 3; // Number of particles per column

    for (let col = 0; col < columns; col++) {
      const x = (col + 0.5) * (16 / columns); // Distribute evenly across width

      for (let i = 0; i < particlesPerColumn; i++) {
        this.particles.push({
          x: x,
          y: -Math.random() * 20, // Start higher above canvas for staggered effect
          value: Math.round(Math.random()), // 0 or 1
          speed: 0.08 + Math.random() * 0.05, // Slower, more consistent speed
          alpha: 0.8 + Math.random() * 0.2, // Varying opacity
          size: 2.5 + Math.random(), // Varying size
          glowIntensity: Math.random() // Random glow effect intensity
        });
      }
    }
  }

  /**
   * Update and render Matrix-style particles
   */
  updateParticles() {
    const waterLevel = 16 * this.currentProgress;

    this.ctx.save();

    for (let particle of this.particles) {
      // Update particle position
      particle.y += particle.speed;

      // Matrix-style glow effect
      const glow = particle.glowIntensity * 0.3;
      this.ctx.shadowColor = 'rgba(104, 148, 224, 0.6)';
      this.ctx.shadowBlur = glow * 5;

      // Draw the particle with matrix-style effect
      this.ctx.font = `${particle.size}px Courier`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // When particles touch the water surface
      if (particle.y > 16 - waterLevel) {
        particle.alpha *= 0.95; // Fade out
        particle.speed *= 0.98; // Gradual slowdown
      }

      // Create trailing effect with multiple transparencies
      for (let i = 0; i < 3; i++) {
        const trailY = particle.y - i * 0.5;
        if (trailY > 0) {
          this.ctx.fillStyle = `rgba(144, 240, 156, ${particle.alpha * (1 - i * 0.3)})`;
          this.ctx.fillText(particle.value.toString(), particle.x, trailY);
        }
      }

      // Main particle
      this.ctx.fillStyle = `rgba(144, 240, 156, ${particle.alpha})`;
      this.ctx.fillText(particle.value.toString(), particle.x, particle.y);
    }

    this.ctx.restore();

    // Check if particles need to be reset
    const activeParticles = this.particles.filter(p => p.alpha > 0.01);
    if (activeParticles.length === 0 && this.currentProgress < 0.9) {
      this.initParticles();
    }

    // Clean up completely faded particles
    this.particles = this.particles.filter(p => p.alpha > 0.01);
  }

  setProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
    this.shouldShowParticles = this.targetProgress < 0.9;
  }

  #updateProgress() {
    if (this.currentProgress !== this.targetProgress) {
      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) < this.animationSpeed) {
        this.currentProgress = this.targetProgress;
      } else {
        this.currentProgress += diff > 0 ? this.animationSpeed : -this.animationSpeed;
      }
    }
    this.waveOffset = (this.waveOffset + this.waveSpeed) % (Math.PI * 2);
  }

  #drawProgressText(progress) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(8, 48, 168, 1)';
    this.ctx.font = 'bold 9px Sans';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const percentage = Math.round(progress * 100);
    this.ctx.fillText(`${percentage}`, 8, 8);
    this.ctx.restore();
  }

  #drawWater(waterHeight) {
    const gradient = this.createGradient(
      this.colors,
      8, 16 - waterHeight,
      8, 16
    );

    this.addShadow('rgba(41, 182, 246, 0.2)', 1.5);

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();

    // Draw rounded corners and bottom
    this.ctx.moveTo(0, 16 - this.cornerRadius);
    this.ctx.quadraticCurveTo(0, 16, this.cornerRadius, 16);
    this.ctx.lineTo(16 - this.cornerRadius, 16);
    this.ctx.quadraticCurveTo(16, 16, 16, 16 - this.cornerRadius);
    this.ctx.lineTo(16, 16 - waterHeight);

    // Draw wave effect
    for (let x = 16; x >= 0; x -= 0.5) {
      const y = 16 - waterHeight +
        Math.sin((x + this.waveOffset) * this.waveFrequency) * this.waveAmplitude +
        Math.sin((x - this.waveOffset * 0.5) * (this.waveFrequency * 0.5)) * (this.waveAmplitude * 0.5);
      this.ctx.lineTo(x, y);
    }

    this.ctx.closePath();
    this.ctx.fill();

    // Add water surface reflection effect
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= 16; x += 4) {
      const baseY = 16 - waterHeight;
      const y = baseY +
        Math.sin((x + this.waveOffset) * this.waveFrequency) * this.waveAmplitude +
        Math.sin((x - this.waveOffset * 0.5) * (this.waveFrequency * 0.5)) * (this.waveAmplitude * 0.5);
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + 2, y);
    }
    this.ctx.stroke();
  }

  render() {
    this.#updateProgress();
    const waterHeight = 16 * this.currentProgress;

    // Draw water
    this.#drawWater(waterHeight);

    // Update and draw particles only when progress is less than 0.3
    if (this.shouldShowParticles) {
      this.updateParticles();
    }

    // Draw progress percentage
    this.#drawProgressText(this.currentProgress);
  }
}