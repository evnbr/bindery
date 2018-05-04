import ensureImageLoaded from './ensureImageLoaded';

const sec = ms => (ms / 1000).toFixed(2);
class Estimator {
  constructor() {
    this.startLayoutTime = 0;
    this.timeWaitingForImage = 0;
    this.capacity = 0;
    this.elementsProcessed = 0;
  }
  start() {
    this.startLayoutTime = window.performance.now();
  }
  increment() {
    this.elementsProcessed += 1;
  }
  async ensureImageLoaded(img) {
    const waitTime = await ensureImageLoaded(img);
    this.timeWaitingForImage += waitTime;
  }
  end() {
    const endLayoutTime = window.performance.now();
    const totalTime = endLayoutTime - this.startLayoutTime;
    const layoutTime = totalTime - this.timeWaitingForImage;

    console.log(`📖 Book ready in ${sec(totalTime)}s (Layout: ${sec(layoutTime)}s, waiting for images: ${sec(this.timeWaitingForImage)}s)`);
  }
  get progress() {
    return this.elementsProcessed / this.capacity;
  }
}

export default Estimator;
