/* 第 1 章可试玩格子解谜引擎（读取 window.CHAPTER1_DATA）
 * 支持：点击自动寻路/推箱、滑屏、方向键、键盘 WASD/方向键、无限撤销、实时 BFS 下一步提示、localStorage 存档
 */
(function () {
  const DATA = window.CHAPTER1_DATA;
  if (!DATA) return;

  const STORAGE_KEY = 'saveCat_demo_v1';
  const DIRS = [
    { dx: 0, dy: -1, arrow: '↑' },
    { dx: 0, dy: 1, arrow: '↓' },
    { dx: -1, dy: 0, arrow: '←' },
    { dx: 1, dy: 0, arrow: '→' }
  ];

  const $ = (sel, root = document) => root.querySelector(sel);

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        return {
          gold: typeof s.gold === 'number' ? s.gold : 200,
          stars: s.stars || {},
          dajvIntimacy: s.dajvIntimacy || 0,
          rescuedSilver: !!s.rescuedSilver
        };
      }
    } catch (_) {}
    return { gold: 200, stars: {}, dajvIntimacy: 0, rescuedSilver: false };
  }

  function writeSave(save) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); } catch (_) {}
  }

  const save = loadSave();
  let curLevelIdx = 0;
  let state = null;
  let undoStack = [];
  let isWalking = false;
  let hintTarget = null;
  let hintTimer = null;

  function syncHud() {
    const coinEl = $('#coin');
    if (coinEl) coinEl.textContent = save.gold.toLocaleString('en-US');
    const progEl = $('#lvlProg');
    if (progEl) {
      const totalStars = Object.values(save.stars).reduce((a, b) => a + b, 0);
      progEl.textContent = `⭐ ${totalStars}/${DATA.levels.length * 3} · ❤️ 大橘亲密度 ${save.dajvIntimacy}`;
    }
  }

  function boxTypeForLevel(id) {
    if (id === '1-4' || id === '1-8') return { icon: '🪴', cls: 'pot', label: '花盆' };
    if (id === '1-9' || id === '1-10') return { icon: '🧺', cls: 'basket', label: '洗衣篮' };
    return { icon: '📦', cls: 'crate', label: '纸箱' };
  }

  function initLevel(idx) {
    curLevelIdx = Math.max(0, Math.min(DATA.levels.length - 1, idx));
    const lvl = DATA.levels[curLevelIdx];
    const rows = lvl.grid.length;
    const cols = lvl.grid[0].length;
    const walls = new Set();
    const puddles = new Set();
    const fishes = [];
    const boxes = [];
    const dogs = lvl.dogs || [];
    let start = [1, 1], goal = [1, 1];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = lvl.grid[y][x];
        const k = `${x},${y}`;
        if (ch === '#') walls.add(k);
        else if (ch === '~') puddles.add(k);
        else if (ch === 'S') start = [x, y];
        else if (ch === 'G') goal = [x, y];
        else if (ch === 'B') boxes.push(k);
        else if (ch === 'F') fishes.push(k);
      }
    }
    if (lvl.extraFish) {
      for (const [fx, fy] of lvl.extraFish) fishes.push(`${fx},${fy}`);
    }

    state = {
      lvl, rows, cols, walls, puddles, fishes, dogs,
      dogSet: new Set(dogs.map((d) => `${d.x},${d.y}`)),
      start, goal,
      cx: start[0], cy: start[1],
      facingLeft: false,
      boxes,
      filled: new Set(),
      collectedFish: new Set(),
      steps: 0,
      won: false
    };
    undoStack = [];
    isWalking = false;
    hintTarget = null;
    clearTimeout(hintTimer);

    const winOverlay = $('#winModal');
    if (winOverlay) winOverlay.classList.remove('open');

    renderLevelBar();
    buildBoardDOM();
    renderBoard();
    syncHud();
  }

  function getWatchedSet(boxArr, st = state) {
    const boxSet = new Set(boxArr);
    const watched = new Set();
    for (const d of st.dogs) {
      for (let step = 1; step <= d.range; step++) {
        const vx = d.x + d.dx * step;
        const vy = d.y + d.dy * step;
        if (vx < 0 || vx >= st.cols || vy < 0 || vy >= st.rows) break;
        const vk = `${vx},${vy}`;
        if (st.walls.has(vk) || boxSet.has(vk) || st.dogSet.has(vk)) break;
        watched.add(vk);
      }
    }
    return watched;
  }

  function cloneSnapshot() {
    return {
      cx: state.cx,
      cy: state.cy,
      facingLeft: state.facingLeft,
      boxes: [...state.boxes],
      filled: new Set(state.filled),
      collectedFish: new Set(state.collectedFish),
      steps: state.steps
    };
  }

  function restoreSnapshot(snap) {
    state.cx = snap.cx;
    state.cy = snap.cy;
    state.facingLeft = snap.facingLeft;
    state.boxes = [...snap.boxes];
    state.filled = new Set(snap.filled);
    state.collectedFish = new Set(snap.collectedFish);
    state.steps = snap.steps;
    state.won = false;
    hintTarget = null;
    renderBoard();
  }

  function stepOrPush(dx, dy, recordUndo = true) {
    if (state.won) return false;
    const nx = state.cx + dx;
    const ny = state.cy + dy;
    if (nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows) return false;
    const nk = `${nx},${ny}`;

    if (state.walls.has(nk) || state.dogSet.has(nk)) {
      shakeCat();
      return false;
    }
    if (state.puddles.has(nk) && !state.filled.has(nk)) {
      shakeCat();
      boardToast('💧 猫咪怕水！试试把重物推进水坑当垫脚石');
      return false;
    }

    const boxIdx = state.boxes.indexOf(nk);
    if (boxIdx !== -1) {
      const bx = nx + dx;
      const by = ny + dy;
      if (bx < 0 || bx >= state.cols || by < 0 || by >= state.rows) {
        shakeCat(); return false;
      }
      const bk = `${bx},${by}`;
      if (
        state.walls.has(bk) ||
        state.boxes.includes(bk) ||
        state.dogSet.has(bk) ||
        (bx === state.goal[0] && by === state.goal[1])
      ) {
        shakeCat();
        boardToast('🧱 后面顶住推不动啦！');
        return false;
      }

      const nextBoxes = state.boxes.filter((_, i) => i !== boxIdx);
      const nextFilled = new Set(state.filled);
      let filledPuddle = false;
      if (state.puddles.has(bk) && !nextFilled.has(bk)) {
        nextFilled.add(bk);
        filledPuddle = true;
      } else {
        nextBoxes.push(bk);
      }

      const watchedAfter = getWatchedSet(nextBoxes);
      if (watchedAfter.has(nk)) {
        shakeCat();
        boardToast('👀 前面被大黄狗盯着，过不去！');
        return false;
      }

      if (recordUndo) undoStack.push(cloneSnapshot());
      if (dx !== 0) state.facingLeft = dx < 0;
      state.cx = nx;
      state.cy = ny;
      state.boxes = nextBoxes;
      state.filled = nextFilled;
      state.steps += 1;
      if (state.fishes.includes(nk)) state.collectedFish.add(nk);
      hintTarget = null;
      renderBoard(filledPuddle ? bk : null);
      checkWin();
      return true;
    }

    const watchedNow = getWatchedSet(state.boxes);
    if (watchedNow.has(nk)) {
      shakeCat();
      boardToast('👀 被大黄狗盯住了！先推东西挡住它的视线');
      return false;
    }

    if (recordUndo) undoStack.push(cloneSnapshot());
    if (dx !== 0) state.facingLeft = dx < 0;
    state.cx = nx;
    state.cy = ny;
    state.steps += 1;
    if (state.fishes.includes(nk)) state.collectedFish.add(nk);
    hintTarget = null;
    renderBoard();
    checkWin();
    return true;
  }

  // 点击格子寻路（只走安全空地，不自动乱推箱子）
  function findWalkPath(tx, ty) {
    const startK = `${state.cx},${state.cy}`;
    const targetK = `${tx},${ty}`;
    if (startK === targetK) return null;

    const boxSet = new Set(state.boxes);
    const watched = getWatchedSet(state.boxes);
    if (state.walls.has(targetK) || state.dogSet.has(targetK) || boxSet.has(targetK) || watched.has(targetK)) return null;
    if (state.puddles.has(targetK) && !state.filled.has(targetK)) return null;

    const q = [[state.cx, state.cy]];
    const parent = new Map([[startK, null]]);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) {
        const path = [];
        let cur = targetK;
        while (parent.get(cur)) {
          const p = parent.get(cur);
          path.push([p.dx, p.dy]);
          cur = p.prev;
        }
        return path.reverse();
      }
      for (const d of DIRS) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows) continue;
        const nk = `${nx},${ny}`;
        if (parent.has(nk)) continue;
        if (state.walls.has(nk) || state.dogSet.has(nk) || boxSet.has(nk) || watched.has(nk)) continue;
        if (state.puddles.has(nk) && !state.filled.has(nk)) continue;
        parent.set(nk, { prev: `${x},${y}`, dx: d.dx, dy: d.dy });
        q.push([nx, ny]);
      }
    }
    return null;
  }

  function handleTileTap(tx, ty) {
    if (isWalking || state.won) return;
    const dx = tx - state.cx;
    const dy = ty - state.cy;

    // 相邻格直接走或推
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      stepOrPush(dx, dy, true);
      return;
    }

    const path = findWalkPath(tx, ty);
    if (!path || path.length === 0) {
      if (state.puddles.has(`${tx},${ty}`) && !state.filled.has(`${tx},${ty}`)) {
        boardToast('💧 水坑过不去，得先把箱子推进去');
      } else {
        boardToast('🐾 点相邻的箱子可以推，点安全草地可以直接走过去');
      }
      return;
    }

    undoStack.push(cloneSnapshot());
    isWalking = true;
    let i = 0;
    function nextStep() {
      if (i >= path.length || state.won) {
        isWalking = false;
        return;
      }
      const [sdx, sdy] = path[i++];
      stepOrPush(sdx, sdy, false);
      if (i < path.length && !state.won) {
        setTimeout(nextStep, 125);
      } else {
        isWalking = false;
      }
    }
    nextStep();
  }

  // 实时 BFS 下一步提示
  function computeNextHint() {
    const lvl = state.lvl;
    const fishIdx = new Map(state.fishes.map((k, i) => [k, i]));
    let startMask = 0;
    for (const fk of state.collectedFish) {
      if (fishIdx.has(fk)) startMask |= 1 << fishIdx.get(fk);
    }

    const encode = (cx, cy, boxes, filled, fmask) =>
      `${cx},${cy}|${[...boxes].sort().join(';')}|${[...filled].sort().join(';')}|${fmask}`;

    const q = [{
      cx: state.cx, cy: state.cy,
      boxes: [...state.boxes],
      filled: new Set(state.filled),
      fmask: startMask,
      firstMove: null
    }];
    const visited = new Set([encode(state.cx, state.cy, state.boxes, state.filled, startMask)]);
    let head = 0;
    let bestAnyMove = null;

    while (head < q.length && head < 35000) {
      const cur = q[head++];
      if (cur.cx === state.goal[0] && cur.cy === state.goal[1]) {
        if (!bestAnyMove) bestAnyMove = cur.firstMove;
        if (cur.fmask === 7) return cur.firstMove;
      }
      const boxSet = new Set(cur.boxes);
      for (const d of DIRS) {
        const nx = cur.cx + d.dx;
        const ny = cur.cy + d.dy;
        if (nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows) continue;
        const nk = `${nx},${ny}`;
        if (state.walls.has(nk) || state.dogSet.has(nk)) continue;
        if (state.puddles.has(nk) && !cur.filled.has(nk)) continue;

        let nextBoxes = cur.boxes;
        let nextFilled = cur.filled;
        if (boxSet.has(nk)) {
          const bx = nx + d.dx;
          const by = ny + d.dy;
          if (bx < 0 || bx >= state.cols || by < 0 || by >= state.rows) continue;
          const bk = `${bx},${by}`;
          if (state.walls.has(bk) || boxSet.has(bk) || state.dogSet.has(bk) || (bx === state.goal[0] && by === state.goal[1])) continue;
          nextBoxes = cur.boxes.filter((b) => b !== nk);
          nextFilled = new Set(cur.filled);
          if (state.puddles.has(bk) && !nextFilled.has(bk)) nextFilled.add(bk);
          else nextBoxes.push(bk);
        }

        const watched = getWatchedSet(nextBoxes);
        if (watched.has(nk)) continue;
        const nfmask = cur.fmask | (fishIdx.has(nk) ? 1 << fishIdx.get(nk) : 0);
        const key = encode(nx, ny, nextBoxes, nextFilled, nfmask);
        if (!visited.has(key)) {
          visited.add(key);
          q.push({
            cx: nx, cy: ny,
            boxes: nextBoxes,
            filled: nextFilled,
            fmask: nfmask,
            firstMove: cur.firstMove || { x: nx, y: ny, arrow: d.arrow }
          });
        }
      }
    }
    return bestAnyMove;
  }

  function showHint() {
    if (isWalking || state.won) return;
    const move = computeNextHint();
    if (!move) {
      boardToast('⚠️ 这步已经推死角啦，点「撤销」或「重来」吧！');
      return;
    }
    hintTarget = move;
    renderBoard();
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      hintTarget = null;
      renderBoard();
    }, 2400);
  }

  function checkWin() {
    if (state.cx !== state.goal[0] || state.cy !== state.goal[1]) return;
    state.won = true;
    isWalking = false;

    const lvl = state.lvl;
    const allFish = state.collectedFish.size === state.fishes.length;
    const withinPar = state.steps <= lvl.parSteps;
    const stars = 1 + (allFish ? 1 : 0) + (withinPar ? 1 : 0);

    const isFirst = !save.stars[lvl.id];
    const goldEarned = isFirst ? lvl.firstClearGold : lvl.repeatGold;
    const intimacyEarned = isFirst
      ? lvl.firstClearIntimacy + (stars === 3 ? lvl.threeStarBonusIntimacy : 0)
      : 5;

    save.stars[lvl.id] = Math.max(save.stars[lvl.id] || 0, stars);
    save.gold += goldEarned;
    save.dajvIntimacy += intimacyEarned;
    if (lvl.unlockReward) save.rescuedSilver = true;
    writeSave(save);
    syncHud();
    renderLevelBar();

    const modal = $('#winModal');
    $('#winTitle').textContent = lvl.unlockReward ? '🎉 救出银小妹！' : `🎉 ${lvl.name} 通关！`;
    $('#winStars').innerHTML = [1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('');
    $('#winChecks').innerHTML =
      `<div>${stars >= 1 ? '✅' : '⬜'} 救出小猫（通关）</div>` +
      `<div>${allFish ? '✅' : '⬜'} 集齐全部小鱼干（${state.collectedFish.size}/3）</div>` +
      `<div>${withinPar ? '✅' : '⬜'} 步数达标（${state.steps} / ${lvl.parSteps} 步）</div>`;
    $('#winRewards').textContent =
      `${isFirst ? '首通奖励' : '重玩奖励'}：🪙 +${goldEarned} 金币 · ❤️ 大橘亲密度 +${intimacyEarned}` +
      (lvl.unlockReward ? ` · 🐱 解锁「${lvl.unlockReward}」` : '');
    $('#winNextBtn').style.display = curLevelIdx < DATA.levels.length - 1 ? 'inline-block' : 'none';
    modal.classList.add('open');
  }

  /* ===== DOM 构建与渲染 ===== */
  function renderLevelBar() {
    const strip = $('#lvlStrip');
    strip.innerHTML = '';
    DATA.levels.forEach((l, i) => {
      const s = save.stars[l.id] || 0;
      const btn = document.createElement('button');
      btn.className = `lvl-chip ${i === curLevelIdx ? 'active' : ''} ${s > 0 ? 'cleared' : ''}`;
      btn.innerHTML = `<b>${l.id}</b><span>${s > 0 ? '★'.repeat(s) + '☆'.repeat(3 - s) : '未通'}</span>`;
      btn.addEventListener('click', () => initLevel(i));
      strip.appendChild(btn);
    });
    const activeChip = strip.children[curLevelIdx];
    if (activeChip) activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    const lvl = state.lvl;
    $('#lvlTitle').textContent = `${lvl.id} ${lvl.name}`;
    $('#lvlDesc').textContent = lvl.intent;
  }

  function buildBoardDOM() {
    const board = $('#board');
    const maxW = 356;
    const tileSize = Math.min(48, Math.floor(maxW / state.cols));
    board.style.setProperty('--ts', `${tileSize}px`);
    board.style.width = `${tileSize * state.cols}px`;
    board.style.height = `${tileSize * state.rows}px`;
    board.innerHTML = '';

    // 底层格子
    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.style.left = `${x * tileSize}px`;
        cell.style.top = `${y * tileSize}px`;
        cell.addEventListener('click', () => handleTileTap(x, y));
        board.appendChild(cell);
      }
    }

    // 动态实体层
    const entities = document.createElement('div');
    entities.id = 'boardEntities';
    board.appendChild(entities);
  }

  function renderBoard(splashedKey = null) {
    const board = $('#board');
    const tileSize = parseInt(board.style.getPropertyValue('--ts'), 10) || 44;
    const watched = getWatchedSet(state.boxes);
    const boxType = boxTypeForLevel(state.lvl.id);

    // 更新状态栏
    $('#stepStat').textContent = `👣 步数 ${state.steps} / ${state.lvl.parSteps}`;
    $('#fishStat').textContent = `🐟 ${state.collectedFish.size}/3`;
    $('#undoBtn').disabled = undoStack.length === 0 || isWalking;

    // 刷新格子样式
    const cells = board.querySelectorAll('.cell');
    cells.forEach((cell) => {
      const x = +cell.dataset.x;
      const y = +cell.dataset.y;
      const k = `${x},${y}`;
      let cls = 'cell ' + ((x + y) % 2 === 0 ? 'g0' : 'g1');
      if (state.walls.has(k)) cls = 'cell wall';
      else if (state.puddles.has(k)) cls = state.filled.has(k) ? 'cell bridge' : 'cell puddle';
      else if (watched.has(k)) cls += ' watched';

      if (hintTarget && hintTarget.x === x && hintTarget.y === y) cls += ' hint';
      cell.className = cls;
      cell.innerHTML = hintTarget && hintTarget.x === x && hintTarget.y === y
        ? `<span class="hint-arrow">${hintTarget.arrow}</span>`
        : (watched.has(k) && !state.walls.has(k) ? '<span class="watch-eye">👀</span>' : '');

      if (splashedKey === k) {
        const sp = document.createElement('span');
        sp.className = 'splash';
        sp.textContent = '💦';
        cell.appendChild(sp);
      }
    });

    // 刷新实体（鱼、箱子、看门狗、终点猫、大橘）
    const entities = $('#boardEntities');
    entities.innerHTML = '';

    // 小鱼干
    state.fishes.forEach((fk) => {
      if (state.collectedFish.has(fk)) return;
      const [x, y] = fk.split(',').map(Number);
      const el = document.createElement('div');
      el.className = 'ent fish';
      el.style.left = `${x * tileSize}px`;
      el.style.top = `${y * tileSize}px`;
      el.textContent = '🐟';
      entities.appendChild(el);
    });

    // 看门狗
    state.dogs.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'ent dog';
      el.style.left = `${d.x * tileSize}px`;
      el.style.top = `${d.y * tileSize}px`;
      el.innerHTML = `🐕<i>↓</i>`;
      entities.appendChild(el);
    });

    // 终点被困小猫（1-10 显示银小妹 2.5D 立绘！）
    {
      const [gx, gy] = state.goal;
      const el = document.createElement('div');
      el.className = 'ent goal';
      el.style.left = `${gx * tileSize}px`;
      el.style.top = `${gy * tileSize}px`;
      if (state.lvl.unlockReward && window.CATS && window.catSVG) {
        const silver = window.CATS.find((c) => c.id === 'yinxiaomei');
        el.innerHTML = `<div class="mini-svg">${window.catSVG(silver)}</div><span class="sos">救命喵</span>`;
      } else {
        el.innerHTML = `<span class="kitten">🐱</span><span class="sos">喵~</span>`;
      }
      entities.appendChild(el);
    }

    // 重物箱子
    state.boxes.forEach((bk) => {
      const [x, y] = bk.split(',').map(Number);
      const el = document.createElement('div');
      el.className = `ent box ${boxType.cls}`;
      el.style.left = `${x * tileSize}px`;
      el.style.top = `${y * tileSize}px`;
      el.textContent = boxType.icon;
      entities.appendChild(el);
    });

    // 玩家大橘（使用 2.5D 立绘）
    {
      const el = document.createElement('div');
      el.className = `ent player ${state.facingLeft ? 'flip' : ''}`;
      el.style.left = `${state.cx * tileSize}px`;
      el.style.top = `${state.cy * tileSize}px`;
      const dajv = window.CATS && window.CATS.find((c) => c.id === 'dajv');
      el.innerHTML = dajv && window.catSVG ? `<div class="mini-svg">${window.catSVG(dajv)}</div>` : '🍊';
      entities.appendChild(el);
    }
  }

  function shakeCat() {
    const p = $('#boardEntities .player');
    if (!p) return;
    p.classList.remove('shake');
    void p.offsetWidth;
    p.classList.add('shake');
  }

  function boardToast(msg) {
    if (window.showDemoToast) window.showDemoToast(msg);
  }

  function bindEvents() {
    $('#undoBtn').addEventListener('click', () => {
      if (isWalking || undoStack.length === 0) return;
      restoreSnapshot(undoStack.pop());
    });
    $('#restartBtn').addEventListener('click', () => initLevel(curLevelIdx));
    $('#hintBtn').addEventListener('click', showHint);

    $$('.dpad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isWalking || state.won) return;
        const map = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
        const dir = map[btn.dataset.dir];
        if (dir) stepOrPush(dir[0], dir[1], true);
      });
    });

    // 键盘支持
    window.addEventListener('keydown', (e) => {
      const viewLevel = $('#view-level');
      if (!viewLevel || !viewLevel.classList.contains('active')) return;
      const map = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
      };
      if (map[e.key]) {
        e.preventDefault();
        if (!isWalking && !state.won) stepOrPush(map[e.key][0], map[e.key][1], true);
      } else if (e.key === 'z' || e.key === 'Z') {
        if (!isWalking && undoStack.length > 0) restoreSnapshot(undoStack.pop());
      } else if (e.key === 'r' || e.key === 'R') {
        initLevel(curLevelIdx);
      }
    });

    // 棋盘滑动手势
    let sx = 0, sy = 0;
    const board = $('#board');
    board.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY;
    }, { passive: true });
    board.addEventListener('touchend', (e) => {
      if (isWalking || state.won) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.hypot(dx, dy) < 28) return;
      if (Math.abs(dx) > Math.abs(dy)) stepOrPush(dx > 0 ? 1 : -1, 0, true);
      else stepOrPush(0, dy > 0 ? 1 : -1, true);
    }, { passive: true });

    $('#winReplayBtn').addEventListener('click', () => initLevel(curLevelIdx));
    $('#winNextBtn').addEventListener('click', () => initLevel(curLevelIdx + 1));
  }

  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  window.initPuzzleDemo = function () {
    if (state) { syncHud(); return; }
    bindEvents();
    initLevel(0);
  };

  syncHud();
})();
