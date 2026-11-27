/* 嵌入式小游戏扩展插槽示例：🐟 接小鱼干大作战（15秒快节奏小游戏，结算共享金币钱包） */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  let canvas, ctx, rafId = null, lastTs = 0;
  let running = false;
  let mg = null;

  const W = 350, H = 400;

  function resetGame() {
    mg = {
      timeLeft: 15.0,
      score: 0,
      catX: W / 2,
      drops: [],
      spawnCd: 0.2
    };
    $('#mgStartOverlay').classList.add('open');
    $('#mgOverOverlay').classList.remove('open');
    updateText();
    draw();
  }

  function startGame() {
    mg = { timeLeft: 15.0, score: 0, catX: W / 2, drops: [], spawnCd: 0.1 };
    running = true;
    $('#mgStartOverlay').classList.remove('open');
    $('#mgOverOverlay').classList.remove('open');
    lastTs = performance.now();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function updateText() {
    if (!mg) return;
    $('#mgTimer').textContent = `⏱️ ${Math.max(0, mg.timeLeft).toFixed(1)}s`;
    $('#mgScore').textContent = `🐟 得分 ${mg.score}`;
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    if (running && mg && $('#view-minigame').classList.contains('active')) {
      mg.timeLeft -= dt;
      mg.spawnCd -= dt;
      if (mg.spawnCd <= 0) {
        mg.spawnCd = 0.34;
        const isBomb = Math.random() < 0.22;
        mg.drops.push({
          x: 24 + Math.random() * (W - 48),
          y: -16,
          vy: 150 + Math.random() * 110,
          bad: isBomb,
          icon: isBomb ? '💣' : (Math.random() < 0.2 ? '🥫' : '🐟'),
          pts: isBomb ? -15 : 10
        });
      }
      for (let i = mg.drops.length - 1; i >= 0; i--) {
        const d = mg.drops[i];
        d.y += d.vy * dt;
        if (d.y >= H - 56 && d.y <= H - 16 && Math.abs(d.x - mg.catX) <= 34) {
          mg.score = Math.max(0, mg.score + d.pts);
          mg.drops.splice(i, 1);
          continue;
        }
        if (d.y > H + 20) mg.drops.splice(i, 1);
      }
      updateText();
      draw();
      if (mg.timeLeft <= 0) {
        running = false;
        const gold = Math.min(60, Math.max(10, Math.round(mg.score * 0.4)));
        if (window.Store) {
          const st = window.Store.get();
          st.miniGameBest = Math.max(st.miniGameBest || 0, mg.score);
          window.Store.addGold(gold);
        }
        $('#mgResultText').textContent = `本局得分 ${mg.score}，统一钱包到账 🪙 +${gold} 金币！`;
        $('#mgOverOverlay').classList.add('open');
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx || !mg) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#E8F7FF'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#A8E07A'; ctx.fillRect(0, H - 34, W, 34);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of mg.drops) {
      ctx.font = '26px sans-serif';
      ctx.fillText(d.icon, d.x, d.y);
    }
    ctx.font = '38px sans-serif';
    ctx.fillText('🐱', mg.catX, H - 36);
  }

  function bind() {
    canvas = $('#mgCanvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);

    const moveTo = (clientX) => {
      if (!mg) return;
      const r = canvas.getBoundingClientRect();
      mg.catX = Math.max(24, Math.min(W - 24, (clientX - r.left) * (W / r.width)));
    };
    canvas.addEventListener('pointermove', (e) => { if (running) moveTo(e.clientX); });
    canvas.addEventListener('pointerdown', (e) => { if (running) moveTo(e.clientX); });

    $('#mgStartBtn').addEventListener('click', startGame);
    $('#mgReplayBtn').addEventListener('click', startGame);
    $('#mgBackModes').addEventListener('click', () => {
      running = false;
      if (window.switchDemoView) window.switchDemoView('modes');
    });
  }

  window.initMiniGameDemo = function () {
    if (!canvas) bind();
    resetGame();
  };
})();
