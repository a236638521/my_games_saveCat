/* 轻量级 WebAudio 战斗与交互音效合成器（无外部音频依赖，受设置开关与音量控制） */
(function () {
  let ctx = null;
  const lastPlayed = {};

  function getCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function volScale() {
    if (!window.Store) return 0.7;
    const st = window.Store.get();
    if (!st.soundOn) return 0;
    const v = typeof st.soundVolume === 'number' ? st.soundVolume : 70;
    return Math.max(0, Math.min(1, v / 100));
  }

  function tone(freq0, freq1, dur, type, amp, delay = 0) {
    const scale = volScale();
    if (scale <= 0.005) return;
    try {
      const c = getCtx();
      if (!c) return;
      if (c.state === 'suspended') c.resume().catch(() => {});
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(Math.max(40, freq0), t0);
      if (freq1 !== freq0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq1), t0 + dur);
      }
      const peak = Math.max(0.004, amp * scale);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.015);
    } catch (_) {}
  }

  function throttled(key, minMs) {
    const now = performance.now();
    if (lastPlayed[key] && now - lastPlayed[key] < minMs) return false;
    lastPlayed[key] = now;
    return true;
  }

  window.SFX = {
    play(kind, arg) {
      if (volScale() <= 0.005) return;
      switch (kind) {
        case 'ui':
          if (!throttled('ui', 40)) return;
          tone(640, 820, 0.07, 'sine', 0.14);
          break;
        case 'shoot': {
          if (!throttled('shoot_' + (arg || ''), 65)) return;
          if (arg === 'yinxiaomei') tone(1040, 620, 0.055, 'triangle', 0.10);
          else if (arg === 'dajv' || arg === 'tangmu') tone(280, 130, 0.09, 'triangle', 0.16);
          else if (arg === 'feifei' || arg === 'wukong') tone(880, 390, 0.095, 'sawtooth', 0.08);
          else if (arg === 'xiaoluo' || arg === 'xiaobuding') tone(490, 680, 0.11, 'sine', 0.12);
          else tone(720, 440, 0.065, 'sine', 0.12);
          break;
        }
        case 'hit':
          if (!throttled('hit', 48)) return;
          if (arg) tone(190, 88, 0.09, 'triangle', 0.22);
          else tone(390, 210, 0.055, 'sine', 0.12);
          break;
        case 'kill':
          if (!throttled('kill', 55)) return;
          if (arg) {
            tone(523, 659, 0.11, 'triangle', 0.18, 0);
            tone(659, 988, 0.16, 'sine', 0.20, 0.07);
          } else {
            tone(587, 880, 0.11, 'sine', 0.16);
          }
          break;
        case 'build':
          tone(440, 660, 0.10, 'triangle', 0.17, 0);
          tone(660, 880, 0.12, 'sine', 0.15, 0.07);
          break;
        case 'upgrade':
          tone(523, 659, 0.09, 'sine', 0.16, 0);
          tone(659, 784, 0.09, 'sine', 0.16, 0.06);
          tone(784, 1046, 0.15, 'triangle', 0.18, 0.12);
          break;
        case 'ult':
          tone(330, 660, 0.14, 'triangle', 0.20, 0);
          tone(660, 1175, 0.24, 'sine', 0.22, 0.10);
          break;
        case 'win':
          tone(523, 523, 0.12, 'triangle', 0.18, 0);
          tone(659, 659, 0.12, 'triangle', 0.18, 0.11);
          tone(784, 784, 0.12, 'triangle', 0.18, 0.22);
          tone(1046, 1046, 0.28, 'sine', 0.22, 0.34);
          break;
        case 'warn':
          tone(760, 520, 0.15, 'sawtooth', 0.14, 0);
          tone(760, 520, 0.15, 'sawtooth', 0.14, 0.20);
          tone(920, 620, 0.20, 'sawtooth', 0.16, 0.40);
          break;
        case 'lose':
          tone(392, 330, 0.16, 'triangle', 0.18, 0);
          tone(330, 220, 0.28, 'sine', 0.18, 0.16);
          break;
      }
    }
  };
})();
