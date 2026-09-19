let highestZ = 1;

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  activePointerId = null;

  init(paper) {
    // Prevent the browser from handling panning/zooming gestures itself
    // so drag works with touch as well as mouse.
    paper.style.touchAction = 'none';

    document.addEventListener('pointermove', (e) => {
      if (this.activePointerId !== null && e.pointerId !== this.activePointerId) return;

      if (!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if (this.rotating) {
        this.rotation = degrees;
      }

      if (this.holdingPaper) {
        if (!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    paper.addEventListener('pointerdown', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      this.activePointerId = e.pointerId;

      // Route subsequent pointer events to this element even if the
      // finger/cursor moves off it - needed for reliable touch dragging.
      if (paper.setPointerCapture) {
        paper.setPointerCapture(e.pointerId);
      }

      paper.style.zIndex = highestZ;
      highestZ += 1;

      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Left mouse button, or any touch/pen pointer: drag.
      if (e.button === 0 || e.pointerType === 'touch' || e.pointerType === 'pen') {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      // Right mouse button: rotate.
      if (e.button === 2) {
        this.rotating = true;
      }
    });

    const release = (e) => {
      if (this.activePointerId !== null && e && e.pointerId !== this.activePointerId) return;
      this.holdingPaper = false;
      this.rotating = false;
      this.activePointerId = null;
    };

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    // Suppress the context menu so a long-press/right-click can rotate
    // instead of opening the browser menu.
    paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
