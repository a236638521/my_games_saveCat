/* 喵喵救援队 v0.4 · 首页大厅 + 2.5D 家园 + 塔防入口 + 更多玩法 + 图鉴 */
(function () {
  const cats = window.CATS || [];
  const acqStyle = window.ACQUIRE_STYLE || {};
  const Store = window.Store;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const phone = $('#phone');
  const hudTitle = $('#hudTitle');
  const hudBackBtn = $('#hudBackBtn');
  const yardEl = $('#yard');
  const dexGrid = $('#dexGrid');
  const legendEl = $('#legend');
  const lockToggle = $('#lockToggle');
  const detailEl = $('#detail');
  const stageEl = $('#stage');
  const stageCatEl = $('#stageCat');
  const toastEl = $('#toast');

  let currentIdx = 0;
  let toastTimer = null;
  let stageActionTimer = null;
  let selectedHomeCatId = 'dajv';
  const yardActors = [];

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  window.showDemoToast = showToast;

  function createCatNode(cat, delaySec = 0, withName = true) {
    const wrap = document.createElement('div');
    wrap.className = 'cat';
    wrap.style.setProperty('--d', `${delaySec}s`);
    wrap.innerHTML =
      `<div class="shadow"></div>` +
      (withName ? `<div class="sel-arrow">▼</div>` : '') +
      `<div class="cat-flip"><div class="cat-anim">${window.catSVG(cat)}</div></div>` +
      (withName ? `<div class="name-tag">${cat.name} · ${cat.breed}</div>` : '');
    return wrap;
  }

  function spawnFX(container, x, y, type, text = '') {
    const fx = document.createElement('div');
    fx.className = `fx ${type}`;
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;
    if (text) fx.textContent = text;
    if (type === 'wave') fx.style.setProperty('--dx', `${Math.random() > 0.5 ? 32 : -32}px`);
    container.appendChild(fx);
    setTimeout(() => fx.remove(), 1700);
  }

  function playActionFX(container, cat, cx, cy) {
    switch (cat.action) {
      case 'eat':
        spawnFX(container, cx, cy - 35, 'word', '嗷呜！干饭！');
        spawnFX(container, cx - 22, cy - 55, 'heart', '♥');
        break;
      case 'lick':
        spawnFX(container, cx, cy - 35, 'word', '舔舔~ 👅');
        setTimeout(() => spawnFX(container, cx + 18, cy - 50, 'heart', '♥'), 260);
        break;
      case 'jump':
        spawnFX(container, cx, cy - 45, 'word', '优雅一跳！✨');
        spawnFX(container, cx - 18, cy - 10, 'spark', '✦');
        break;
      case 'flop':
        spawnFX(container, cx, cy - 32, 'word', 'Zzz... 呼噜');
        break;
      case 'meow':
        spawnFX(container, cx, cy - 40, 'word', '喵——！！📢');
        spawnFX(container, cx, cy - 25, 'ring');
        break;
      case 'knock':
        spawnFX(container, cx, cy - 40, 'word', '啪！砸中了！');
        break;
      case 'stare':
        spawnFX(container, cx, cy - 42, 'word', '盯—— 👀');
        break;
      case 'climb':
        spawnFX(container, cx, cy - 45, 'word', '飞檐走壁！');
        break;
      case 'listen':
        spawnFX(container, cx, cy - 42, 'word', '顺风耳！👂');
        spawnFX(container, cx - 28, cy - 56, 'wave', '〰');
        break;
      default:
        spawnFX(container, cx, cy - 35, 'heart', '♥');
    }
  }

  function showBubble(container, x, y, text) {
    const old = container.querySelector('.bubble');
    if (old) old.remove();
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.left = `${Math.max(96, Math.min(294, x))}px`;
    b.style.top = `${Math.max(90, y)}px`;
    b.textContent = text;
    container.appendChild(b);
    setTimeout(() => b.remove(), 2500);
  }

  /* ===== 全局存档刷新同步 ===== */
  function syncGlobalUI() {
    if (!Store) return;
    const st = Store.get();
    $('#coin').textContent = st.gold.toLocaleString('en-US');
    $('#catCount').textContent = st.unlocked.length;
    const tomDone = st.adCount >= 10 || st.unlocked.includes('tangmu');
    $('#watchAdBtn').style.display = tomDone ? 'none' : '';
    $('#adProg').textContent = `${Math.min(10, st.adCount)}/10`;
    $('#dexSubTip').textContent = `已收 ${st.unlocked.length}/${cats.length}`;
    $('#dexProgress').innerHTML = `第一期 · 已解锁 <b>${st.unlocked.length}</b>/${cats.length}`;
    $('#mgBestText').textContent = `历史最高分：${st.miniGameBest || 0}`;

    const today = new Date().toISOString().slice(0, 10);
    const canSign = st.lastSignInDay !== today && st.signInCount < 7;
    $('#signBadge').style.display = canSign ? 'inline-block' : 'none';

    const off = Store.calcOfflineGold();
    $('#offlineBadge').textContent = off > 0 ? `🪙 +${off}` : '已收完';
    $('#offlineBadge').classList.toggle('has', off > 0);
    $('#collectOfflineBtn').textContent = off > 0 ? `🪙 领取离线收益 +${off}` : '🪙 暂无离线金币';
    $('#collectOfflineBtn').disabled = off <= 0;

    const starsCount = Object.values(st.tdStars).reduce((a, b) => a + b, 0);
    $('#tdSubTip').textContent = `保卫萝卜式萌猫塔防 · 已得 ${starsCount}/9 星`;

    updateHomeDock();
    refreshDexLockState();
  }
  window.onStoreUpdate = syncGlobalUI;

  /* ===== 1. 特定首页大厅 ===== */
  let lobbyAmbientTimer = null;

  function renderLobbyShowcase() {
    const st = Store.get();
    const cat = cats.find((c) => c.id === st.showcaseCat) || cats[0];
    const scene = (window.SHOWCASE_SCENES || {})[cat.id];
    const showcaseEl = $('#lobbyShowcase');
    const sceneEl = $('#lobbyScene');
    const stage = $('#lobbyCatStage');

    clearInterval(lobbyAmbientTimer);
    if (scene) {
      showcaseEl.style.background = scene.bg;
      sceneEl.innerHTML = scene.html;
      $('#lobbySceneTag').textContent = scene.hint;
    } else {
      showcaseEl.style.background = '';
      sceneEl.innerHTML = '';
      $('#lobbySceneTag').textContent = '';
    }

    stage.innerHTML = '';
    const node = createCatNode(cat, 0, false);
    if (scene && scene.anim) node.classList.add(scene.anim);
    stage.appendChild(node);
    $('#lobbyQuote').textContent = `“${cat.quote}”`;

    if (cat.id === 'jintiantian') {
      lobbyAmbientTimer = setInterval(() => {
        if (!$('#view-lobby').classList.contains('active')) return;
        const dx = (Math.random() - 0.5) * 34;
        spawnFX(stage, stage.clientWidth / 2 + dx, 54, 'spark', Math.random() > 0.45 ? '💦' : '👅');
      }, 1550);
    }

    node.addEventListener('click', () => {
      const actCls = `act-${cat.action}`;
      node.classList.remove(actCls);
      void node.offsetWidth;
      node.classList.add(actCls);
      playActionFX(stage, cat, stage.clientWidth / 2, 46);
      setTimeout(() => node.classList.remove(actCls), 2400);
    });
  }

  function openShowcaseModal() {
    const st = Store.get();
    const chk = $('#showcasePreviewChk');
    chk.checked = !!st.sandboxAll;
    const allowPreview = !!st.sandboxAll;
    const ownedCount = st.unlocked.length;
    $('#showcaseModalSub').textContent = `已拥有 ${ownedCount}/${cats.length} 只 · 点选设为首页看板猫`;

    const sorted = [...cats].sort((a, b) => {
      const oa = st.unlocked.includes(a.id) ? 0 : 1;
      const ob = st.unlocked.includes(b.id) ? 0 : 1;
      return oa - ob;
    });

    const grid = $('#showcaseGrid');
    grid.innerHTML = '';
    sorted.forEach((cat) => {
      const owned = st.unlocked.includes(cat.id);
      const selectable = owned || allowPreview;
      const isCur = st.showcaseCat === cat.id;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `sc-card ${isCur ? 'cur' : ''} ${owned ? 'owned' : (selectable ? 'preview' : 'locked')}`;
      const badgeText = isCur ? '当前看板' : (owned ? '已拥有' : (selectable ? '试玩可选' : `🔒 ${cat.acquire.text}`));
      card.innerHTML =
        `<div class="sc-portrait" style="background:${cat.theme}"></div>` +
        `<div class="sc-name">${owned || selectable ? cat.name : '???'}</div>` +
        `<div class="sc-breed">${cat.breed}</div>` +
        `<span class="sc-badge">${badgeText}</span>`;

      card.querySelector('.sc-portrait').appendChild(createCatNode(cat, 0, false));
      card.addEventListener('click', () => {
        if (!selectable) {
          showToast(`尚未拥有「${cat.name}」：${cat.acquire.text}`);
          return;
        }
        st.showcaseCat = cat.id;
        Store.save();
        renderLobbyShowcase();
        $('#modalShowcase').classList.remove('open');
        showToast(`已切换看板猫：${cat.name} · ${cat.breed}`);
      });
      grid.appendChild(card);
    });

    $('#modalShowcase').classList.add('open');
  }

  function initLobby() {
    renderLobbyShowcase();

    $('#switchShowcaseBtn').addEventListener('click', openShowcaseModal);
    $('#showcasePreviewChk').addEventListener('change', (e) => {
      Store.get().sandboxAll = e.target.checked;
      Store.save();
      renderYard();
      openShowcaseModal();
    });

    $('#goHomeBtn').addEventListener('click', () => switchDemoView('home'));
    $('#goTdBtn').addEventListener('click', () => switchDemoView('td-select'));
    $('#goModesBtn').addEventListener('click', () => switchDemoView('modes'));
    $('#goDexBtn').addEventListener('click', () => switchDemoView('dex'));

    $('#watchAdBtn').addEventListener('click', () => {
      const res = Store.recordAd();
      Store.addGold(40);
      if (res.unlockedTom) {
        showToast('🎉 累计看满 10 次广告！解锁「汤姆 · 蓝白猫」(+40🪙)');
      } else {
        showToast(`📺 模拟观看激励广告成功！+40 金币（汤姆进度 ${res.adCount}/10）`);
      }
      renderYard();
    });
  }

  /* ===== 2. 猫咪家园（可拖动全景 + 大尺寸互动装饰） ===== */
  const YARD_SPOTS = [
    { id: 'dajv', x: 108, y: 470 },
    { id: 'jintiantian', x: 195, y: 430 },
    { id: 'yinxiaomei', x: 485, y: 295 },
    { id: 'xiaobuding', x: 325, y: 345 },
    { id: 'xiaoluo', x: 545, y: 340 },
    { id: 'tangmu', x: 40, y: 300 },
    { id: 'feifei', x: 430, y: 245 },
    { id: 'ali', x: 135, y: 225 },
    { id: 'wukong', x: 590, y: 445 }
  ];

  const DECOR_CATALOG = [
    {
      id: 'decor_scratch', cls: 'yd-scratch', ico: '🐾', name: '剑麻立柱猫抓板',
      desc: '放在院子中央 · 猫咪会跑来双爪疯狂抓挠磨爪，木屑飞溅！',
      price: 280, ix: 195, iy: 410, panX: 0,
      actCls: 'act-scratch', actFx: '💨 咔哧!',
      msg: '咔哧咔哧~ 这个猫抓板磨爪超解压！', fx: '✨',
      svg: `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="55" cy="98" rx="44" ry="10" fill="rgba(50,80,25,.24)"/>
        <ellipse cx="55" cy="90" rx="40" ry="12" fill="#B67E47" stroke="#7A4C22" stroke-width="2.2"/>
        <ellipse cx="55" cy="85" rx="40" ry="11" fill="#F2C88D" stroke="#8C592B" stroke-width="2"/>
        <rect x="42" y="28" width="26" height="58" rx="6" fill="#E8BA73" stroke="#8C592B" stroke-width="2.2"/>
        <path d="M 44 38 L 66 44 M 44 48 L 66 54 M 44 58 L 66 64 M 44 68 L 66 74 M 44 78 L 66 83" stroke="#BD8339" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="55" cy="28" rx="22" ry="8" fill="#FFE0B5" stroke="#8C592B" stroke-width="2"/>
        <path d="M 72 30 Q 86 44 82 60" stroke="#9C6B43" stroke-width="2" fill="none"/>
        <circle cx="82" cy="64" r="8" fill="#FF7EA5" stroke="#B83E66" stroke-width="1.8" class="yd-toy"/>
        <circle cx="48" cy="85" r="3" fill="#FF7043"/><circle cx="62" cy="87" r="3" fill="#FF7043"/>
      </svg>`
    },
    {
      id: 'decor_tree', cls: 'yd-tree', ico: '🪵', name: '豪华双层猫爬架',
      desc: '大型木制爬架 · 带毛球吊饰，猫咪会飞檐走壁跃上最高点~',
      price: 450, ix: 360, iy: 295, panX: -120,
      actCls: 'act-climb', actFx: '🧶 登上最高层!',
      msg: '占领双层大爬架最高点！风景真好~', fx: '🎶',
      svg: `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="118" rx="50" ry="11" fill="rgba(50,80,25,.24)"/>
        <ellipse cx="60" cy="112" rx="44" ry="12" fill="#CFA16A" stroke="#8C592B" stroke-width="2.2"/>
        <rect x="28" y="54" width="14" height="58" rx="5" fill="#E6BC7B" stroke="#8C592B" stroke-width="2"/>
        <rect x="76" y="34" width="14" height="78" rx="5" fill="#E6BC7B" stroke="#8C592B" stroke-width="2"/>
        <ellipse cx="42" cy="54" rx="28" ry="10" fill="#A4D8F8" stroke="#5A94C0" stroke-width="2"/>
        <rect x="20" y="68" width="38" height="28" rx="10" fill="#FDE6C4" stroke="#9C6835" stroke-width="2"/>
        <circle cx="39" cy="82" r="9" fill="#5D3D24"/>
        <ellipse cx="83" cy="34" rx="30" ry="11" fill="#FFB3C6" stroke="#C96480" stroke-width="2"/>
        <line x1="88" y1="45" x2="96" y2="62" stroke="#9C6835" stroke-width="2"/>
        <circle cx="96" cy="66" r="7" fill="#FFD54F" stroke="#C78A00" stroke-width="1.8" class="yd-toy"/>
      </svg>`
    },
    {
      id: 'decor_sunbed', cls: 'yd-sunbed', ico: '🏖️', name: '暖阳吊床躺椅',
      desc: '左院阳光角落 · 带遮阳柔光特效，猫咪会闭眼趴着晒太阳打盹',
      price: 580, ix: 62, iy: 435, panX: 0,
      actCls: 'act-nap', actFx: '💤 呼噜~',
      msg: '晒着暖呼呼的太阳打个盹儿，好舒服~', fx: '☀️',
      svg: `<svg viewBox="0 0 124 106" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="62" cy="94" rx="52" ry="10" fill="rgba(50,80,25,.24)"/>
        <circle cx="98" cy="24" r="18" fill="rgba(255,224,102,.48)" class="yd-sunshine"/>
        <path d="M 16 86 L 32 42 M 108 86 L 92 42" stroke="#8C592B" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M 14 54 Q 62 84 110 54 L 102 44 Q 62 70 22 44 Z" fill="#81D4FA" stroke="#288EC4" stroke-width="2"/>
        <path d="M 36 56 Q 62 72 88 56" stroke="#FFF9E6" stroke-width="4" fill="none" stroke-dasharray="6 5"/>
        <ellipse cx="32" cy="48" rx="11" ry="6" fill="#FFE082" stroke="#C78A00" stroke-width="1.6"/>
      </svg>`
    },
    {
      id: 'decor_fountain', cls: 'yd-fountain', ico: '⛲', name: '涌泉活水饮水机',
      desc: '流水潺潺特效 · 猫咪会凑近低头吧唧吧唧喝甜甜的活水',
      price: 680, ix: 255, iy: 265, panX: -40,
      actCls: 'act-drink', actFx: '💧 吧唧吧唧~',
      msg: '流动的山泉水甜甜哒，真好喝！', fx: '💦',
      svg: `<svg viewBox="0 0 110 105" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="55" cy="94" rx="44" ry="10" fill="rgba(50,80,25,.22)"/>
        <ellipse cx="55" cy="74" rx="38" ry="18" fill="#FFFDF9" stroke="#7BA6C9" stroke-width="2.2"/>
        <ellipse cx="55" cy="68" rx="32" ry="13" fill="#4FC3F7" stroke="#288EC4" stroke-width="1.8"/>
        <rect x="49" y="34" width="12" height="32" rx="5" fill="#FFE082" stroke="#C78A00" stroke-width="1.8"/>
        <circle cx="55" cy="30" r="9" fill="#FF85B8" stroke="#C94E82" stroke-width="1.8"/>
        <path d="M 55 24 Q 36 32 34 66 M 55 24 Q 74 32 76 66" stroke="#E1F5FE" stroke-width="3" fill="none" stroke-linecap="round" class="yd-stream"/>
      </svg>`
    },
    {
      id: 'decor_swing', cls: 'yd-swing', ico: '🌸', name: '樱花小秋千',
      desc: '自带飘落樱花花瓣特效，小猫会跳上去左右摇晃荡秋千',
      price: 750, ix: 95, iy: 280, panX: 0,
      actCls: 'act-swing', actFx: '🌸 摇啊摇~',
      msg: '樱花瓣落到胡须上了，荡秋千好惬意~', fx: '🌸',
      svg: `<svg viewBox="0 0 120 124" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="112" rx="48" ry="11" fill="rgba(50,80,25,.24)"/>
        <path d="M 22 108 L 36 22 L 86 22 L 100 108" stroke="#8C592B" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 16 24 Q 60 12 104 24" stroke="#6E421E" stroke-width="8" fill="none" stroke-linecap="round"/>
        <circle cx="28" cy="20" r="13" fill="#FFA8C8"/><circle cx="46" cy="14" r="15" fill="#FFC2D9"/>
        <circle cx="66" cy="16" r="14" fill="#FFA8C8"/><circle cx="88" cy="21" r="13" fill="#FFC2D9"/>
        <line x1="44" y1="26" x2="44" y2="82" stroke="#C49B70" stroke-width="2.4"/>
        <line x1="76" y1="26" x2="76" y2="82" stroke="#C49B70" stroke-width="2.4"/>
        <rect x="34" y="80" width="52" height="10" rx="4" fill="#F2BA7D" stroke="#8C592B" stroke-width="2"/>
      </svg><span class="yd-petal">🌸</span><span class="yd-petal p2">🌸</span>`
    },
    {
      id: 'decor_catnip', cls: 'yd-catnip', ico: '🌿', name: '鲜活猫薄荷盆栽',
      desc: '芳香嫩叶持续飘散清香 · 猫咪闻到后会晕乎乎地打滚撒欢！',
      price: 880, ix: 375, iy: 445, panX: -140,
      actCls: 'act-catnip', actFx: '🌿 醉猫模式!',
      msg: '吸一口鲜嫩猫薄荷，整只喵都要飘起来啦！', fx: '💚',
      svg: `<svg viewBox="0 0 104 106" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="52" cy="96" rx="38" ry="9" fill="rgba(50,80,25,.24)"/>
        <polygon points="28,60 76,60 68,94 36,94" fill="#E07A5F" stroke="#9E4730" stroke-width="2.2"/>
        <rect x="24" y="52" width="56" height="11" rx="4" fill="#F29E82" stroke="#9E4730" stroke-width="2"/>
        <path d="M 52 54 Q 32 30 24 38 Q 36 52 52 54 Z" fill="#6BCB77" stroke="#2E7D32" stroke-width="1.8"/>
        <path d="M 52 54 Q 72 30 80 38 Q 68 52 52 54 Z" fill="#6BCB77" stroke="#2E7D32" stroke-width="1.8"/>
        <path d="M 52 54 Q 44 18 52 14 Q 60 18 52 54 Z" fill="#81E68D" stroke="#2E7D32" stroke-width="1.8"/>
        <circle cx="52" cy="22" r="4" fill="#C9A0FF"/>
      </svg><span class="yd-aroma">🍃</span><span class="yd-aroma a2">✨</span>`
    },
    {
      id: 'decor_pond', cls: 'yd-pond', ico: '🐠', name: '锦鲤小鱼池',
      desc: '右院大水池 · 锦鲤游动+水波粼粼特效，猫猫会蹲在池边紧盯大鱼！',
      price: 1100, ix: 500, iy: 410, panX: -280,
      actCls: 'act-stare', actFx: '🐟 盯——!',
      msg: '盯——有条大锦鲤游过去啦！', fx: '🐟',
      svg: `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="58" rx="64" ry="34" fill="rgba(45,80,25,.2)"/>
        <ellipse cx="70" cy="52" rx="62" ry="33" fill="#B5B2A8" stroke="#7A766C" stroke-width="2.4"/>
        <ellipse cx="70" cy="50" rx="52" ry="25" fill="#4FC3F7" stroke="#288EC4" stroke-width="2"/>
        <ellipse cx="70" cy="50" rx="34" ry="15" fill="none" stroke="#E1F5FE" stroke-width="2" class="yd-ripple"/>
        <g class="yd-koi">
          <ellipse cx="52" cy="52" rx="10" ry="4.5" fill="#FF7043" stroke="#B71C1C" stroke-width="1.2"/>
          <polygon points="42,52 35,48 35,56" fill="#FF8A65"/>
        </g>
        <ellipse cx="92" cy="44" rx="11" ry="6" fill="#5CB85C" stroke="#2E7D32" stroke-width="1.5"/>
        <circle cx="94" cy="42" r="4.5" fill="#FF85B8"/>
      </svg>`
    },
    {
      id: 'decor_wheel', cls: 'yd-wheel', ico: '🎡', name: '炫彩静音猫跑轮',
      desc: '右院健身角 · 轮圈持续旋转，小猫会踏上去高速冲刺飙步数！',
      price: 1350, ix: 585, iy: 265, panX: -340,
      actCls: 'act-runwheel', actFx: '⚡ 冲刺+99步!',
      msg: '在猫跑轮上疯狂冲刺十圈，我就是风一样的喵！', fx: '🌟',
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="110" rx="44" ry="9" fill="rgba(50,80,25,.24)"/>
        <path d="M 28 106 L 44 82 L 76 82 L 92 106 Z" fill="#C98A4B" stroke="#7A4C22" stroke-width="2.2"/>
        <circle cx="60" cy="58" r="42" fill="#FFFDF7" stroke="#FF8C42" stroke-width="7"/>
        <g class="yd-wheel-ring">
          <circle cx="60" cy="58" r="35" fill="none" stroke="#FFD166" stroke-width="4" stroke-dasharray="14 10"/>
          <line x1="60" y1="22" x2="60" y2="94" stroke="#FFE0B2" stroke-width="2.5"/>
          <line x1="24" y1="58" x2="96" y2="58" stroke="#FFE0B2" stroke-width="2.5"/>
        </g>
        <circle cx="60" cy="58" r="7" fill="#FF6B93" stroke="#fff" stroke-width="2"/>
      </svg>`
    }
  ];

  let yardPanX = 0;
  let suppressYardClickUntil = 0;

  function setYardPan(x) {
    const vp = $('#yardViewport');
    const world = $('#yardWorld');
    if (!vp || !world) return;
    const vpW = vp.clientWidth || 390;
    const minPan = Math.min(0, -(740 - vpW));
    yardPanX = Math.max(minPan, Math.min(0, x));
    world.style.transform = `translate3d(${yardPanX}px, 0, 0)`;
  }

  function initYardPan() {
    const vp = $('#yardViewport');
    if (!vp || vp._panBound) return;
    vp._panBound = true;
    let dragging = false;
    let startX = 0;
    let startPan = 0;
    let moved = 0;

    vp.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.home-dock') || e.target.closest('.offline-collect')) return;
      dragging = true;
      startX = e.clientX;
      startPan = yardPanX;
      moved = 0;
      vp.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      setYardPan(startPan + dx);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      vp.classList.remove('dragging');
      if (moved > 6) suppressYardClickUntil = performance.now() + 260;
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  const DECOR_ACT_CLASSES = ['act-scratch', 'act-climb', 'act-swing', 'act-stare', 'act-nap', 'act-drink', 'act-catnip', 'act-runwheel'];

  function interactWithDecor(actor, decor) {
    const { el } = actor;
    const actCls = decor.actCls || `act-${actor.cat.action}`;
    el.classList.remove('walking', ...DECOR_ACT_CLASSES, `act-${actor.cat.action}`);
    void el.offsetWidth;
    el.classList.add(actCls);
    actor.busyUntil = performance.now() + 2800;
    actor.nextMoveAt = actor.busyUntil + 1600;
    actor.targetDecor = null;

    const dEl = $(`#yardDecor [data-decor="${decor.id}"]`);
    if (dEl) {
      dEl.classList.remove('fx-pop');
      void dEl.offsetWidth;
      dEl.classList.add('fx-pop');
    }
    spawnFX(yardEl, actor.x + 48, actor.y + 18, 'spark', decor.fx);
    if (decor.actFx) spawnFX(yardEl, actor.x + 62, actor.y + 34, 'word', decor.actFx);
    showBubble(yardEl, actor.x + 48, actor.y + 4, decor.msg);
    clearTimeout(actor._actTimer);
    actor._actTimer = setTimeout(() => el.classList.remove(actCls), 2500);
  }

  function renderYardDecor() {
    const layer = $('#yardDecor');
    if (!layer) return;
    const eq = (Store.get().decorEquipped || []);
    layer.innerHTML = DECOR_CATALOG.filter((d) => eq.includes(d.id))
      .map((d) => `<div class="yd-item ${d.cls}" data-decor="${d.id}" title="${d.name}">${d.svg}<small>${d.name}</small></div>`)
      .join('');

    $$('.yd-item', layer).forEach((el) => {
      el.addEventListener('click', (e) => {
        if (performance.now() < suppressYardClickUntil) return;
        e.stopPropagation();
        const decor = DECOR_CATALOG.find((x) => x.id === el.dataset.decor);
        if (!decor) return;
        el.classList.remove('fx-pop');
        void el.offsetWidth;
        el.classList.add('fx-pop');
        spawnFX(yardEl, decor.ix + 30, decor.iy - 10, 'spark', decor.fx);
        const actor = yardActors[Math.floor(Math.random() * yardActors.length)];
        if (actor) {
          actor.tx = decor.ix;
          actor.ty = decor.iy;
          actor.targetDecor = decor;
          actor.busyUntil = 0;
          showToast(`${decor.ico} 小猫「${actor.cat.name}」正跑向${decor.name}！`);
        }
      });
    });
  }

  function syncYardSelection() {
    for (const a of yardActors) {
      a.el.classList.toggle('selected', a.cat.id === selectedHomeCatId);
    }
  }

  function renderYard() {
    renderYardDecor();
    yardEl.innerHTML = '';
    yardActors.length = 0;
    const pool = Store.getPlayableCats();
    if (!pool.some((c) => c.id === selectedHomeCatId)) selectedHomeCatId = pool[0].id;

    pool.forEach((cat, idx) => {
      const spot = YARD_SPOTS.find((s) => s.id === cat.id) || { x: 60 + (idx % 4) * 145, y: 240 + Math.floor(idx / 4) * 95 };
      const el = createCatNode(cat, -((idx * 0.43) % 2.6).toFixed(2), true);
      yardEl.appendChild(el);

      const actor = {
        cat, el, x: spot.x, y: spot.y, tx: spot.x, ty: spot.y,
        busyUntil: 0, nextMoveAt: performance.now() + 900 + idx * 550, targetDecor: null
      };
      placeActor(actor);
      el.addEventListener('click', (e) => {
        if (performance.now() < suppressYardClickUntil) return;
        e.stopPropagation();
        if (selectedHomeCatId !== cat.id) {
          selectedHomeCatId = cat.id;
          updateHomeDock();
          return;
        }
        triggerYardCat(actor);
      });
      yardActors.push(actor);
    });
    updateHomeDock();
  }

  function placeActor(actor) {
    actor.el.style.left = `${actor.x}px`;
    actor.el.style.top = `${actor.y}px`;
    actor.el.style.zIndex = String(Math.round(actor.y));
  }

  function triggerYardCat(actor) {
    const { cat, el } = actor;
    const actCls = `act-${cat.action}`;
    el.classList.remove('walking', ...DECOR_ACT_CLASSES, actCls);
    void el.offsetWidth;
    el.classList.add(actCls);
    actor.tx = actor.x;
    actor.ty = actor.y;
    actor.targetDecor = null;
    actor.busyUntil = performance.now() + 2500;
    actor.nextMoveAt = actor.busyUntil + 1500;
    playActionFX(yardEl, cat, actor.x + 46, actor.y + 18);
    showBubble(yardEl, actor.x + 46, actor.y + 6, cat.quote);
    clearTimeout(actor._actTimer);
    actor._actTimer = setTimeout(() => el.classList.remove(actCls), 2400);
  }

  function updateHomeDock() {
    const st = Store.get();
    const cat = cats.find((c) => c.id === selectedHomeCatId) || cats[0];
    const intSt = Store.getCatIntimacy(cat.id);
    const full = Math.round(st.fullness[cat.id] || 0);
    const nextNeed = Store.EXP_NEXT[intSt.lv] || 'MAX';
    const petState = Store.canPetCat(cat.id);

    syncYardSelection();
    $('#homeSelName').textContent = `🐾 ${cat.name} · ${cat.breed}`;
    $('#homeSelInt').textContent = `❤️ Lv${intSt.lv} (${intSt.xp}/${nextNeed})`;
    $('#homeSelFull').textContent = `🍗 饱腹 ${full}（不限次）`;
    const petBtn = $('#homePetBtn');
    if (petBtn) {
      petBtn.textContent = petState.ok ? '✋ 抚摸' : `⏳ ${petState.remainMin}分`;
      petBtn.classList.toggle('cooldown', !petState.ok);
    }
    $('#cntKibble').textContent = st.items.kibble || 0;
    $('#cntStrip').textContent = st.items.strip || 0;
    $('#cntCan').textContent = st.items.can || 0;
  }

  function initHomeActions() {
    initYardPan();
    renderYard();
    requestAnimationFrame(tickYard);

    $('#collectOfflineBtn').addEventListener('click', () => {
      const amt = Store.collectOfflineGold();
      if (amt > 0) showToast(`🪙 已领取离线金币 +${amt}！`);
    });

    $('#homePetBtn').addEventListener('click', () => {
      const cat = cats.find((c) => c.id === selectedHomeCatId) || cats[0];
      const petRes = Store.petCat(selectedHomeCatId);
      if (!petRes.ok) {
        showToast(`⏳ 「${cat.name}」每小时可抚摸一次，还需等待约 ${petRes.remainMin} 分钟~`);
        return;
      }
      const actor = yardActors.find((a) => a.cat.id === selectedHomeCatId);
      if (actor) {
        triggerYardCat(actor);
        spawnFX(yardEl, actor.x + 46, actor.y + 8, 'heart', '♥');
      }
      showToast(petRes.res.leveledUp
        ? `🎉 抚摸后亲密度升至 Lv${petRes.res.lv}！奖励 🪙+${petRes.res.goldBonus}`
        : `✋ 抚摸成功，亲密度 +${petRes.gain}（下小时可再次抚摸）`);
    });

    const bindFeed = (btnId, foodKey) => {
      $(btnId).addEventListener('click', () => {
        const res = Store.feedCat(selectedHomeCatId, foodKey);
        if (!res.ok) { showToast(res.reason); return; }
        const actor = yardActors.find((a) => a.cat.id === selectedHomeCatId);
        if (actor) spawnFX(yardEl, actor.x + 46, actor.y + 8, 'word', `亲密+${res.gainInt}`);
        showToast(res.res.leveledUp
          ? `🎉 喂食后升至 Lv${res.res.lv}！奖励 🪙+${res.res.goldBonus}`
          : `🍖 喂食成功！亲密度 +${res.gainInt}（当前饱腹 ${res.fullness}）`);
      });
    };
    bindFeed('#homeFeedKibble', 'kibble');
    bindFeed('#homeFeedStrip', 'strip');
    bindFeed('#homeFeedCan', 'can');
  }

  let lastTs = performance.now();
  let lastPetRefresh = 0;
  function tickYard(now) {
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    if ($('#view-home').classList.contains('active') && !detailEl.classList.contains('open')) {
      if (now - lastPetRefresh > 15000) {
        lastPetRefresh = now;
        const petBtn = $('#homePetBtn');
        if (petBtn) {
          const petState = Store.canPetCat(selectedHomeCatId);
          petBtn.textContent = petState.ok ? '✋ 抚摸' : `⏳ ${petState.remainMin}分`;
          petBtn.classList.toggle('cooldown', !petState.ok);
        }
      }
      const eq = (Store.get().decorEquipped || []);
      const equippedDecors = DECOR_CATALOG.filter((d) => eq.includes(d.id));
      for (const a of yardActors) {
        if (now < a.busyUntil) continue;
        const dx = a.tx - a.x;
        const dy = a.ty - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          a.x += (dx / dist) * 32 * dt;
          a.y += (dy / dist) * 32 * dt;
          a.el.classList.add('walking');
          a.el.classList.toggle('flip', dx < -1);
          placeActor(a);
        } else {
          a.el.classList.remove('walking');
          if (a.targetDecor) {
            interactWithDecor(a, a.targetDecor);
            continue;
          }
          if (now >= a.nextMoveAt) {
            if (equippedDecors.length > 0 && Math.random() < 0.45) {
              const d = equippedDecors[Math.floor(Math.random() * equippedDecors.length)];
              a.targetDecor = d;
              a.tx = d.ix + (Math.random() - 0.5) * 16;
              a.ty = d.iy + (Math.random() - 0.5) * 10;
            } else {
              a.targetDecor = null;
              a.tx = Math.max(20, Math.min(620, a.x + (Math.random() - 0.5) * 200));
              a.ty = Math.max(210, Math.min(505, a.y + (Math.random() - 0.5) * 110));
            }
            a.nextMoveAt = now + 2400 + Math.random() * 3200;
          }
        }
      }
    }
    requestAnimationFrame(tickYard);
  }

  /* ===== 3. 图鉴与详情 ===== */
  function initDex() {
    legendEl.innerHTML = Object.values(acqStyle)
      .map((s) => `<span style="background:${s.color}">${s.label}</span>`)
      .join('');

    dexGrid.innerHTML = '';
    cats.forEach((cat, idx) => {
      const style = acqStyle[cat.acquire.type] || { label: '未知', color: '#999' };
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = cat.id;
      card.innerHTML =
        `<div class="portrait" style="background:${cat.theme}">` +
        `<span class="no">No.00${idx + 1}</span>` +
        `<span class="verb" title="${cat.verb}">${cat.verbIcon}</span>` +
        `</div>` +
        `<div class="cname">${cat.name}</div>` +
        `<div class="cbreed">${cat.breed} · ${cat.verb}</div>` +
        `<span class="ctag" style="background:${style.color}">${cat.acquire.text}</span>` +
        `<div class="lockhint">未解锁 · ${cat.acquire.text}</div>`;

      const catNode = createCatNode(cat, -((idx * 0.35) % 2).toFixed(2), false);
      card.querySelector('.portrait').appendChild(catNode);
      card.addEventListener('click', () => openDetail(idx));
      dexGrid.appendChild(card);
    });

    lockToggle.addEventListener('change', refreshDexLockState);
    refreshDexLockState();
  }

  function refreshDexLockState() {
    const st = Store.get();
    const showUnowned = lockToggle.checked;
    $$('.card', dexGrid).forEach((card) => {
      const unlocked = st.unlocked.includes(card.dataset.id);
      card.style.display = (unlocked || showUnowned) ? '' : 'none';
      card.classList.toggle('is-locked', showUnowned && !unlocked);
    });
  }

  function stepDetail(dir) {
    const st = Store.get();
    const pool = lockToggle.checked
      ? cats
      : cats.filter((c) => st.unlocked.includes(c.id));
    if (!pool.length) return;
    const curId = cats[currentIdx] && cats[currentIdx].id;
    const pos = Math.max(0, pool.findIndex((c) => c.id === curId));
    const target = pool[(pos + dir + pool.length) % pool.length];
    openDetail(cats.findIndex((c) => c.id === target.id));
  }

  function openDetail(idx) {
    currentIdx = (idx + cats.length) % cats.length;
    const cat = cats[currentIdx];
    const style = acqStyle[cat.acquire.type] || { label: '未知', color: '#999' };

    $('#dNo').textContent = `No.00${currentIdx + 1} / 00${cats.length}`;
    stageEl.style.background = `linear-gradient(180deg, ${cat.theme}, #FFFDF9)`;
    $('#dVerb').textContent = `${cat.verbIcon} ${cat.td.role}`;
    $('#actionBtn').textContent = `▶ 演示：${cat.actionName}`;

    stageCatEl.innerHTML = '';
    const stageCat = createCatNode(cat, 0, false);
    stageCatEl.appendChild(stageCat);
    stageCat.addEventListener('click', playStageAction);

    $('#dName').textContent = cat.name;
    const sexEl = $('#dSex');
    sexEl.textContent = cat.sex;
    sexEl.className = `sex ${cat.sex === '♂' ? 'm' : 'f'}`;

    const acqEl = $('#dAcq');
    acqEl.textContent = cat.acquire.text;
    acqEl.style.background = style.color;

    $('#dBreed').textContent = `${cat.breed} · 建造消耗 🐟${cat.td.cost} · ${cat.td.role}`;
    $('#dTags').innerHTML = cat.tags.map((t) => `<span>#${t}</span>`).join('');
    $('#dQuote').textContent = `“${cat.quote}”`;
    $('#dIntro').textContent = cat.intro;
    $('#dLook').textContent = cat.look;
    $('#dHome').textContent = cat.home;
    $('#dFood').textContent = cat.food;

    $('#dSkills').innerHTML = cat.skills
      .map(
        (sk, i) =>
          `<div class="skill ${i === 0 ? 'main' : ''}">` +
          `<div class="lv">Lv${sk.lv}</div>` +
          `<div><div class="sk-name">${sk.name}<span class="sk-kind">${sk.kind}</span></div>` +
          `<div class="sk-desc">${sk.desc}</div></div></div>`
      )
      .join('');

    detailEl.classList.add('open');
    detailEl.querySelector('.sheet-inner').scrollTop = 0;
  }

  function playStageAction() {
    const cat = cats[currentIdx];
    const el = stageCatEl.querySelector('.cat');
    if (!el) return;
    const actCls = `act-${cat.action}`;
    el.classList.remove(actCls);
    void el.offsetWidth;
    el.classList.add(actCls);
    playActionFX(stageEl, cat, stageEl.clientWidth / 2, 72);
    clearTimeout(stageActionTimer);
    stageActionTimer = setTimeout(() => el.classList.remove(actCls), 2600);
  }

  /* ===== 4. 弹窗：签到 / 商店 / 设置 ===== */
  function openSignModal() {
    const st = Store.get();
    const today = new Date().toISOString().slice(0, 10);
    const signedToday = st.lastSignInDay === today;
    const defs = [
      { ico: '🥣', reward: '🪙50 + 猫粮×2' },
      { ico: '🐟', reward: '🪙80 + 猫条×1' },
      { catId: 'jintiantian', catName: '金舔舔', reward: '🪙100 + 解锁猫咪' },
      { ico: '🥫', reward: '🪙120 + 罐头×1' },
      { ico: '🐟', reward: '🪙150 + 猫条×2' },
      { ico: '🥫', reward: '🪙200 + 罐头×1' },
      { catId: 'feifei', catName: '菲菲', reward: '🪙300 + 终极好礼！' }
    ];

    $('#signGrid').innerHTML = defs.map((d, i) => {
      const done = i < st.signInCount;
      const canClaim = !signedToday && i === st.signInCount;
      const tomorrow = signedToday && i === st.signInCount;
      const isCat = !!d.catId;
      const isDay7 = i === 6;
      const cat = isCat ? cats.find((c) => c.id === d.catId) : null;
      const visual = cat && window.catSVG
        ? `<div class="sign-cat-thumb">${window.catSVG(cat)}</div>`
        : `<div class="sign-ico">${d.ico}</div>`;
      const catTag = isCat
        ? `<div class="sparkle-cat-name" data-text="${d.catName}">✨ ${d.catName} ✨</div>`
        : '';
      const topBadge = done ? '<i class="ok">✓</i>' : (canClaim ? '<i>可领</i>' : (tomorrow ? '<i class="tmr">明日</i>' : ''));
      const status = done ? '✓ 已领' : (canClaim ? '今日可领' : (tomorrow ? '明日可领' : `第${i + 1}天`));
      const cls = [
        'sign-day',
        done ? 'done' : '',
        canClaim ? 'cur' : '',
        tomorrow ? 'tomorrow' : '',
        isCat ? 'cat-day' : '',
        isDay7 ? 'day7' : ''
      ].filter(Boolean).join(' ');

      return `<div class="${cls}">` +
        `<div class="sd-top"><b>第${i + 1}天</b>${topBadge}</div>` +
        `<div class="sd-mid">${visual}<div class="sd-info">${catTag}<span>${d.reward}</span></div></div>` +
        `<small class="sd-st">${status}</small>` +
        `</div>`;
    }).join('');

    const btn = $('#doSignBtn');
    btn.classList.remove('done-btn');
    if (st.signInCount >= 7) {
      btn.textContent = '🎉 7日新手签到已全部领完';
      btn.disabled = true;
    } else if (signedToday) {
      btn.textContent = `✓ 今日已签到 · 明日可领第 ${st.signInCount + 1} 天`;
      btn.classList.add('done-btn');
      btn.disabled = false;
    } else {
      btn.textContent = `✨ 立即领取第 ${st.signInCount + 1} 天奖励`;
      btn.disabled = false;
    }
    $('#modalSign').classList.add('open');
  }

  let curShopTab = 'food';

  function openShopModal(tab) {
    if (tab) curShopTab = tab;
    const st = Store.get();
    $$('.shop-tab', $('#shopTabs')).forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === curShopTab);
    });

    const listEl = $('#shopList');
    if (curShopTab === 'food') {
      listEl.innerHTML = `
        <div class="shop-item">
          <div class="si-ico" style="background:#FFF1DD">🥣</div>
          <div class="si-body"><b>普通猫粮 <i>持有 ${st.items.kibble || 0}</i></b><small>亲密度 +20 / 饱腹度 +20（不限喂食次数）</small></div>
          <button class="pbtn primary sm" data-act="buy_food" data-key="kibble" data-price="120" data-label="普通猫粮">🪙 120</button>
        </div>
        <div class="shop-item">
          <div class="si-ico" style="background:#FFE6EC">🐟</div>
          <div class="si-body"><b>美味猫条 <i>持有 ${st.items.strip || 0}</i></b><small>亲密度 +45 / 饱腹度 +15（高亲密零食）</small></div>
          <button class="pbtn primary sm" data-act="buy_food" data-key="strip" data-price="280" data-label="美味猫条">🪙 280</button>
        </div>
        <div class="shop-item">
          <div class="si-ico" style="background:#FFF2CE">🥫</div>
          <div class="si-body"><b>高级猫罐头 <i>持有 ${st.items.can || 0}</i></b><small>亲密度 +100 / 饱腹度 +40（主食大餐）</small></div>
          <button class="pbtn primary sm" data-act="buy_food" data-key="can" data-price="580" data-label="高级猫罐头">🪙 580</button>
        </div>
      `;
    } else if (curShopTab === 'cats') {
      const ali = cats.find((c) => c.id === 'ali');
      const hasAli = st.unlocked.includes('ali');
      const pct = Math.min(100, Math.round((st.gold / 8500) * 100));
      const others = [
        { id: 'tangmu', tip: '观看激励广告满 10 次免费领' },
        { id: 'jintiantian', tip: '累计签到第 3 天免费领' },
        { id: 'feifei', tip: '累计签到第 7 天免费领' },
        { id: 'yinxiaomei', tip: '主线关卡挑战解锁' }
      ];
      listEl.innerHTML = `
        <div class="shop-item shop-cat-hero">
          <div class="si-cat">${ali && window.catSVG ? window.catSVG(ali) : '🌿'}</div>
          <div class="si-body">
            <b>阿狸 · 狸花猫</b>
            <small>三连弹射刺客 · 慢节奏长线金币目标</small>
            ${hasAli ? '' : `<div class="shop-prog"><span style="width:${pct}%"></span></div><em class="prog-txt">金币进度：${st.gold.toLocaleString('en-US')} / 8,500</em>`}
          </div>
          <button class="pbtn ${hasAli ? '' : 'primary'} sm" data-act="buy_ali" ${hasAli ? 'disabled' : ''}>${hasAli ? '已拥有' : '🪙 8,500'}</button>
        </div>
        <div class="shop-note">📌 其他非金币购买猫咪途径（无内购）：</div>
        ${others.map((o) => {
          const c = cats.find((x) => x.id === o.id);
          const own = st.unlocked.includes(o.id);
          return `<div class="shop-item mini">
            <div class="si-ico">${c ? c.verbIcon : '🐱'}</div>
            <div class="si-body"><b>${c ? `${c.name} · ${c.breed}` : o.id}</b><small>${o.tip}</small></div>
            <span class="si-tag ${own ? 'own' : ''}">${own ? '已拥有' : '免费途径'}</span>
          </div>`;
        }).join('')}
      `;
    } else if (curShopTab === 'td') {
      const p = st.tdProps || {};
      listEl.innerHTML = `
        <div class="shop-item">
          <div class="si-ico" style="background:#E3F5FF">🐟</div>
          <div class="si-body"><b>鲜鱼补给包 <i>持有 ${p.fishbag || 0}</i></b><small>塔防局内点击使用，立即 +100 鲜鱼点</small></div>
          <button class="pbtn primary sm" data-act="buy_td" data-key="fishbag" data-price="120" data-label="鲜鱼补给包">🪙 120</button>
        </div>
        <div class="shop-item">
          <div class="si-ico" style="background:#E6F2FF">❄️</div>
          <div class="si-body"><b>冰镇猫薄荷 <i>持有 ${p.freeze || 0}</i></b><small>塔防局内点击使用，冻结全场敌人 4 秒</small></div>
          <button class="pbtn primary sm" data-act="buy_td" data-key="freeze" data-price="180" data-label="冰镇猫薄荷">🪙 180</button>
        </div>
        <div class="shop-item">
          <div class="si-ico" style="background:#FFF3DB">🔔</div>
          <div class="si-body"><b>狂热猫铃铛 <i>持有 ${p.bell || 0}</i></b><small>塔防局内点击使用，全图猫塔攻速翻倍 8 秒</small></div>
          <button class="pbtn primary sm" data-act="buy_td" data-key="bell" data-price="240" data-label="狂热猫铃铛">🪙 240</button>
        </div>
      `;
    } else if (curShopTab === 'decor') {
      const decors = [
        ...DECOR_CATALOG.map((d) => ({ id: d.id, ico: d.ico, name: d.name, desc: d.desc, price: d.price, type: 'decor' })),
        { id: 'skin_daju_cape', ico: '👑', name: '大橘「王者披风」皮肤', desc: '纪念皮肤 · 队长专属威风外观', price: 680, type: 'skin' },
        { id: 'skin_jin_crown', ico: '🍯', name: '金舔舔「蜂蜜皇冠」皮肤', desc: '纪念皮肤 · 甜蜜亮晶晶头饰', price: 880, type: 'skin' }
      ];
      listEl.innerHTML = decors.map((d) => {
        const ownedList = d.type === 'decor' ? (st.decorOwned || []) : (st.skinsOwned || []);
        const eqList = d.type === 'decor' ? (st.decorEquipped || []) : (st.skinsEquipped || []);
        const owned = ownedList.includes(d.id);
        const equipped = eqList.includes(d.id);
        const btn = !owned
          ? `<button class="pbtn primary sm" data-act="buy_cosmetic" data-kind="${d.type}" data-id="${d.id}" data-price="${d.price}" data-label="${d.name}">🪙 ${d.price}</button>`
          : `<button class="pbtn ${equipped ? '' : 'primary'} sm" data-act="toggle_cosmetic" data-kind="${d.type}" data-id="${d.id}" data-label="${d.name}">${equipped ? '已摆放/佩戴' : (d.type === 'decor' ? '去摆放' : '佩戴')}</button>`;
        return `<div class="shop-item">
          <div class="si-ico" style="background:#FFF5E6">${d.ico}</div>
          <div class="si-body"><b>${d.name}</b><small>${d.desc}</small></div>
          ${btn}
        </div>`;
      }).join('');
    }

    $$('[data-act]', listEl).forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        const price = Number(b.dataset.price || 0);
        const cur = Store.get();
        if (act === 'buy_food') {
          if (!Store.spendGold(price)) return showToast('金币不够啦！打塔防或收离线金币吧');
          cur.items[b.dataset.key] = (cur.items[b.dataset.key] || 0) + 1;
          Store.save();
          showToast(`买到了 ${b.dataset.label} ×1`);
        } else if (act === 'buy_ali') {
          if (!Store.spendGold(8500)) return showToast('金币还差一点！慢节奏长线攒钱目标为 8,500');
          Store.unlockCat('ali');
          showToast('🎉 成功购买解锁「阿狸（狸花猫）」！');
          renderYard();
        } else if (act === 'buy_td') {
          if (!Store.spendGold(price)) return showToast('金币不够啦！');
          cur.tdProps[b.dataset.key] = (cur.tdProps[b.dataset.key] || 0) + 1;
          Store.save();
          showToast(`🛡️ 已购入 ${b.dataset.label} ×1，可在塔防战局直接使用`);
        } else if (act === 'buy_cosmetic') {
          if (!Store.spendGold(price)) return showToast('金币不够啦！');
          const ownArr = b.dataset.kind === 'decor' ? cur.decorOwned : cur.skinsOwned;
          const eqArr = b.dataset.kind === 'decor' ? cur.decorEquipped : cur.skinsEquipped;
          if (!ownArr.includes(b.dataset.id)) ownArr.push(b.dataset.id);
          if (!eqArr.includes(b.dataset.id)) eqArr.push(b.dataset.id);
          const itemDef = DECOR_CATALOG.find((x) => x.id === b.dataset.id);
          if (itemDef) setYardPan(itemDef.panX);
          Store.save();
          renderYardDecor();
          showToast(`✨ 已解锁并摆放「${b.dataset.label}」！去家园即可互动`);
        } else if (act === 'toggle_cosmetic') {
          const eqArr = b.dataset.kind === 'decor' ? cur.decorEquipped : cur.skinsEquipped;
          const idx = eqArr.indexOf(b.dataset.id);
          if (idx >= 0) {
            eqArr.splice(idx, 1);
            showToast(`已收起「${b.dataset.label}」`);
          } else {
            eqArr.push(b.dataset.id);
            showToast(`✨ 已摆放/佩戴「${b.dataset.label}」`);
          }
          Store.save();
          renderYardDecor();
        }
        openShopModal(curShopTab);
      });
    });

    $('#modalShop').classList.add('open');
  }

  function initModals() {
    $('#openSignBtn').addEventListener('click', openSignModal);
    $('#doSignBtn').addEventListener('click', () => {
      const r = Store.doSignIn();
      if (!r.ok) return showToast(r.msg);
      showToast(`📅 第${r.day}天签到成功：${r.txt}`);
      renderYard();
      openSignModal();
    });

    $('#openShopBtn').addEventListener('click', () => openShopModal());
    $$('.shop-tab', $('#shopTabs')).forEach((btn) => {
      btn.addEventListener('click', () => openShopModal(btn.dataset.tab));
    });
    function playSoundCue() {
      if (window.SFX) { window.SFX.play('upgrade'); return; }
      const st = Store.get();
      if (!st.soundOn || (st.soundVolume || 0) <= 0) return;
    }

    function syncSoundUI() {
      const st = Store.get();
      const vol = typeof st.soundVolume === 'number' ? st.soundVolume : 70;
      const on = !!st.soundOn;
      $('#soundToggle').checked = on;
      $('#volumeSlider').value = vol;
      $('#volumeSlider').disabled = !on;
      $('#volumeSlider').style.setProperty('--p', `${vol}%`);
      $('#volumeVal').textContent = on ? `${vol}%` : '静音';
      $('#soundStatusTip').textContent = on ? `当前已开启（音量 ${vol}%）` : '当前已关闭所有游戏声音';
      $('#volumeRow').classList.toggle('muted', !on);
    }

    function openSettingsModal() {
      syncSoundUI();
      $('#sandboxToggle').checked = Store.get().sandboxAll;
      $('#modalSettings').classList.add('open');
    }

    $('#openSettingsBtn').addEventListener('click', openSettingsModal);
    $('#lobbySettingsBtn').addEventListener('click', openSettingsModal);

    $('#soundToggle').addEventListener('change', (e) => {
      Store.get().soundOn = e.target.checked;
      Store.save();
      syncSoundUI();
      if (e.target.checked) playSoundCue();
      showToast(e.target.checked ? '🔊 已开启游戏声音' : '🔇 已关闭游戏声音');
    });

    $('#volumeSlider').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      Store.get().soundVolume = val;
      if (val > 0 && !Store.get().soundOn) Store.get().soundOn = true;
      Store.save();
      syncSoundUI();
    });
    $('#volumeSlider').addEventListener('change', () => playSoundCue());

    $('#sandboxToggle').addEventListener('change', (e) => {
      Store.get().sandboxAll = e.target.checked;
      Store.save();
      renderYard();
      showToast(e.target.checked ? '🧪 已开启全 9 猫试玩预览' : '🔒 已切换为按真实解锁显示');
    });

    $('#exportSaveBtn').addEventListener('click', () => {
      $('#saveCodeBox').value = Store.exportCode();
      showToast('💾 已生成本地存档备份码');
    });
    $('#importSaveBtn').addEventListener('click', () => {
      const ok = Store.importCode($('#saveCodeBox').value);
      showToast(ok ? '✅ 存档导入成功！' : '❌ 备份码无效');
      if (ok) renderYard();
    });
    $('#resetSaveBtn').addEventListener('click', () => {
      Store.reset();
      renderYard();
      renderLobbyShowcase();
      $('#modalSettings').classList.remove('open');
      showToast('🔄 本地存档已重置');
    });

    $$('[data-close]').forEach((b) => {
      b.addEventListener('click', () => $(`#${b.dataset.close}`).classList.remove('open'));
    });
  }

  /* ===== 5. 视图切换与初始化 ===== */
  const TITLES = {
    lobby: '🐾 喵喵救援队',
    home: '🏡 猫咪家园',
    'td-select': '🗺️ 选择关卡 · 第1章',
    td: '🛡️ 剧情闯关 · 第1章',
    modes: '🎮 更多玩法',
    minigame: '🐟 接小鱼干大作战',
    dex: '📖 猫咪图鉴'
  };

  function switchDemoView(view, arg) {
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
    phone.classList.toggle('dex-mode', view !== 'home');
    phone.classList.toggle('lobby-mode', view === 'lobby');
    phone.classList.toggle('td-battle-mode', view === 'td');
    hudTitle.textContent = TITLES[view] || '🐾 喵喵救援队';
    hudBackBtn.style.display = (view === 'lobby' || view === 'td') ? 'none' : 'inline-block';

    if (view === 'td-select' && window.initTdSelectDemo) window.initTdSelectDemo();
    if (view === 'td' && window.initTdDemo) window.initTdDemo(arg);
    if (view === 'minigame' && window.initMiniGameDemo) window.initMiniGameDemo();
    if (view === 'home') renderYard();
    syncGlobalUI();
  }
  window.switchDemoView = switchDemoView;

  function initNav() {
    hudBackBtn.addEventListener('click', () => switchDemoView('lobby'));
    $('#launchCatchGameBtn').addEventListener('click', () => switchDemoView('minigame'));

    $('#prevBtn').addEventListener('click', () => stepDetail(-1));
    $('#nextBtn').addEventListener('click', () => stepDetail(1));
    $('#closeBtn').addEventListener('click', () => { detailEl.classList.remove('open'); clearTimeout(stageActionTimer); });
    $('#actionBtn').addEventListener('click', playStageAction);
    detailEl.addEventListener('click', (e) => { if (e.target === detailEl) { detailEl.classList.remove('open'); } });
  }

  initLobby();
  initHomeActions();
  initDex();
  initModals();
  initNav();
  switchDemoView('lobby');
})();
