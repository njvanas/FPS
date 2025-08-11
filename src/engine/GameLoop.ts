export type UpdateCallback = (dt: number) => void;

/**
 * Simple game loop using requestAnimationFrame. Executes the provided
 * update callback with a clamped delta time each frame.
 */
export class GameLoop {
  private lastTime = 0;
  private rafId = 0;

  constructor(private readonly update: UpdateCallback) {}

  start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.update(Math.min(dt, 0.1));
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }
}
