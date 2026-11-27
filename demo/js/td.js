/* 「保卫萝卜」式萌猫塔防引擎（v0.4.2：选关流程 + 慢节奏调优 + 打击感与粒子特效 + WebAudio 音效 + 暂停设置二次确认） */
(function () {
  const COLS = 7;
  const ROWS = 8;
  const TS = 52; // 364 x 416
  const W = COLS * TS;
  const H = ROWS * TS;

  const LEVELS = [
    {
      id: '1-1', name: '1-1 初遇小老鼠', startFish: 240, rewardGold: 25,
      desc: '点草地建塔，点纸箱/花盆集火爆鲜鱼点',
      path: [[1,0],[1,1],[1,2],[1,3],[2,3],[3,3],[4,3],[5,3],[5,4],[5,5],[5,6],[3,6],[2,6],[1,6]],
      obstacles: [
        { x: 2, y: 1, kind: 'box', hp: 85, drop: 45 },
        { x: 3, y: 2, kind: 'pot', hp: 100, drop: 50 },
        { x: 4, y: 1, kind: 'yarn', hp: 95, drop: 45 },
        { x: 2, y: 4, kind: 'box', hp: 95, drop: 50 },
        { x: 4, y: 5, kind: 'bush', hp: 115, drop: 55 }
      ],
      waves: [
        [{ type: 'mouse', count: 5, gap: 1.25 }],
        [{ type: 'mouse', count: 7, gap: 1.05 }],
        [{ type: 'mouse', count: 5, gap: 1.0 }, { type: 'vacuum', count: 2, gap: 1.7 }],
        [{ type: 'vacuum', count: 4, gap: 1.4 }, { type: 'mouse', count: 6, gap: 0.8 }]
      ]
    },
    {
      id: '1-2', name: '1-2 花坛双拐角', startFish: 260, rewardGold: 30,
      desc: '拐角放「小布丁」减速或「小罗」全向声波清场',
      path: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[5,2],[5,3],[3,3],[2,3],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[5,6],[5,7]],
      obstacles: [
        { x: 2, y: 2, kind: 'box', hp: 105, drop: 45 },
        { x: 4, y: 2, kind: 'pot', hp: 120, drop: 55 },
        { x: 3, y: 4, kind: 'yarn', hp: 115, drop: 55 },
        { x: 4, y: 4, kind: 'box', hp: 115, drop: 50 },
        { x: 0, y: 4, kind: 'bush', hp: 135, drop: 60 },
        { x: 2, y: 6, kind: 'pot', hp: 135, drop: 60 },
        { x: 3, y: 7, kind: 'yarn', hp: 145, drop: 65 }
      ],
      waves: [
        [{ type: 'mouse', count: 6, gap: 1.05 }],
        [{ type: 'dog', count: 4, gap: 1.35 }, { type: 'mouse', count: 5, gap: 0.9 }],
        [{ type: 'vacuum', count: 4, gap: 1.25 }, { type: 'dog', count: 3, gap: 1.2 }],
        [{ type: 'fatcat', count: 2, gap: 2.1 }, { type: 'mouse', count: 8, gap: 0.75 }],
        [{ type: 'fatcat', count: 3, gap: 1.8 }, { type: 'dog', count: 5, gap: 1.0 }]
      ]
    },
    {
      id: '1-3', name: '1-3 Boss：吸尘器来袭', startFish: 300, rewardGold: 60, unlockSilver: true,
      desc: '守护终点「银小妹」，Boss 震晕塔时可用主动大招！',
      path: [[3,0],[3,1],[2,1],[1,1],[1,2],[1,3],[1,4],[2,4],[4,4],[5,4],[5,3],[5,2],[5,5],[5,6],[3,6],[2,6],[1,6],[1,7]],
      obstacles: [
        { x: 2, y: 2, kind: 'box', hp: 125, drop: 55 },
        { x: 3, y: 2, kind: 'yarn', hp: 145, drop: 65 },
        { x: 4, y: 2, kind: 'pot', hp: 135, drop: 60 },
        { x: 3, y: 3, kind: 'bush', hp: 155, drop: 70 },
        { x: 2, y: 5, kind: 'box', hp: 135, drop: 55 },
        { x: 4, y: 5, kind: 'pot', hp: 145, drop: 65 },
        { x: 4, y: 7, kind: 'yarn', hp: 155, drop: 70 }
      ],
      waves: [
        [{ type: 'mouse', count: 7, gap: 0.95 }],
        [{ type: 'dog', count: 5, gap: 1.15 }],
        [{ type: 'vacuum', count: 5, gap: 1.1 }, { type: 'mouse', count: 6, gap: 0.75 }],
        [{ type: 'fatcat', count: 3, gap: 1.8 }, { type: 'dog', count: 5, gap: 1.0 }],
        [{ type: 'fatcat', count: 4, gap: 1.55 }, { type: 'vacuum', count: 5, gap: 1.0 }],
        [{ type: 'boss', count: 1, gap: 1.2 }, { type: 'dog', count: 4, gap: 1.1 }, { type: 'mouse', count: 7, gap: 0.75 }]
      ]
    }
  ];

  // 第 1 章完整 10 关目录（1-1 ~ 1-3 可直接试玩；1-4 ~ 1-10 展示完整章节路径并保持未解锁态）
  const CHAPTER_STAGES = [
    { id: '1-1', title: '初遇小老鼠', playableIdx: 0, waves: 4 },
    { id: '1-2', title: '花坛双拐角', playableIdx: 1, waves: 5 },
    { id: '1-3', title: '吸尘Boss · 解锁银小妹', playableIdx: 2, waves: 6, boss: true, rewardCat: '银小妹' },
    { id: '1-4', title: '雨夜花坛', playableIdx: -1, waves: 6 },
    { id: '1-5', title: '走廊双道', playableIdx: -1, waves: 6 },
    { id: '1-6', title: '竹篱暗哨', playableIdx: -1, waves: 7 },
    { id: '1-7', title: '午后猫屋', playableIdx: -1, waves: 7 },
    { id: '1-8', title: '庭院水池', playableIdx: -1, waves: 7 },
    { id: '1-9', title: '双路夹击', playableIdx: -1, waves: 8 },
    { id: '1-10', title: '奶猫保卫战', playableIdx: -1, waves: 10, boss: true }
  ];

  // 整体速度下调为更从容舒适的塔防节奏
  const ENEMY_TYPES = {
    mouse:  { name: '调皮鼠', emoji: '🐭', hp: 50,  speed: 42, reward: 12, radius: 13 },
    dog:    { name: '小黄狗', emoji: '🐕', hp: 92,  speed: 48, reward: 18, radius: 15 },
    vacuum: { name: '扫地机', emoji: '🛸', hp: 160, speed: 30, reward: 22, radius: 16 },
    fatcat: { name: '恶霸猫', emoji: '🕶️', hp: 270, speed: 25, reward: 32, radius: 18 },
    boss:   { name: '吸尘Boss', emoji: '🧹', hp: 1350, speed: 19, reward: 120, radius: 22, isBoss: true }
  };

  const OBS_ICONS = { box: '📦', pot: '🪴', yarn: '🧶', bush: '🌿' };
  const ULT_META = {
    dajv:       { ico: '💥', eff: '跳砸击退' },
    jintiantian:{ ico: '⚡', eff: '全队狂速' },
    yinxiaomei: { ico: '🩰', eff: '极速翻倍' },
    xiaobuding: { ico: '💤', eff: '全屏沉睡' },
    xiaoluo:    { ico: '🔊', eff: '全屏震晕' },
    tangmu:     { ico: '🏺', eff: '3连空投' },
    feifei:     { ico: '🎯', eff: '定身易伤' },
    ali:        { ico: '🌪️', eff: '全线收割' },
    wukong:     { ico: '🥖', eff: '金箍横扫' }
  };
  const $ = (s, r = document) => r.querySelector(s);

  let curLvlIdx = 0;
  let pendingStageIdx = 0;
  let deck = ['dajv', 'yinxiaomei', 'xiaobuding', 'xiaoluo'];
  let draftDeck = [];
  let canvas, ctx;
  let g = null;
  let rafId = null;
  let lastFrameTs = 0;
  let speedMul = 1; // 1 => 0.90 舒缓标准；2 => 1.60 轻快加速
  let paused = false;
  let uiBound = false;
  let selectBound = false;
  let pendingConfirm = null; // 'restart' | 'lobby'
  let catThumbCache = {};

  function getUltSkill(cat) {
    return (cat && cat.skills || []).find((s) => s.kind === '大招') || { lv: 7, name: '终极技', desc: '' };
  }

  function getUltUnlockInfo(catId) {
    const cat = (window.CATS || []).find((c) => c.id === catId);
    const skill = getUltSkill(cat);
    const reqLv = skill.lv || 7;
    const curLv = window.Store ? window.Store.getCatIntimacy(catId).lv : 1;
    return { unlocked: curLv >= reqLv, curLv, reqLv, skill, cat };
  }

  function getSavedDeck(availIds) {
    const saved = window.Store && Array.isArray(window.Store.get().tdDeck) ? window.Store.get().tdDeck : deck;
    let res = saved.filter((id) => availIds.includes(id)).slice(0, 4);
    if (!res.length && availIds.length) res = [availIds[0]];
    return res;
  }

  function sfx(kind, arg) {
    if (window.SFX) window.SFX.play(kind, arg);
  }

  function toast(msg) {
    if (window.showDemoToast) window.showDemoToast(msg);
  }

  function getCatImg(catId) {
    if (catThumbCache[catId]) return catThumbCache[catId];
    const cat = (window.CATS || []).find((c) => c.id === catId);
    if (!cat || !window.catSVG) return null;
    const svgStr = window.catSVG(cat);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    catThumbCache[catId] = img;
    return img;
  }

  /* ===== 选关界面逻辑 ===== */
  function getStageState(st) {
    const starsMap = st.tdStars || {};
    let frontierFound = false;
    return CHAPTER_STAGES.map((stage, i) => {
      const stars = starsMap[stage.id] || 0;
      const cleared = stars > 0;
      const prevCleared = i === 0 || (starsMap[CHAPTER_STAGES[i - 1].id] || 0) > 0;
      let status = 'locked';
      if (stage.playableIdx >= 0) {
        if (cleared) {
          status = 'cleared';
        } else if (prevCleared && !frontierFound) {
          status = 'current';
          frontierFound = true;
        }
      }
      return Object.assign({}, stage, { stars, status });
    });
  }

  /* ===== 选关与出战备战弹窗 ===== */
  function renderSquadList() {
    const listEl = $('#tdSquadList');
    if (!listEl) return;
    const avail = window.Store ? window.Store.getPlayableCats() : (window.CATS || []);
    if ($('#tdSquadCount')) $('#tdSquadCount').textContent = `${draftDeck.length}/4`;

    listEl.innerHTML = '';
    avail.forEach((cat) => {
      const on = draftDeck.includes(cat.id);
      const info = getUltUnlockInfo(cat.id);
      const um = ULT_META[cat.id] || { ico: cat.verbIcon, eff: info.skill.name };
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `sq-item ${on ? 'on' : ''}`;
      card.dataset.id = cat.id;

      const avatar = document.createElement('div');
      avatar.className = 'sq-avatar';
      avatar.style.background = cat.theme || '#FFF2DF';
      if (window.catSVG) avatar.innerHTML = window.catSVG(cat);

      const body = document.createElement('div');
      body.className = 'sq-body';
      body.innerHTML = `
        <div class="sq-top">
          <b>${cat.name} · ${cat.breed}</b>
          <span class="sq-lv ${info.unlocked ? 'ult-ok' : ''}">❤️Lv.${info.curLv} · ${info.unlocked ? `${um.ico}大招已解锁` : `🔒Lv.${info.reqLv}开大招`}</span>
        </div>
        <div class="sq-tags">
          <span class="sq-role">${cat.verbIcon} ${cat.td.role}</span>
          <span class="sq-cost">🐟${cat.td.cost}</span>
        </div>
        <div class="sq-desc">${cat.tags.join(' · ')}｜大招${um.ico}${um.eff}：${info.skill.desc}</div>
      `;

      const chk = document.createElement('span');
      chk.className = 'sq-check';
      chk.textContent = on ? '✓' : '+';

      card.appendChild(avatar);
      card.appendChild(body);
      card.appendChild(chk);

      card.addEventListener('click', () => {
        sfx('ui');
        if (draftDeck.includes(cat.id)) {
          if (draftDeck.length <= 1) {
            toast('至少保留 1 只猫上阵哦');
            return;
          }
          draftDeck = draftDeck.filter((x) => x !== cat.id);
        } else {
          if (draftDeck.length >= 4) {
            toast('最多只能选择 4 只猫咪，先取消一只再换吧～');
            return;
          }
          draftDeck.push(cat.id);
        }
        const scrollTop = listEl.scrollTop;
        renderSquadList();
        listEl.scrollTop = scrollTop;
      });
      listEl.appendChild(card);
    });
  }

  function openSquadModal(stageIdx) {
    pendingStageIdx = Math.max(0, Math.min(LEVELS.length - 1, stageIdx));
    const lvl = LEVELS[pendingStageIdx];
    const avail = window.Store ? window.Store.getPlayableCats() : (window.CATS || []);
    const availIds = avail.map((c) => c.id);
    draftDeck = getSavedDeck(availIds);

    $('#tdSquadTitle').textContent = `🐾 出战备战 · ${lvl.name}`;
    renderSquadList();
    $('#tdSquadModal').classList.add('open');
  }

  function renderSelectGrid() {
    const grid = $('#tdSelectGrid');
    if (!grid) return;
    const st = window.Store ? window.Store.get() : { tdStars: {} };
    const list = getStageState(st);
    const totalStars = list.reduce((sum, s) => sum + s.stars, 0);
    $('#tdSelStars').textContent = `★ ${totalStars}/9`;

    const currentStage = list.find((s) => s.status === 'current') || list.filter((s) => s.status === 'cleared').pop() || list[0];
    $('#tdSelectStartBtn').textContent = `🛡️ 挑战 ${currentStage.id} · ${currentStage.title}`;
    $('#tdSelectStartBtn').dataset.lvl = String(Math.max(0, currentStage.playableIdx));

    grid.innerHTML = list.map((s) => {
      const starTxt = s.status === 'cleared'
        ? '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars)
        : (s.status === 'current' ? '当前关卡' : '🔒 未解锁');
      const badge = s.rewardCat ? `<em class="sg-rew">🎀 ${s.rewardCat}</em>` : (s.boss ? '<em class="sg-boss">Boss</em>' : '');
      const cls = `stage-card ${s.status}`;
      return `<button class="${cls}" data-idx="${s.playableIdx}" data-status="${s.status}" data-id="${s.id}">
        <div class="sg-top"><b>${s.id}</b>${badge}</div>
        <div class="sg-name">${s.title}</div>
        <div class="sg-bot"><span>${s.waves}波</span><i class="sg-st">${starTxt}</i></div>
      </button>`;
    }).join('');

    grid.querySelectorAll('.stage-card').forEach((card) => {
      card.addEventListener('click', () => {
        const status = card.dataset.status;
        const idx = Number(card.dataset.idx);
        if (status === 'locked' || idx < 0) {
          toast(idx < 0 ? '后续关卡敬请期待（Demo 已开放 1-1 ~ 1-3）' : '请先通关前置关卡解锁！');
          return;
        }
        sfx('ui');
        openSquadModal(idx);
      });
    });
  }

  function enterBattle(lvlIdx) {
    if (window.switchDemoView) {
      window.switchDemoView('td', lvlIdx);
    } else {
      window.initTdDemo(lvlIdx);
    }
  }

  window.initTdSelectDemo = function () {
    if (!selectBound) {
      selectBound = true;
      $('#tdSelectStartBtn').addEventListener('click', (e) => {
        sfx('ui');
        const idx = Number(e.currentTarget.dataset.lvl || 0);
        openSquadModal(idx);
      });
      $('#tdSquadCloseBtn').addEventListener('click', () => $('#tdSquadModal').classList.remove('open'));
      $('#tdSquadCancelBtn').addEventListener('click', () => $('#tdSquadModal').classList.remove('open'));
      $('#tdSquadConfirmBtn').addEventListener('click', () => {
        if (draftDeck.length < 1) {
          toast('请至少选择 1 只出战猫咪');
          return;
        }
        deck = draftDeck.slice(0, 4);
        if (window.Store) {
          window.Store.get().tdDeck = deck.slice();
          window.Store.save();
        }
        sfx('build');
        $('#tdSquadModal').classList.remove('open');
        enterBattle(pendingStageIdx);
      });
    }
    renderSelectGrid();
  };

  /* ===== 战斗核心初始化 ===== */
  function expandWaypoints(cells) {
    const full = [cells[0]];
    for (let i = 1; i < cells.length; i++) {
      let [px, py] = full[full.length - 1];
      const [tx, ty] = cells[i];
      while (px !== tx || py !== ty) {
        if (px < tx) px++;
        else if (px > tx) px--;
        else if (py < ty) py++;
        else if (py > ty) py--;
        full.push([px, py]);
      }
    }
    return full;
  }

  function startLevel(idx) {
    curLvlIdx = Math.max(0, Math.min(LEVELS.length - 1, idx));
    const lvl = LEVELS[curLvlIdx];
    const pathCells = expandWaypoints(lvl.path);
    const pathSet = new Set(pathCells.map(([x, y]) => `${x},${y}`));
    const waypoints = pathCells.map(([x, y]) => ({ x: x * TS + TS / 2, y: y * TS + TS / 2 }));

    const obstacles = lvl.obstacles.map((o, i) => ({
      id: 'obs_' + i, x: o.x, y: o.y,
      px: o.x * TS + TS / 2, py: o.y * TS + TS / 2,
      kind: o.kind, hp: o.hp, maxHp: o.hp, drop: o.drop,
      hitFlash: 0
    }));

    const avail = window.Store ? window.Store.getPlayableCats().map((c) => c.id) : ['dajv'];
    deck = getSavedDeck(avail);

    g = {
      lvl,
      pathCells,
      pathSet,
      waypoints,
      obstacles,
      totalObstacles: obstacles.length,
      towers: [],
      enemies: [],
      projectiles: [],
      particles: [],
      floatTexts: [],
      rings: [],
      lasers: [],
      fish: lvl.startFish,
      hp: 10,
      maxHp: 10,
      waveIdx: -1,
      waveState: 'prep',
      prepTimer: 3.0,
      spawnQueue: [],
      spawnTimer: 0,
      targetObj: null,
      selectedCell: null,
      selectedTower: null,
      usedProps: {},
      ultCooldowns: {},
      ultBuffs: { allSpeedEnd: 0, silverEnd: 0 },
      elapsed: 0,
      reviveFreezeUntil: 0,
      bossWarnTimer: 0,
      resumeWaveState: 'clearing',
      shakeTime: 0,
      shakeMag: 0,
      revivedOnce: false
    };

    deck.forEach((id) => { g.ultCooldowns[id] = 2.5; });
    paused = false;
    speedMul = 1;
    $('#tdSpeedBtn').textContent = '1×';
    $('#tdSpeedBtn').classList.remove('fast');
    $('#tdWinModal').classList.remove('open');
    $('#tdLoseModal').classList.remove('open');
    $('#tdPauseModal').classList.remove('open');
    hidePopups();

    $('#tdStageTag').textContent = lvl.id;
    $('#tdLvlDesc').textContent = lvl.desc;
    $('#tdPauseStageName').textContent = lvl.name;

    renderUltBar();
    renderPropBar();
    updateHudStats();
  }

  function hidePopups() {
    $('#tdBuildWheel').classList.remove('open');
    $('#tdTowerMenu').classList.remove('open');
  }

  function renderUltBar() {
    const wrap = $('#tdUltBar');
    wrap.innerHTML = '';
    deck.forEach((id) => {
      const info = getUltUnlockInfo(id);
      const cat = info.cat;
      if (!cat) return;
      const um = ULT_META[id] || { ico: cat.verbIcon, eff: info.skill.name };
      const b = document.createElement('button');
      b.className = 'ult-btn';
      b.dataset.id = id;
      b.title = `${cat.name}大招【${info.skill.name}】：${info.skill.desc}（亲密度Lv.${info.reqLv}解锁，当前Lv.${info.curLv}）`;
      b.innerHTML = `<div class="u-top"><span class="u-ico">${um.ico}</span><span class="u-name">${cat.name}</span></div><span class="u-eff">${um.eff}</span><i class="u-cd"></i>`;
      b.addEventListener('click', () => triggerUltimate(id));
      wrap.appendChild(b);
    });
  }

  function renderPropBar() {
    const bar = $('#tdPropBar');
    if (!bar) return;
    const props = (window.Store && window.Store.get().tdProps) || { fishbag: 0, freeze: 0, bell: 0 };
    const usedMap = (g && g.usedProps) || {};
    const defs = [
      { k: 'fishbag', ico: '🐟', label: '+100鱼' },
      { k: 'freeze', ico: '❄️', label: '全冰冻' },
      { k: 'bell', ico: '🔔', label: '狂热' }
    ];
    bar.innerHTML = `<span class="prop-lbl">道具(限1次)</span>` + defs.map((d) => {
      const cnt = props[d.k] || 0;
      const used = !!usedMap[d.k];
      const cls = used ? 'prop-pill used' : (cnt > 0 ? 'prop-pill' : 'prop-pill empty');
      const tail = used ? '<b>已用完</b>' : `<b>×${cnt}</b>`;
      return `<button class="${cls}" data-prop="${d.k}">${d.ico}${d.label} ${tail}</button>`;
    }).join('');
    bar.querySelectorAll('.prop-pill').forEach((b) => {
      b.addEventListener('click', () => useProp(b.dataset.prop));
    });
  }

  function useProp(key) {
    if (!g || paused || g.waveState === 'ended' || !window.Store) return;
    if (g.usedProps[key]) {
      toast('每局关卡每种道具只能使用 1 次哦！');
      return;
    }
    const st = window.Store.get();
    if ((st.tdProps[key] || 0) <= 0) {
      toast('背包没有该道具啦，可在首页「金币商店 → 道具」购买！');
      return;
    }
    st.tdProps[key] -= 1;
    g.usedProps[key] = true;
    window.Store.save();
    sfx('ult');
    if (key === 'fishbag') {
      g.fish += 100;
      addFloatText(W / 2, 46, '🐟 鲜鱼补给包：+100！', '#2E8B57');
    } else if (key === 'freeze') {
      g.enemies.forEach((e) => {
        e.stunUntil = Math.max(e.stunUntil || 0, g.elapsed + 4.0);
        spawnParticles(e.px, e.py, '#81D4FA', 6);
      });
      addRing(W / 2, H / 2, '#64B5F6', 180);
      addFloatText(W / 2, 46, '❄️ 冰镇猫薄荷：全场冰冻 4 秒！', '#1E88E5');
    } else if (key === 'bell') {
      g.ultBuffs.allSpeedEnd = Math.max(g.ultBuffs.allSpeedEnd || 0, g.elapsed + 8.0);
      g.towers.forEach((t) => addRing(t.px, t.py, '#FFD54F', 36));
      addFloatText(W / 2, 46, '🔔 狂热猫铃铛：攻速翻倍 8 秒！', '#E67E22');
    }
    renderPropBar();
    updateHudStats();
  }

  function updateHudStats() {
    if (!g) return;
    $('#tdFish').textContent = `🐟 ${g.fish}`;
    $('#tdWave').textContent = `🌊 ${Math.max(1, g.waveIdx + 1)}/${g.lvl.waves.length}`;
    $('#tdHp').textContent = `❤️ ${g.hp}`;
    $('#tdObsLeft').textContent = `📦 ${g.obstacles.length}/${g.totalObstacles}`;

    document.querySelectorAll('.ult-btn').forEach((btn) => {
      const id = btn.dataset.id;
      const info = getUltUnlockInfo(id);
      if (!info.unlocked) {
        btn.classList.remove('ready');
        btn.classList.add('ult-locked');
        btn.querySelector('.u-cd').textContent = `🔒Lv.${info.reqLv}解锁`;
        return;
      }
      btn.classList.remove('ult-locked');
      const cd = g.ultCooldowns[id] || 0;
      const ready = cd <= 0 && g.waveState !== 'ended';
      btn.classList.toggle('ready', ready);
      btn.querySelector('.u-cd').textContent = ready ? '可施放!' : `${Math.ceil(cd)}s`;
    });
  }

  /* ===== 建塔 / 升级 / 出售 / 大招 ===== */
  function openBuildWheel(gx, gy) {
    hidePopups();
    g.selectedCell = { x: gx, y: gy };
    g.selectedTower = null;
    const wheel = $('#tdBuildWheel');
    const items = $('#tdBuildItems');
    items.innerHTML = '';

    deck.forEach((id) => {
      const cat = window.CATS.find((c) => c.id === id);
      const canAfford = g.fish >= cat.td.cost;
      const btn = document.createElement('button');
      btn.className = `b-item ${canAfford ? '' : 'poor'}`;
      btn.innerHTML = `<span>${cat.verbIcon}</span><b>${cat.name}</b><span>🐟${cat.td.cost}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (g.fish < cat.td.cost) { toast('鲜鱼点不够啦！点击路边障碍物爆鲜鱼'); return; }
        g.fish -= cat.td.cost;
        const px = gx * TS + TS / 2;
        const py = gy * TS + TS / 2;
        g.towers.push({
          id: 't_' + Date.now() + Math.random(),
          catId: cat.id,
          cat,
          x: gx, y: gy,
          px, py,
          tier: 1,
          cd: 0.2,
          shotCount: 0,
          recoil: 0,
          aimAngle: 0,
          stunUntil: 0,
          spent: cat.td.cost
        });
        addRing(px, py, cat.td.color, 34);
        spawnParticles(px, py, '#FFE082', 7);
        sfx('build');
        g.selectedCell = null;
        hidePopups();
        updateHudStats();
      });
      items.appendChild(btn);
    });

    const cx = gx * TS + TS / 2;
    const cy = gy * TS + TS / 2;
    wheel.style.left = `${Math.max(105, Math.min(W - 105, cx))}px`;
    wheel.style.top = `${cy > H * 0.55 ? cy - 72 : cy + 68}px`;
    wheel.classList.add('open');
  }

  function getTowerUpgradeCost(tower) {
    if (tower.tier === 1) return Math.round(tower.cat.td.cost * 0.9);
    if (tower.tier === 2) return Math.round(tower.cat.td.cost * 1.4);
    if (tower.tier === 3) return Math.round(tower.cat.td.cost * 3.2);
    return 0;
  }

  function getTowerRangePx(t) {
    const tierMul = t.tier >= 4 ? 1.48 : (1 + (t.tier - 1) * 0.14);
    const auraBonus = (t.catId === 'xiaobuding' && t.tier >= 4) ? 1.15 : 1;
    return t.cat.td.range * TS * tierMul * auraBonus;
  }

  function getTowerDmg(t) {
    const dmgMul = t.tier >= 4 ? 2.85 : (1 + (t.tier - 1) * 0.55);
    return Math.round(t.cat.td.dmg * dmgMul);
  }

  function openTowerMenu(tower) {
    hidePopups();
    g.selectedTower = tower;
    g.selectedCell = null;
    const upCost = getTowerUpgradeCost(tower);
    const sellVal = Math.round(tower.spent * 0.75);
    const curIntLv = window.Store ? window.Store.getCatIntimacy(tower.catId).lv : 1;
    const canAscendMax = curIntLv >= 5;

    $('#tmTitle').textContent = tower.tier >= 4
      ? `${tower.cat.name} · Lv MAX 觉醒 (${tower.cat.td.role})`
      : `${tower.cat.name} · Lv${tower.tier} (${tower.cat.td.role})`;
    const upBtn = $('#tmUpgrade');
    upBtn.classList.remove('locked', 'max-btn');
    if (tower.tier >= 4) {
      upBtn.textContent = '👑 已达 Lv MAX';
      upBtn.disabled = true;
    } else if (tower.tier === 3) {
      if (!canAscendMax) {
        upBtn.textContent = `🔒 亲密Lv5升MAX (Lv${curIntLv})`;
        upBtn.classList.add('locked');
        upBtn.disabled = false;
      } else {
        upBtn.textContent = `🌟 升Lv MAX 🐟${upCost}`;
        upBtn.classList.add('max-btn');
        upBtn.disabled = g.fish < upCost;
      }
    } else {
      upBtn.textContent = `⬆️ 升Lv${tower.tier + 1} 🐟${upCost}`;
      upBtn.disabled = g.fish < upCost;
    }
    upBtn.onclick = (e) => {
      e.stopPropagation();
      if (tower.tier >= 4) return;
      if (tower.tier === 3 && !canAscendMax) {
        sfx('ui');
        toast(`🔒「${tower.cat.name}」亲密度需达到 Lv.5（当前 Lv.${curIntLv}）才能从 Lv3 升至 Lv MAX 觉醒技能增幅！`);
        return;
      }
      if (g.fish < upCost) return;
      g.fish -= upCost;
      tower.spent += upCost;
      tower.tier += 1;
      const isMax = tower.tier >= 4;
      addRing(tower.px, tower.py, isMax ? '#FF5EC4' : '#FFD23F', isMax ? 52 : 44);
      spawnParticles(tower.px, tower.py, isMax ? '#FF7AE6' : '#FFD54F', isMax ? 16 : 10);
      addFloatText(tower.px, tower.py - 18, isMax ? '觉醒 Lv MAX！' : `升至Lv${tower.tier}！`, isMax ? '#FF2E93' : '#FF8C00');
      sfx('upgrade');
      hidePopups();
      updateHudStats();
    };

    $('#tmSell').textContent = `🗑️ 撤回 +🐟${sellVal}`;
    $('#tmSell').onclick = (e) => {
      e.stopPropagation();
      g.fish += sellVal;
      g.towers = g.towers.filter((t) => t.id !== tower.id);
      g.selectedTower = null;
      sfx('ui');
      hidePopups();
      updateHudStats();
    };

    const menu = $('#tdTowerMenu');
    menu.style.left = `${Math.max(92, Math.min(W - 92, tower.px))}px`;
    menu.style.top = `${tower.py > H * 0.5 ? tower.py - 64 : tower.py + 56}px`;
    menu.classList.add('open');
  }

  function triggerUltimate(catId) {
    if (!g || paused || g.waveState === 'ended') return;
    const info = getUltUnlockInfo(catId);
    const cat = info.cat;
    if (!info.unlocked) {
      sfx('ui');
      toast(`🔒「${cat.name}」亲密度需达到 Lv.${info.reqLv}（当前 Lv.${info.curLv}）才能施放大招【${info.skill.name}】！`);
      return;
    }
    if ((g.ultCooldowns[catId] || 0) > 0) return;

    g.ultCooldowns[catId] = 15;
    sfx('ult');
    triggerShake(0.24, 3.5);
    addFloatText(W / 2, 46, `${(ULT_META[catId] || {}).ico || cat.verbIcon} ${cat.name}：${info.skill.name}！`, '#FF5C2B');

    switch (catId) {
      case 'dajv': {
        const target = g.enemies[0];
        const tx = target ? target.px : W / 2;
        const ty = target ? target.py : H / 2;
        addRing(tx, ty, '#FF8C42', 110);
        spawnParticles(tx, ty, '#FF9E44', 14);
        damageArea(tx, ty, 110, 150, true, 'dajv');
        g.enemies.forEach((e) => {
          if (Math.hypot(e.px - tx, e.py - ty) <= 110) e.dist = Math.max(0, e.dist - 36);
        });
        break;
      }
      case 'jintiantian':
        g.ultBuffs.allSpeedEnd = g.elapsed + 7;
        g.towers.forEach((t) => addRing(t.px, t.py, '#FFD23F', 34));
        break;
      case 'yinxiaomei':
        g.ultBuffs.silverEnd = g.elapsed + 6;
        g.towers.filter((t) => t.catId === 'yinxiaomei').forEach((t) => addRing(t.px, t.py, '#87CEFA', 40));
        break;
      case 'xiaobuding':
        g.enemies.forEach((e) => {
          e.stunUntil = Math.max(e.stunUntil || 0, g.elapsed + 3.0);
          spawnParticles(e.px, e.py, '#90CAF9', 5);
        });
        addRing(W / 2, H / 2, '#99C2FF', 180);
        break;
      case 'xiaoluo':
        addRing(W / 2, H / 2, '#FF9E44', 200);
        g.enemies.slice().forEach((e) => {
          hurtEnemy(e, 95, 'xiaoluo');
          e.stunUntil = Math.max(e.stunUntil || 0, g.elapsed + 1.5);
        });
        break;
      case 'tangmu':
        [...g.enemies].sort((a, b) => b.hp - a.hp).slice(0, 3).forEach((e) => {
          addRing(e.px, e.py, '#7B93C4', 75);
          spawnParticles(e.px, e.py, '#90CAF9', 9);
          damageArea(e.px, e.py, 75, 130, true, 'tangmu');
          e.stunUntil = Math.max(e.stunUntil || 0, g.elapsed + 1.8);
        });
        break;
      case 'feifei': {
        const top = [...g.enemies].sort((a, b) => b.hp - a.hp)[0];
        if (top) {
          top.stunUntil = Math.max(top.stunUntil || 0, g.elapsed + 4.0);
          top.vulnUntil = g.elapsed + 5.0;
          hurtEnemy(top, 160, 'feifei');
          addRing(top.px, top.py, '#FFB82E', 55);
          spawnParticles(top.px, top.py, '#FFD54F', 10);
        }
        break;
      }
      case 'ali':
        g.enemies.slice().forEach((e, i) => {
          setTimeout(() => {
            if (!g || paused || g.waveState === 'ended') return;
            addRing(e.px, e.py, '#58A45C', 28);
            spawnParticles(e.px, e.py, '#81C784', 6);
            hurtEnemy(e, e.hp < e.maxHp * 0.45 ? 160 : 90, 'ali');
          }, i * 65);
        });
        break;
      case 'wukong': {
        const midY = g.enemies[0] ? g.enemies[0].py : H / 2;
        g.lasers.push({ x1: 0, y1: midY, x2: W, y2: midY, color: '#FFD23F', width: 15, life: 0.45 });
        g.enemies.slice().forEach((e) => { if (Math.abs(e.py - midY) < 68) hurtEnemy(e, 180, 'wukong'); });
        g.obstacles.slice().forEach((o) => { if (Math.abs(o.py - midY) < 68) hurtObstacle(o, 140); });
        break;
      }
    }
    updateHudStats();
  }

  /* ===== 战斗核心更新与粒子/震动 ===== */
  function spawnParticles(x, y, color, count = 6) {
    if (!g) return;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = 45 + Math.random() * 85;
      g.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 12,
        r: 2.2 + Math.random() * 2.5,
        color,
        life: 0.28 + Math.random() * 0.16,
        maxLife: 0.42
      });
    }
  }

  function triggerShake(time, mag) {
    if (!g) return;
    g.shakeTime = Math.max(g.shakeTime, time);
    g.shakeMag = Math.max(g.shakeMag, mag);
  }

  function spawnEnemy(typeKey) {
    const def = ENEMY_TYPES[typeKey];
    const p0 = g.waypoints[0];
    g.enemies.push({
      id: 'e_' + Date.now() + Math.random(),
      type: typeKey,
      def,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      dead: false,
      dist: 0,
      px: p0.x,
      py: p0.y,
      hitFlash: 0,
      hitBump: 0,
      slowUntil: 0,
      poisonUntil: 0,
      poisonDps: 0,
      stunUntil: 0,
      vulnUntil: 0,
      bossPulseTimer: 5.5
    });
    if (typeKey === 'boss') {
      g.bossWarnTimer = 2.8;
      triggerShake(0.35, 3.2);
      sfx('warn');
      addRing(p0.x, p0.y, '#FF3B30', 64);
    }
  }

  function killEnemy(e, sourceCatId) {
    if (!e || e.dead) return;
    e.dead = true;
    e.hp = 0;
    let bonus = e.def.reward;
    if (sourceCatId === 'feifei') bonus = Math.round(bonus * 1.3);
    g.fish += bonus;
    addRing(e.px, e.py, '#FFE082', e.def.isBoss ? 58 : 26);
    spawnParticles(e.px, e.py, e.def.isBoss ? '#FF5252' : '#FFE082', e.def.isBoss ? 18 : 9);
    addFloatText(e.px, e.py - 12, `+${bonus}`, '#FFE047');
    if (e.def.isBoss) triggerShake(0.3, 4.5);
    sfx('kill', !!e.def.isBoss);
    if (g.targetObj && g.targetObj.id === e.id) g.targetObj = null;
    g.enemies = g.enemies.filter((x) => x.id !== e.id);
    updateHudStats();
  }

  function advancePos(dist) {
    const idx = Math.floor(dist / TS);
    const frac = (dist % TS) / TS;
    if (idx >= g.waypoints.length - 1) return { done: true, x: g.waypoints[g.waypoints.length - 1].x, y: g.waypoints[g.waypoints.length - 1].y };
    const a = g.waypoints[idx];
    const b = g.waypoints[idx + 1];
    return { done: false, x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
  }

  function hurtObstacle(obs, dmg) {
    if (obs.hp <= 0) return;
    obs.hp -= dmg;
    obs.hitFlash = 0.12;
    spawnParticles(obs.px, obs.py, '#FFD54F', 4);
    if (obs.hp <= 0) {
      g.obstacles = g.obstacles.filter((o) => o.id !== obs.id);
      if (g.targetObj && g.targetObj.id === obs.id) g.targetObj = null;
      g.fish += obs.drop;
      addRing(obs.px, obs.py, '#FFD23F', 38);
      spawnParticles(obs.px, obs.py, '#FFB300', 12);
      addFloatText(obs.px, obs.py - 10, `+🐟${obs.drop}`, '#FF9500');
      triggerShake(0.14, 2.5);
      sfx('kill', true);
      updateHudStats();
    } else {
      sfx('hit', false);
    }
  }

  function hurtEnemy(e, rawDmg, sourceCatId, isCrit = false) {
    if (!e || e.dead) return;
    const dmg = e.vulnUntil > g.elapsed ? Math.round(rawDmg * 1.5) : rawDmg;
    e.hp -= dmg;
    e.hitFlash = 0.14;
    e.hitBump = 1;
    spawnParticles(e.px, e.py, isCrit ? '#FF7043' : '#FFF176', isCrit ? 7 : 4);

    if (e.hp <= 0) {
      killEnemy(e, sourceCatId);
    } else {
      sfx('hit', isCrit || dmg >= 34);
    }
  }

  function damageArea(cx, cy, radius, dmg, hitObs, sourceCatId) {
    g.enemies.slice().forEach((e) => {
      if (Math.hypot(e.px - cx, e.py - cy) <= radius) hurtEnemy(e, dmg, sourceCatId);
    });
    if (hitObs) {
      g.obstacles.slice().forEach((o) => {
        if (Math.hypot(o.px - cx, o.py - cy) <= radius) {
          hurtObstacle(o, sourceCatId === 'dajv' ? Math.round(dmg * 1.35) : dmg);
        }
      });
    }
  }

  function stepTower(t, dt) {
    if (t.stunUntil > g.elapsed) return;
    if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - dt * 6);

    let haste = 1;
    for (const o of g.towers) {
      if (o.catId === 'jintiantian' && o.id !== t.id && Math.hypot(o.x - t.x, o.y - t.y) <= 1.5) {
        haste = Math.max(haste, 1.25);
      }
    }
    if (g.ultBuffs.allSpeedEnd > g.elapsed) haste *= 1.85;
    if (t.catId === 'yinxiaomei' && g.ultBuffs.silverEnd > g.elapsed) haste *= 2.0;

    t.cd -= dt * haste;
    if (t.cd > 0) return;

    const rangePx = getTowerRangePx(t);
    const dmg = getTowerDmg(t);
    const rate = t.cat.td.rate;
    const isMax = t.tier >= 4;

    let target = null;
    if (g.targetObj) {
      if (g.targetObj.kind === 'enemy') {
        const te = g.enemies.find((e) => e.id === g.targetObj.id);
        if (te && Math.hypot(te.px - t.px, te.py - t.py) <= rangePx) target = { kind: 'enemy', obj: te };
      } else {
        const to = g.obstacles.find((o) => o.id === g.targetObj.id);
        if (to && Math.hypot(to.px - t.px, to.py - t.py) <= rangePx) target = { kind: 'obs', obj: to };
      }
    }
    if (!target) {
      const inRange = g.enemies.filter((e) => Math.hypot(e.px - t.px, e.py - t.py) <= rangePx);
      if (inRange.length > 0) {
        if (t.catId === 'feifei') inRange.sort((a, b) => b.hp - a.hp);
        else inRange.sort((a, b) => b.dist - a.dist);
        target = { kind: 'enemy', obj: inRange[0] };
      }
    }
    if (!target) {
      const obsInRange = g.obstacles.filter((o) => Math.hypot(o.px - t.px, o.py - t.py) <= rangePx);
      if (obsInRange.length > 0) target = { kind: 'obs', obj: obsInRange[0] };
    }
    if (!target) return;

    t.cd = rate;
    t.shotCount += 1;
    t.recoil = 1;
    t.aimAngle = Math.atan2(target.obj.py - t.py, target.obj.px - t.px);
    sfx('shoot', t.catId);

    if (t.catId === 'xiaobuding') {
      addRing(t.px, t.py, isMax ? '#6FA3FF' : '#90B8FF', rangePx);
      const slowDur = isMax ? 2.8 : 2.0;
      const auraDmg = isMax ? Math.round(dmg * 1.25) : dmg;
      g.enemies.slice().forEach((e) => {
        if (Math.hypot(e.px - t.px, e.py - t.py) <= rangePx) {
          e.slowUntil = Math.max(e.slowUntil, g.elapsed + slowDur);
          hurtEnemy(e, auraDmg, 'xiaobuding');
        }
      });
      if (target.kind === 'obs') hurtObstacle(target.obj, auraDmg);
      return;
    }

    if (t.catId === 'xiaoluo') {
      addRing(t.px, t.py, '#FF9E44', rangePx);
      damageArea(t.px, t.py, rangePx, dmg, true, 'xiaoluo');
      if (isMax) {
        setTimeout(() => {
          if (g && !paused && g.waveState !== 'ended') {
            addRing(t.px, t.py, '#FFD23F', rangePx * 0.9);
            damageArea(t.px, t.py, rangePx * 0.9, Math.round(dmg * 0.55), false, 'xiaoluo');
          }
        }, 140);
      }
      return;
    }

    if (t.catId === 'wukong' || t.catId === 'feifei') {
      const tx = target.obj.px, ty = target.obj.py;
      addRing(t.px, t.py, '#FFF59D', 18);
      if (t.catId === 'wukong') {
        const ang = Math.atan2(ty - t.py, tx - t.px);
        const ex = t.px + Math.cos(ang) * (rangePx * 1.45);
        const ey = t.py + Math.sin(ang) * (rangePx * 1.45);
        const beamW = isMax ? 14 : (5 + t.tier * 2);
        const corridor = isMax ? 28 : 22;
        g.lasers.push({ x1: t.px, y1: t.py, x2: ex, y2: ey, color: isMax ? '#FF9800' : '#FFD23F', width: beamW, life: 0.24 });
        g.enemies.slice().forEach((e) => {
          if (pointToSegDist(e.px, e.py, t.px, t.py, ex, ey) < corridor) {
            hurtEnemy(e, dmg, 'wukong');
            if (isMax && !e.dead) {
              e.poisonUntil = Math.max(e.poisonUntil || 0, g.elapsed + 2.5);
              e.poisonDps = Math.max(e.poisonDps || 0, Math.round(dmg * 0.4));
            }
          }
        });
        g.obstacles.slice().forEach((o) => {
          if (pointToSegDist(o.px, o.py, t.px, t.py, ex, ey) < corridor + 2) hurtObstacle(o, dmg);
        });
      } else {
        const critHit = isMax && Math.random() < 0.45;
        const beamDmg = critHit ? Math.round(dmg * 1.6) : dmg;
        g.lasers.push({ x1: t.px, y1: t.py, x2: tx, y2: ty, color: isMax ? '#FFD54F' : '#FFB82E', width: isMax ? 9 : (4 + t.tier), life: 0.20 });
        if (target.kind === 'enemy') {
          if (isMax) target.obj.vulnUntil = Math.max(target.obj.vulnUntil || 0, g.elapsed + 2.5);
          hurtEnemy(target.obj, beamDmg, 'feifei', critHit);
          if (critHit) addFloatText(tx, ty - 14, `破甲暴击 ${beamDmg}!`, '#FF6D00');
        } else {
          hurtObstacle(target.obj, beamDmg);
        }
      }
      return;
    }

    let finalDmg = dmg;
    let crit = false;
    if (t.catId === 'yinxiaomei' && t.shotCount % 5 === 0) {
      finalDmg = Math.round(dmg * 1.8);
      crit = true;
    }
    const pushNeedle = (tgtKind, tgtObj, shotDmg, isCrit, offset = 0) => {
      const sx = t.px + Math.cos(t.aimAngle + Math.PI / 2) * offset;
      const sy = t.py + Math.sin(t.aimAngle + Math.PI / 2) * offset;
      g.projectiles.push({
        catId: t.catId,
        tier: t.tier,
        sx, sy,
        x: sx, y: sy,
        px: sx, py: sy,
        tx: tgtObj.px, ty: tgtObj.py,
        targetKind: tgtKind,
        targetRef: tgtObj,
        speed: t.catId === 'yinxiaomei' ? 430 : (t.catId === 'tangmu' ? 235 : 310),
        progress: 0,
        dmg: shotDmg,
        crit: isCrit,
        bouncesLeft: t.catId === 'ali' ? (isMax ? 5 : 2) : 0,
        hitIds: new Set()
      });
    };
    addRing(t.px + Math.cos(t.aimAngle) * 14, t.py + Math.sin(t.aimAngle) * 14, t.cat.td.color, 14);
    pushNeedle(target.kind, target.obj, finalDmg, crit, 0);
    if (t.catId === 'yinxiaomei' && isMax) {
      const altEnemy = g.enemies.find((e) => e.id !== target.obj.id && Math.hypot(e.px - t.px, e.py - t.py) <= rangePx);
      pushNeedle(altEnemy ? 'enemy' : target.kind, altEnemy || target.obj, Math.round(finalDmg * 0.75), false, 8);
    }
  }

  function pointToSegDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function updateBattle(dt) {
    if (!g || paused || g.waveState === 'ended') return;
    const pace = speedMul === 1 ? 0.90 : 1.60;
    dt *= pace;
    g.elapsed += dt;

    if (g.shakeTime > 0) g.shakeTime = Math.max(0, g.shakeTime - dt);
    if (g.bossWarnTimer > 0) g.bossWarnTimer = Math.max(0, g.bossWarnTimer - dt);

    let cdDirty = false;
    for (const id of deck) {
      if (g.ultCooldowns[id] > 0) {
        g.ultCooldowns[id] = Math.max(0, g.ultCooldowns[id] - dt);
        cdDirty = true;
      }
    }
    if (cdDirty && Math.floor(g.elapsed * 4) !== Math.floor((g.elapsed - dt) * 4)) updateHudStats();

    if (g.waveState === 'prep') {
      g.prepTimer -= dt;
      if (g.prepTimer <= 0) startNextWave();
    } else if (g.waveState === 'spawning') {
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0 && g.spawnQueue.length > 0) {
        const next = g.spawnQueue.shift();
        spawnEnemy(next.type);
        g.spawnTimer = next.gap;
        if (g.spawnQueue.length === 0) g.waveState = 'clearing';
      }
    } else if (g.waveState === 'clearing' && g.enemies.length === 0) {
      if (g.waveIdx >= g.lvl.waves.length - 1) {
        finishWin();
        return;
      }
      g.waveState = 'prep';
      g.prepTimer = 2.6;
    }

    for (const o of g.obstacles) {
      if (o.hitFlash > 0) o.hitFlash = Math.max(0, o.hitFlash - dt);
    }

    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      if (!e || e.dead || e.hp <= 0) {
        killEnemy(e, 'jintiantian');
        continue;
      }
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
      if (e.hitBump > 0) e.hitBump = Math.max(0, e.hitBump - dt * 7);

      if (e.poisonUntil > g.elapsed) {
        e.hp -= e.poisonDps * dt;
        if (e.hp <= 0) { killEnemy(e, 'jintiantian'); continue; }
      }
      if (g.reviveFreezeUntil > g.elapsed || e.stunUntil > g.elapsed) continue;

      let spd = e.speed;
      if (e.slowUntil > g.elapsed) spd *= 0.55;
      if (e.type === 'dog' && Math.sin(g.elapsed * 2.8) > 0.72) spd *= 1.45;

      if (e.def.isBoss) {
        e.bossPulseTimer -= dt;
        if (e.bossPulseTimer <= 0) {
          e.bossPulseTimer = 7.0;
          addRing(e.px, e.py, '#FF4444', 100);
          triggerShake(0.22, 3.0);
          addFloatText(e.px, e.py - 20, '🌀 吸尘震晕!', '#FF3B30');
          g.towers.forEach((t) => {
            if (Math.hypot(t.px - e.px, t.py - e.py) <= 105) t.stunUntil = g.elapsed + 1.8;
          });
        }
      }

      e.dist += spd * dt;
      const pos = advancePos(e.dist);
      e.px = pos.x;
      e.py = pos.y;
      if (pos.done) {
        g.enemies.splice(i, 1);
        g.hp = Math.max(0, g.hp - (e.def.isBoss ? 5 : 1));
        addRing(pos.x, pos.y, '#FF4444', 36);
        triggerShake(0.22, 3.8);
        sfx('hit', true);
        updateHudStats();
        if (g.hp <= 0) {
          finishLose();
          return;
        }
      }
    }

    for (const t of g.towers) stepTower(t, dt);

    for (let i = g.projectiles.length - 1; i >= 0; i--) {
      const p = g.projectiles[i];
      p.px = p.x; p.py = p.y;
      const tx = p.targetRef && p.targetRef.hp > 0 ? p.targetRef.px : p.tx;
      const ty = p.targetRef && p.targetRef.hp > 0 ? p.targetRef.py : p.ty;
      p.tx = tx; p.ty = ty;
      const dx = tx - p.x, dy = ty - p.y;
      const dist = Math.hypot(dx, dy);
      const totalDist = Math.max(1, Math.hypot(tx - p.sx, ty - p.sy));
      p.progress = Math.min(1, 1 - dist / totalDist);
      if (dist <= p.speed * dt + 8) {
        onProjectileHit(p);
        g.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    g.particles = g.particles.filter((pt) => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 120 * dt;
      pt.life -= dt;
      return pt.life > 0;
    });
    g.rings = g.rings.filter((r) => { r.r += r.maxR * dt * 3.4; r.alpha -= dt * 2.6; return r.alpha > 0; });
    g.lasers = g.lasers.filter((l) => { l.life -= dt; return l.life > 0; });
    g.floatTexts = g.floatTexts.filter((f) => { f.y -= 26 * dt; f.life -= dt; return f.life > 0; });
  }

  function onProjectileHit(p) {
    const isMax = p.tier >= 4;
    if (p.catId === 'dajv') {
      const r = isMax ? 68 : 44;
      addRing(p.tx, p.ty, isMax ? '#FFD23F' : '#FF8C42', r);
      spawnParticles(p.tx, p.ty, isMax ? '#FFD54F' : '#FFA726', isMax ? 12 : 8);
      triggerShake(0.09, isMax ? 2.4 : 1.8);
      damageArea(p.tx, p.ty, r, p.dmg, true, 'dajv');
      return;
    }
    if (p.catId === 'tangmu') {
      const r = isMax ? 78 : 52;
      const stunDur = isMax ? 1.6 : 0.85;
      addRing(p.tx, p.ty, isMax ? '#5C85E6' : '#7B93C4', r);
      spawnParticles(p.tx, p.ty, '#90CAF9', isMax ? 14 : 10);
      triggerShake(0.11, isMax ? 2.8 : 2.2);
      damageArea(p.tx, p.ty, r, p.dmg, true, 'tangmu');
      g.enemies.forEach((e) => {
        if (Math.hypot(e.px - p.tx, e.py - p.ty) <= r) e.stunUntil = Math.max(e.stunUntil, g.elapsed + stunDur);
      });
      return;
    }

    if (p.targetKind === 'obs') {
      if (p.targetRef && p.targetRef.hp > 0) hurtObstacle(p.targetRef, p.dmg);
      return;
    }

    const e = p.targetRef;
    if (e && e.hp > 0) {
      if (p.crit) {
        addFloatText(e.px, e.py - 14, `暴击 ${p.dmg}!`, '#FF5500');
        triggerShake(0.08, 1.6);
      }
      if (p.catId === 'jintiantian') {
        e.poisonUntil = g.elapsed + 3.0;
        e.poisonDps = (10 + p.tier * 6) * (isMax ? 2 : 1);
        e.slowUntil = Math.max(e.slowUntil, g.elapsed + 1.5);
      }
      hurtEnemy(e, p.dmg, p.catId, p.crit);
      if (p.catId === 'ali' && p.bouncesLeft > 0) {
        p.hitIds.add(e.id);
        const next = g.enemies.find((x) => !p.hitIds.has(x.id) && Math.hypot(x.px - p.tx, x.py - p.ty) <= 125);
        if (next) {
          g.projectiles.push({
            catId: 'ali', tier: p.tier, sx: p.tx, sy: p.ty, x: p.tx, y: p.ty, px: p.tx, py: p.ty, tx: next.px, ty: next.py,
            targetKind: 'enemy', targetRef: next, speed: 340, progress: 0,
            dmg: Math.round(p.dmg * (next.hp < next.maxHp * 0.5 ? 1.25 : 0.9)),
            bouncesLeft: p.bouncesLeft - 1, hitIds: p.hitIds
          });
        }
      }
    }
  }

  function startNextWave() {
    g.waveIdx += 1;
    const w = g.lvl.waves[g.waveIdx];
    g.spawnQueue = [];
    w.forEach((grp) => {
      for (let i = 0; i < grp.count; i++) g.spawnQueue.push({ type: grp.type, gap: grp.gap });
    });
    g.waveState = 'spawning';
    g.spawnTimer = 0.25;
    updateHudStats();
  }

  function finishWin() {
    g.waveState = 'ended';
    sfx('win');
    const fullHp = g.hp === g.maxHp;
    const allCleared = g.obstacles.length === 0;
    const stars = 1 + (fullHp ? 1 : 0) + (fullHp && allCleared ? 1 : 0);

    let unlockedSilverMsg = '';
    if (window.Store) {
      const st = window.Store.get();
      const isFirst = !st.tdStars[g.lvl.id];
      st.tdStars[g.lvl.id] = Math.max(st.tdStars[g.lvl.id] || 0, stars);
      const goldGain = isFirst ? g.lvl.rewardGold : Math.round(g.lvl.rewardGold * 0.35);
      window.Store.addGold(goldGain);
      deck.forEach((id) => window.Store.addIntimacy(id, 15 + (stars === 3 ? 5 : 0)));
      if (g.lvl.unlockSilver && window.Store.unlockCat('yinxiaomei')) {
        unlockedSilverMsg = ' · 🎀 解锁新猫「银小妹」!';
      }
      $('#tdWinRewards').textContent = `🪙 +${goldGain} 金币 · ❤️ 出战猫亲密度 +${15 + (stars === 3 ? 5 : 0)}${unlockedSilverMsg}`;
    }

    $('#tdWinTitle').textContent = g.lvl.unlockSilver ? '🎉 成功救出银小妹！' : `🎉 ${g.lvl.name} 胜利！`;
    $('#tdWinStars').innerHTML = [1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('');
    $('#tdWinChecks').innerHTML =
      `<div>✅ 小奶猫安全（❤️ ${g.hp}/${g.maxHp}）</div>` +
      `<div>${fullHp ? '✅' : '⬜'} 满血守护小猫</div>` +
      `<div>${allCleared ? '✅' : '⬜'} 障碍物全清（剩 ${g.obstacles.length} 个）</div>`;
    $('#tdNextBtn').style.display = curLvlIdx < LEVELS.length - 1 ? 'inline-block' : 'none';
    renderSelectGrid();
    $('#tdWinModal').classList.add('open');
  }

  function finishLose() {
    g.resumeWaveState = (g.spawnQueue && g.spawnQueue.length > 0) ? 'spawning' : 'clearing';
    g.waveState = 'ended';
    sfx('lose');
    $('#tdReviveBtn').style.display = g.revivedOnce ? 'none' : 'inline-block';
    $('#tdLoseModal').classList.add('open');
  }

  function addRing(x, y, color, maxR) { g.rings.push({ x, y, r: 6, maxR, color, alpha: 0.9 }); }
  function addFloatText(x, y, text, color) { g.floatTexts.push({ x, y, text, color, life: 1.0 }); }

  /* ===== Canvas 渲染（精细地图、打击感与弹性动作） ===== */
  function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawEnemySprite(e) {
    const bob = Math.sin(g.elapsed * (e.def.isBoss ? 5 : 9) + e.dist * 0.1) * (e.def.isBoss ? 1.8 : 1.3);
    const hitSx = 1 + e.hitBump * 0.18;
    const hitSy = 1 - e.hitBump * 0.14;
    ctx.save();
    ctx.translate(e.px, e.py + bob);
    ctx.scale(hitSx, hitSy);

    const flash = e.hitFlash > 0;
    const stroke = '#3A2318';

    switch (e.type) {
      case 'mouse': {
        // 调皮鼠：圆鼓灰身 + 粉耳 + 胡须 + 粉长尾
        ctx.strokeStyle = '#FF9EB5'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-10, 4); ctx.quadraticCurveTo(-20, 0, -18, -8); ctx.stroke();
        ctx.fillStyle = flash ? '#FFFFFF' : '#96A3B8'; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(-7, -10, 6, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(7, -10, 6, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFB3C1';
        ctx.beginPath(); ctx.ellipse(-7, -10, 3.4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(7, -10, 3.4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = flash ? '#FFFFFF' : '#A9B6CA';
        ctx.beginPath(); ctx.ellipse(0, 1, 12, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E8EEF5';
        ctx.beginPath(); ctx.ellipse(0, 4, 7.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2B2129';
        ctx.beginPath(); ctx.arc(-4.2, -1, 1.8, 0, Math.PI * 2); ctx.arc(4.2, -1, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF6B8B';
        ctx.beginPath(); ctx.arc(0, 2, 2.2, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'dog': {
        // 小黄狗：橘棕体色 + 下垂深棕大耳 + 红项圈
        ctx.fillStyle = flash ? '#FFFFFF' : '#854B22'; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(-11, -3, 4.5, 9, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(11, -3, 4.5, 9, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = flash ? '#FFFFFF' : '#F4AC4B';
        ctx.beginPath(); ctx.ellipse(0, 1, 13.5, 11.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFF4DC';
        ctx.beginPath(); ctx.ellipse(0, 4.5, 8, 5.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E53935';
        ctx.fillRect(-9, 8, 18, 3.5);
        ctx.fillStyle = '#FFD54F'; ctx.beginPath(); ctx.arc(0, 10.5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2B2129';
        ctx.beginPath(); ctx.arc(-4.5, -2, 2.1, 0, Math.PI * 2); ctx.arc(4.5, -2, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3A2318';
        ctx.beginPath(); ctx.ellipse(0, 2.5, 2.8, 2, 0, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'vacuum': {
        // 扫地机：金属蓝圆盘 + 旋转边刷 + 红色探测眼
        const spin = g.elapsed * 7;
        ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const a = spin + k * 2.1;
          ctx.beginPath(); ctx.moveTo(-12, 5); ctx.lineTo(-12 + Math.cos(a) * 6, 5 + Math.sin(a) * 6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(12, 5); ctx.lineTo(12 - Math.cos(a) * 6, 5 + Math.sin(a) * 6); ctx.stroke();
        }
        ctx.fillStyle = flash ? '#FFFFFF' : '#3C5A82'; ctx.strokeStyle = '#1E2F47'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.ellipse(0, 3, 15.5, 9.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = flash ? '#FFFFFF' : '#7DB5EA';
        ctx.beginPath(); ctx.ellipse(0, 0, 13.5, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#A8F5FF'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = Math.sin(g.elapsed * 10) > 0 ? '#FF3B30' : '#FF8A80';
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'fatcat': {
        // 恶霸猫：壮实炭黑猫 + 墨镜 + 金链条
        ctx.fillStyle = flash ? '#FFFFFF' : '#4E4752'; ctx.strokeStyle = stroke; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(-14, -17); ctx.lineTo(-4, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(14, -17); ctx.lineTo(4, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 1, 16, 13.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#F2E7D8';
        ctx.beginPath(); ctx.ellipse(0, 6, 9.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        // 墨镜
        ctx.fillStyle = '#191922'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.6;
        ctx.fillRect(-12, -6, 10, 6.5); ctx.fillRect(2, -6, 10, 6.5); ctx.fillRect(-2, -4.5, 4, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-10, -5, 3, 2); ctx.fillRect(4, -5, 3, 2);
        // 金项链
        ctx.strokeStyle = '#FFC107'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, 7, 9, 0.35, Math.PI - 0.35); ctx.stroke();
        break;
      }
      case 'boss': {
        // 吸尘Boss：大型红紫装甲魔王 + 旋转涡轮 + 尖角皇冠 + 怒目护目镜
        const pulse = 0.5 + 0.5 * Math.sin(g.elapsed * 8);
        ctx.strokeStyle = `rgba(255, 59, 48, ${0.4 + pulse * 0.45})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 11, 26 + pulse * 3, 9, 0, 0, Math.PI * 2); ctx.stroke();

        // 吸尘金属吸嘴与涡轮管
        ctx.fillStyle = '#5B6C82'; ctx.strokeStyle = '#232C3B'; ctx.lineWidth = 2.2;
        ctx.fillRect(10, 3, 14, 7); ctx.strokeRect(10, 3, 14, 7);
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(21, 0, 5, 13); ctx.strokeRect(21, 0, 5, 13);

        // 魔王厚重车身
        ctx.fillStyle = flash ? '#FFFFFF' : '#7D1E3A'; ctx.strokeStyle = '#380916'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(0, 2, 22, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = flash ? '#FFFFFF' : '#CE3959';
        ctx.beginPath(); ctx.ellipse(0, -3, 19, 12.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // 魔王金冠天线
        ctx.fillStyle = '#FFD54F'; ctx.strokeStyle = '#8F5B00'; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-10, -13); ctx.lineTo(-12, -23); ctx.lineTo(-4, -17);
        ctx.lineTo(0, -25); ctx.lineTo(4, -17); ctx.lineTo(12, -23); ctx.lineTo(10, -13);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // 红色警戒灯
        ctx.fillStyle = pulse > 0.5 ? '#FF1744' : '#FF8A80';
        ctx.beginPath(); ctx.arc(0, -25, 3.2, 0, Math.PI * 2); ctx.fill();

        // 怒目深色面罩 + 发光黄眼
        ctx.fillStyle = '#23141E';
        drawRoundRect(-13, -7, 26, 9, 4); ctx.fill();
        ctx.fillStyle = '#FFE047';
        ctx.beginPath();
        ctx.moveTo(-10, -5); ctx.lineTo(-3, -2); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -5); ctx.lineTo(3, -2); ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();

        // 底部炫光涡轮环
        ctx.strokeStyle = '#FF9E80'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 7, 6, g.elapsed * 6, g.elapsed * 6 + Math.PI * 1.3); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function drawBoard() {
    if (!g || !ctx) return;
    ctx.save();
    if (g.shakeTime > 0) {
      const sx = (Math.random() - 0.5) * g.shakeMag * 2;
      const sy = (Math.random() - 0.5) * g.shakeMag * 2;
      ctx.translate(sx, sy);
    }
    ctx.clearRect(-8, -8, W + 16, H + 16);

    // 1. 棋盘草地与立体石板路
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const px = x * TS, py = y * TS;
        const isPath = g.pathSet.has(`${x},${y}`);
        if (isPath) {
          ctx.fillStyle = '#C99B67';
          ctx.fillRect(px, py, TS, TS);
          ctx.fillStyle = (x + y) % 2 === 0 ? '#F6E1BC' : '#EED4A6';
          drawRoundRect(px + 2, py + 2, TS - 4, TS - 4, 8);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
          ctx.fillRect(px + 8, py + 6, TS - 16, 4);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#9ED96F' : '#92CE63';
          ctx.fillRect(px, py, TS, TS);
          // 草丛微装饰
          if ((x * 7 + y * 13) % 5 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 220, 0.35)';
            ctx.beginPath(); ctx.arc(px + 14, py + 16, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 19, py + 14, 1.8, 0, Math.PI * 2); ctx.fill();
          }
          ctx.strokeStyle = 'rgba(70,120,35,0.08)';
          ctx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        }
      }
    }

    // 路径方向小足印指引
    ctx.fillStyle = 'rgba(170,115,60,0.28)';
    for (let i = 0; i < g.waypoints.length - 1; i += 2) {
      const a = g.waypoints[i], b = g.waypoints[i + 1];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(6, 0); ctx.lineTo(-4, -5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 5); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 出怪口洞穴 & 终点守护猫窝
    const sp = g.waypoints[0];
    ctx.fillStyle = '#73452A';
    drawRoundRect(sp.x - 19, sp.y - 18, 38, 28, 12);
    ctx.fill();
    ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#FFE8B0'; ctx.textAlign = 'center';
    ctx.fillText('出怪口', sp.x, sp.y - 4);
    ctx.fillText('⬇️', sp.x, sp.y + 13);

    const ep = g.waypoints[g.waypoints.length - 1];
    ctx.fillStyle = 'rgba(255,248,230,0.95)';
    ctx.beginPath(); ctx.arc(ep.x, ep.y, 23, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FF8A4C'; ctx.lineWidth = 3; ctx.stroke();
    const goalImg = g.lvl.unlockSilver ? getCatImg('yinxiaomei') : null;
    if (goalImg && goalImg.complete) {
      ctx.drawImage(goalImg, ep.x - 21, ep.y - 23, 42, 46);
    } else {
      ctx.font = '25px sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillText('🐱', ep.x, ep.y + 1);
    }
    ctx.fillStyle = '#FFF';
    drawRoundRect(ep.x - 17, ep.y + 15, 34, 14, 7); ctx.fill();
    ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#E04848';
    ctx.fillText(`❤️${g.hp}`, ep.x, ep.y + 22);

    // 2. 选中范围预览
    if (g.selectedTower) {
      const t = g.selectedTower;
      const r = getTowerRangePx(t);
      ctx.fillStyle = t.tier >= 4 ? 'rgba(255, 116, 198, 0.18)' : 'rgba(255, 224, 130, 0.22)';
      ctx.beginPath(); ctx.arc(t.px, t.py, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = t.tier >= 4 ? 'rgba(230, 46, 138, 0.85)' : 'rgba(255, 145, 35, 0.85)'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (g.selectedCell) {
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 3;
      drawRoundRect(g.selectedCell.x * TS + 3, g.selectedCell.y * TS + 3, TS - 6, TS - 6, 8);
      ctx.stroke();
    }

    // 3. 路边障碍物
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const o of g.obstacles) {
      ctx.fillStyle = 'rgba(40,65,20,0.22)';
      ctx.beginPath(); ctx.ellipse(o.px, o.py + 16, 17, 7, 0, 0, Math.PI * 2); ctx.fill();
      const bump = o.hitFlash > 0 ? 1.12 : 1;
      ctx.save();
      ctx.translate(o.px, o.py);
      ctx.scale(bump, bump);
      ctx.font = '28px sans-serif';
      ctx.fillText(OBS_ICONS[o.kind] || '📦', 0, 0);
      ctx.restore();
      if (o.hitFlash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath(); ctx.arc(o.px, o.py, 15, 0, Math.PI * 2); ctx.fill();
      }
      if (o.hp < o.maxHp) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; drawRoundRect(o.px - 17, o.py - 24, 34, 5, 2); ctx.fill();
        ctx.fillStyle = '#FFD23F'; drawRoundRect(o.px - 17, o.py - 24, 34 * Math.max(0, o.hp / o.maxHp), 5, 2); ctx.fill();
      }
      if (g.targetObj && g.targetObj.id === o.id) drawReticle(o.px, o.py);
    }

    // 4. 猫咪防御塔（立体底座 + 发射弹性后坐）
    for (const t of g.towers) {
      const isMax = t.tier >= 4;
      ctx.fillStyle = 'rgba(45,75,20,0.2)';
      ctx.beginPath(); ctx.ellipse(t.px, t.py + 18, 21, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isMax ? '#FFF0FA' : (t.tier === 3 ? '#FFF4C7' : '#FFF9EC');
      ctx.beginPath(); ctx.ellipse(t.px, t.py + 15, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = isMax ? '#FF3D9A' : (t.tier === 3 ? '#FFB300' : t.cat.td.color);
      ctx.lineWidth = t.tier >= 2 ? 3 : 2.4; ctx.stroke();

      const img = getCatImg(t.catId);
      const kick = Math.sin(t.recoil * Math.PI);
      const scaleX = 1 + (t.tier - 1) * 0.08 + kick * 0.14;
      const scaleY = 1 + (t.tier - 1) * 0.08 - kick * 0.10;
      const ox = Math.cos(t.aimAngle) * kick * 4;
      const oy = Math.sin(t.aimAngle) * kick * 4;

      ctx.save();
      ctx.translate(t.px + ox, t.py + oy);
      ctx.scale(scaleX, scaleY);
      const sz = 44;
      if (img && img.complete) {
        ctx.drawImage(img, -sz / 2, -sz / 2 - 4, sz, sz * 1.09);
      } else {
        ctx.font = '24px sans-serif'; ctx.fillText(t.cat.verbIcon, 0, 0);
      }
      ctx.restore();

      ctx.font = 'bold 9.5px sans-serif'; ctx.fillStyle = isMax ? '#E62E8A' : '#E67E22';
      ctx.fillText(isMax ? '★★★👑' : '★'.repeat(t.tier), t.px, t.py + 21);

      // 细小清晰的炮塔等级标签 (Lv1 / Lv2 / Lv3 / Lv MAX)
      const lx = isMax ? (t.px + 12) : (t.px + 13);
      const ly = t.py - 19;
      const bw = isMax ? 31 : 22;
      ctx.save();
      ctx.fillStyle = isMax ? '#E62E8A' : (t.tier === 3 ? '#FFB300' : (t.tier === 2 ? '#29B6F6' : 'rgba(54, 34, 22, 0.82)'));
      drawRoundRect(lx - bw / 2, ly - 5.5, bw, 11, 4);
      ctx.fill();
      ctx.strokeStyle = isMax ? '#FFE57F' : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = t.tier === 3 ? '#4A2500' : '#FFFFFF';
      ctx.font = isMax ? 'bold 7.2px sans-serif' : 'bold 8px sans-serif';
      ctx.fillText(isMax ? 'Lv MAX' : `Lv${t.tier}`, lx, ly + 0.5);
      ctx.restore();

      if (t.stunUntil > g.elapsed) {
        ctx.font = '14px sans-serif'; ctx.fillText('💫', t.px, t.py - 20);
      }
    }

    // 5. 高清矢量怪物（受击闪白 + 挤压弹跳 + 状态环 + 醒目 Boss 血条与标签）
    for (const e of g.enemies) {
      ctx.fillStyle = e.def.isBoss ? 'rgba(90,0,0,0.34)' : 'rgba(0,0,0,0.26)';
      ctx.beginPath(); ctx.ellipse(e.px, e.py + (e.def.isBoss ? 17 : 13), e.def.radius * 0.96, e.def.isBoss ? 7 : 5, 0, 0, Math.PI * 2); ctx.fill();
      if (e.slowUntil > g.elapsed) {
        ctx.strokeStyle = '#64B5F6'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(e.px, e.py, e.def.radius + 4, 0, Math.PI * 2); ctx.stroke();
      }
      drawEnemySprite(e);

      const bw = e.def.isBoss ? 54 : 30;
      const bh = e.def.isBoss ? 7 : 5;
      const barY = e.def.isBoss ? e.py - 32 : e.py - 22;
      const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));
      ctx.fillStyle = 'rgba(0,0,0,0.68)'; drawRoundRect(e.px - bw / 2 - 1, barY - 1, bw + 2, bh + 2, 3); ctx.fill();
      if (ratio > 0) {
        ctx.fillStyle = e.def.isBoss ? '#FF3547' : '#57D163';
        drawRoundRect(e.px - bw / 2, barY, Math.max(2, bw * ratio), bh, 2); ctx.fill();
      }
      if (e.def.isBoss) {
        ctx.fillStyle = '#B71C1C';
        drawRoundRect(e.px - 22, barY - 14, 44, 12, 6); ctx.fill();
        ctx.fillStyle = '#FFE47A'; ctx.font = 'bold 8.5px sans-serif';
        ctx.fillText('👑 BOSS', e.px, barY - 8);
      }
      if (g.reviveFreezeUntil > g.elapsed || e.stunUntil > g.elapsed) {
        ctx.font = '13px sans-serif'; ctx.fillText(g.reviveFreezeUntil > g.elapsed ? '⏸️' : '💤', e.px + (e.def.isBoss ? 18 : 11), barY + 2);
      }
      if (g.targetObj && g.targetObj.id === e.id) drawReticle(e.px, e.py);
    }

    // 6. 多层发光激光、波纹、带拖尾飞行弹道与打击粒子
    for (const l of g.lasers) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = l.color; ctx.lineWidth = l.width + 4; ctx.globalAlpha = 0.38;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
      ctx.strokeStyle = '#FFFDE7'; ctx.lineWidth = Math.max(2, l.width * 0.45); ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
      ctx.restore();
    }
    for (const r of g.rings) {
      ctx.save(); ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.strokeStyle = r.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    for (const p of g.projectiles) {
      const arcLift = p.catId === 'tangmu' || p.catId === 'dajv' ? Math.sin(p.progress * Math.PI) * 18 : 0;
      const py = p.y - arcLift;
      // 弹道拖尾
      ctx.save();
      ctx.strokeStyle = p.crit ? '#FF5722' : (p.catId === 'yinxiaomei' ? '#4FC3F7' : (p.catId === 'ali' ? '#66BB6A' : '#FFCA28'));
      ctx.lineWidth = p.crit ? 4 : 2.8;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py - arcLift);
      ctx.lineTo(p.x, py);
      ctx.stroke();
      ctx.restore();

      ctx.font = p.crit ? '18px sans-serif' : '15px sans-serif';
      const icon = p.catId === 'dajv' ? '📦' : p.catId === 'tangmu' ? '☕' : p.catId === 'ali' ? '🍃' : p.catId === 'jintiantian' ? '💧' : (p.crit ? '💫' : '✨');
      ctx.fillText(icon, p.x, py);
    }
    for (const pt of g.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // 7. 飘字
    ctx.font = 'bold 12px sans-serif';
    for (const f of g.floatTexts) {
      ctx.save(); ctx.globalAlpha = Math.max(0, f.life);
      ctx.strokeStyle = 'rgba(50,25,10,0.65)'; ctx.lineWidth = 3; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    if (g.bossWarnTimer > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(g.elapsed * 14);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 36, 36, ${0.42 + pulse * 0.48})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      ctx.fillStyle = `rgba(210, 20, 20, ${0.78 + pulse * 0.16})`;
      drawRoundRect(W / 2 - 134, 40, 268, 34, 14); ctx.fill();
      ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
      drawRoundRect(W / 2 - 134, 40, 268, 34, 14); ctx.stroke();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🚨 红色预警：吸尘Boss 强袭来袭！ 🚨', W / 2, 57);
      ctx.restore();
    }

    if (g.reviveFreezeUntil > g.elapsed) {
      ctx.fillStyle = 'rgba(25, 70, 140, 0.82)';
      drawRoundRect(W / 2 - 96, 8, 192, 24, 12); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 11.5px sans-serif';
      ctx.fillText(`⏸️ 复活定身：全怪暂停 ${Math.max(0.1, g.reviveFreezeUntil - g.elapsed).toFixed(1)}s`, W / 2, 20);
    } else if (g.waveState === 'prep') {
      ctx.fillStyle = 'rgba(50,30,15,0.68)';
      drawRoundRect(W / 2 - 92, 8, 184, 24, 12); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 11.5px sans-serif';
      ctx.fillText(`第 ${g.waveIdx + 2} 波即将到来 (${Math.ceil(g.prepTimer)}s)`, W / 2, 20);
    }

    ctx.restore();
  }

  function drawReticle(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(g.elapsed * 3);
    ctx.strokeStyle = '#FF3B30'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-14, 0); ctx.moveTo(14, 0); ctx.lineTo(22, 0);
    ctx.moveTo(0, -22); ctx.lineTo(0, -14); ctx.moveTo(0, 14); ctx.lineTo(0, 22); ctx.stroke();
    ctx.restore();
  }

  function handleCanvasTap(e) {
    if (!g || paused || g.waveState === 'ended') return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);

    const hitEnemy = g.enemies.find((en) => Math.hypot(en.px - x, en.py - y) <= 24);
    if (hitEnemy) {
      g.targetObj = { kind: 'enemy', id: hitEnemy.id };
      sfx('ui');
      hidePopups();
      return;
    }

    const gx = Math.floor(x / TS);
    const gy = Math.floor(y / TS);
    if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;

    const hitObs = g.obstacles.find((o) => o.x === gx && o.y === gy);
    if (hitObs) {
      g.targetObj = { kind: 'obs', id: hitObs.id };
      sfx('ui');
      hidePopups();
      toast('🎯 猫塔将优先敲碎这个障碍物！');
      return;
    }

    const hitTower = g.towers.find((t) => t.x === gx && t.y === gy);
    if (hitTower) {
      sfx('ui');
      openTowerMenu(hitTower);
      return;
    }

    if (g.pathSet.has(`${gx},${gy}`)) {
      hidePopups();
      g.selectedCell = null;
      g.selectedTower = null;
      return;
    }
    sfx('ui');
    openBuildWheel(gx, gy);
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastFrameTs) / 1000);
    lastFrameTs = now;
    if ($('#view-td').classList.contains('active')) {
      updateBattle(dt);
      drawBoard();
    }
    rafId = requestAnimationFrame(loop);
  }

  /* ===== 战局暂停 / 设置（自动暂停 + 仅重来/回大厅 + 二次确认） ===== */
  function openPauseModal() {
    if (!g || g.waveState === 'ended') return;
    paused = true;
    pendingConfirm = null;
    $('#tdPauseMain').style.display = 'block';
    $('#tdPauseConfirm').style.display = 'none';
    $('#tdPauseModal').classList.add('open');
  }

  function closePauseModal() {
    $('#tdPauseModal').classList.remove('open');
    if (g && g.waveState !== 'ended') paused = false;
  }

  function askConfirm(action) {
    pendingConfirm = action;
    $('#tdPauseMain').style.display = 'none';
    $('#tdPauseConfirm').style.display = 'block';
    if (action === 'restart') {
      $('#tdConfirmTitle').textContent = '🔄 确认重新开始？';
      $('#tdConfirmMsg').textContent = '当前关卡所有防御塔和波次进度将清空并从第 1 波重新开始。';
    } else {
      $('#tdConfirmTitle').textContent = '🏠 确认返回大厅？';
      $('#tdConfirmMsg').textContent = '确定返回游戏首页大厅吗？当前尚未通关的战局进度将不会保存。';
    }
  }

  function bindUI() {
    if (uiBound) return;
    uiBound = true;
    canvas = $('#tdCanvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    canvas.addEventListener('click', handleCanvasTap);
    $('#tdSpeedBtn').addEventListener('click', () => {
      sfx('ui');
      speedMul = speedMul === 1 ? 2 : 1;
      $('#tdSpeedBtn').textContent = `${speedMul}×`;
      $('#tdSpeedBtn').classList.toggle('fast', speedMul > 1);
    });

    $('#tdSettingsBtn').addEventListener('click', () => { sfx('ui'); openPauseModal(); });
    $('#tdPauseCloseBtn').addEventListener('click', closePauseModal);
    $('#tdResumeBtn').addEventListener('click', closePauseModal);
    $('#tdPauseRestartBtn').addEventListener('click', () => askConfirm('restart'));
    $('#tdPauseLobbyBtn').addEventListener('click', () => askConfirm('lobby'));
    $('#tdConfirmCancel').addEventListener('click', () => {
      $('#tdPauseConfirm').style.display = 'none';
      $('#tdPauseMain').style.display = 'block';
      pendingConfirm = null;
    });
    $('#tdConfirmOk').addEventListener('click', () => {
      const act = pendingConfirm;
      pendingConfirm = null;
      $('#tdPauseModal').classList.remove('open');
      if (act === 'restart') {
        startLevel(curLvlIdx);
      } else if (act === 'lobby') {
        paused = true;
        if (window.switchDemoView) window.switchDemoView('lobby');
      }
    });

    $('#tdWinSelectBtn').addEventListener('click', () => {
      $('#tdWinModal').classList.remove('open');
      if (window.switchDemoView) window.switchDemoView('td-select');
    });
    $('#tdReplayBtn').addEventListener('click', () => startLevel(curLvlIdx));
    $('#tdNextBtn').addEventListener('click', () => startLevel(curLvlIdx + 1));

    $('#tdLoseSelectBtn').addEventListener('click', () => {
      $('#tdLoseModal').classList.remove('open');
      if (window.switchDemoView) window.switchDemoView('td-select');
    });
    $('#tdLoseRetry').addEventListener('click', () => startLevel(curLvlIdx));
    $('#tdReviveBtn').addEventListener('click', () => {
      g.revivedOnce = true;
      g.hp = g.maxHp;
      g.waveState = g.resumeWaveState || 'clearing';
      g.reviveFreezeUntil = g.elapsed + 5.0;
      g.enemies.forEach((e) => {
        e.dist = Math.max(0, e.dist - 60);
        const pos = advancePos(e.dist);
        e.px = pos.x;
        e.py = pos.y;
        e.stunUntil = Math.max(e.stunUntil || 0, g.elapsed + 5.0);
        spawnParticles(e.px, e.py, '#81D4FA', 6);
      });
      addRing(W / 2, H / 2, '#64B5F6', 190);
      addFloatText(W / 2, 46, '📺 复活护盾：全怪暂停行动 5 秒！', '#1E88E5');
      sfx('ult');
      if (window.Store) {
        const res = window.Store.recordAd();
        if (res.unlockedTom) toast('🎉 累计看满10次广告，解锁「汤姆（蓝白猫）」！');
      }
      $('#tdLoseModal').classList.remove('open');
      updateHudStats();
    });
  }

  window.initTdDemo = function (levelIdx) {
    if (!canvas) bindUI();
    startLevel(typeof levelIdx === 'number' ? levelIdx : curLvlIdx);
    if (!rafId) {
      lastFrameTs = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  };
})();
