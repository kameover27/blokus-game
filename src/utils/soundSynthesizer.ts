export class SoundSynthesizer {
  private _ctx: AudioContext | null = null;

  private get ctx(): AudioContext {
    if (!this._ctx) {
      this._ctx = new AudioContext();
    }
    return this._ctx;
  }

  /** Resume AudioContext after user gesture (iOS requirement) */
  unlock(): void {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  /** Placement success — snap: two sines 800+1200Hz dropping fast */
  place(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.2, t, 0.08);

    const o1 = this.osc('sine', t, 0.08);
    o1.frequency.setValueAtTime(800, t);
    o1.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    o1.connect(g);

    const o2 = this.osc('sine', t, 0.08);
    o2.frequency.setValueAtTime(1200, t);
    o2.frequency.exponentialRampToValueAtTime(500, t + 0.08);
    o2.connect(g);
  }

  /** Invalid placement — buzzer: sawtooth 300→150Hz */
  invalid(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.15, t, 0.12);

    const o = this.osc('sawtooth', t, 0.12);
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.12);
    o.connect(g);
  }

  /** Piece selected — pop: sine 600→400Hz */
  select(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.15, t, 0.06);

    const o = this.osc('sine', t, 0.06);
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.06);
    o.connect(g);
  }

  /** Rotate — tick: sine 1000Hz steady */
  rotate(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.12, t, 0.04);

    const o = this.osc('sine', t, 0.04);
    o.frequency.setValueAtTime(1000, t);
    o.connect(g);
  }

  /** Flip — tick: sine 850Hz steady (slightly lower than rotate) */
  flip(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.12, t, 0.04);

    const o = this.osc('sine', t, 0.04);
    o.frequency.setValueAtTime(850, t);
    o.connect(g);
  }

  /** Pass — whoosh: bandpass-filtered noise sweeping 2000→500Hz */
  pass(): void {
    const t = this.ctx.currentTime;
    const dur = 0.15;
    const g = this.gain(0.2, t, dur);

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(2, t);
    bp.frequency.setValueAtTime(2000, t);
    bp.frequency.exponentialRampToValueAtTime(500, t + dur);

    noise.connect(bp);
    bp.connect(g);
    noise.start(t);
    noise.stop(t + dur);
  }

  /** Undo — descending tone: sine 600→300Hz */
  undo(): void {
    const t = this.ctx.currentTime;
    const g = this.gain(0.15, t, 0.12);

    const o = this.osc('sine', t, 0.12);
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    o.connect(g);
  }

  /** Game over — C-E-G-C arpeggio */
  gameOver(): void {
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const noteDur = 0.15;

    notes.forEach((freq, i) => {
      const start = t + i * noteDur;
      const g = this.gain(0.2, start, noteDur);

      const o = this.osc('sine', start, noteDur);
      o.frequency.setValueAtTime(freq, start);
      o.connect(g);
    });
  }

  // --- helpers ---

  private osc(type: OscillatorType, start: number, dur: number): OscillatorNode {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.start(start);
    o.stop(start + dur);
    return o;
  }

  private gain(vol: number, start: number, dur: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    g.connect(this.ctx.destination);
    return g;
  }
}
