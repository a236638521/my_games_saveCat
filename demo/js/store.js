/* 纯单机本地存档与经济管理器（v0.4） */
(function () {
  const KEY = 'saveCat_v4_demo';
  const PET_COOLDOWN_MS = 3600 * 1000;
  const EXP_NEXT = [0, 100, 200, 350, 550, 800, 1100, 1500, 2000, 2600, 0];

  function defaultState() {
    const now = Date.now();
    return {
      gold: 200,
      items: { kibble: 5, strip: 1, can: 1 },
      tdProps: { fishbag: 1, freeze: 1, bell: 0 },
      decorOwned: [],
      decorEquipped: [],
      skinsOwned: [],
      skinsEquipped: [],
      unlocked: ['dajv'],
      sandboxAll: true, // Demo 默认开启"全猫塔试玩体验"，可在首页/选关切换
      showcaseCat: 'dajv',
      tdDeck: ['dajv', 'yinxiaomei', 'xiaobuding', 'xiaoluo'],
      intimacy: { dajv: { lv: 1, xp: 0 } },
      fullness: { dajv: 20 },
      lastPetAt: {},
      lastTickTs: now,
      lastOfflineCollectTs: now - 3 * 3600 * 1000, // Demo 初始送 3 小时可领离线金币方便体验
      adCount: 0,
      signInCount: 0,
      lastSignInDay: '',
      tdStars: {},
      miniGameBest: 0,
      soundOn: true,
      soundVolume: 70
    };
  }

  function mergeState(obj) {
    const def = defaultState();
    const s = Object.assign(def, obj || {});
    s.items = Object.assign(def.items, (obj && obj.items) || {});
    s.tdProps = Object.assign(def.tdProps, (obj && obj.tdProps) || {});
    if (!Array.isArray(s.decorOwned)) s.decorOwned = [];
    if (!Array.isArray(s.decorEquipped)) s.decorEquipped = [];
    if (!Array.isArray(s.skinsOwned)) s.skinsOwned = [];
    if (!Array.isArray(s.skinsEquipped)) s.skinsEquipped = [];
    if (!Array.isArray(s.tdDeck) || !s.tdDeck.length) s.tdDeck = def.tdDeck.slice();
    if (!s.lastPetAt || typeof s.lastPetAt !== 'object') s.lastPetAt = {};
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return mergeState(JSON.parse(raw));
    } catch (_) {
      return defaultState();
    }
  }

  let data = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
    if (window.onStoreUpdate) window.onStoreUpdate(data);
  }

  function tickTime() {
    const now = Date.now();
    if (now < data.lastTickTs) return; // 单机时间倒流保护
    const hours = (now - data.lastTickTs) / 3600000;
    if (hours > 0.01) {
      for (const id of Object.keys(data.fullness)) {
        data.fullness[id] = Math.max(0, +(data.fullness[id] - hours * 10).toFixed(2));
      }
      data.lastTickTs = now;
      save();
    }
  }

  function getCatIntimacy(id) {
    if (!data.intimacy[id]) data.intimacy[id] = { lv: 1, xp: 0 };
    return data.intimacy[id];
  }

  function addIntimacy(id, amount) {
    const st = getCatIntimacy(id);
    let bonus = 0;
    st.xp += amount;
    let leveledUp = false;
    while (st.lv < 10 && st.xp >= EXP_NEXT[st.lv]) {
      st.xp -= EXP_NEXT[st.lv];
      st.lv += 1;
      leveledUp = true;
      const g = st.lv * 50;
      data.gold += g;
      bonus += g;
    }
    save();
    return { lv: st.lv, xp: st.xp, next: EXP_NEXT[st.lv], leveledUp, goldBonus: bonus };
  }

  function calcOfflineGold() {
    const now = Date.now();
    if (now <= data.lastOfflineCollectTs) return 0;
    const hours = Math.min(8, (now - data.lastOfflineCollectTs) / 3600000);
    let hourly = 0;
    for (const id of data.unlocked) {
      const lv = getCatIntimacy(id).lv;
      hourly += 4 + 0.5 * (lv - 1);
    }
    hourly = Math.min(65, hourly);
    return Math.floor(hourly * hours);
  }

  function collectOfflineGold() {
    const amt = calcOfflineGold();
    if (amt <= 0) return 0;
    data.gold += amt;
    data.lastOfflineCollectTs = Date.now();
    save();
    return amt;
  }

  function feedCat(id, foodKey) {
    tickTime();
    const curFull = data.fullness[id] || 0;
    if ((data.items[foodKey] || 0) <= 0) return { ok: false, reason: '背包里没有这个食物了，去商店买点吧' };

    const defs = {
      kibble: { int: 20, full: 20, name: '猫粮' },
      strip: { int: 45, full: 15, name: '猫条' },
      can: { int: 100, full: 40, name: '猫罐头' }
    };
    const f = defs[foodKey];
    data.items[foodKey] -= 1;
    data.fullness[id] = Math.min(100, curFull + f.full);
    const mult = id === 'dajv' ? 1.1 : 1;
    const res = addIntimacy(id, Math.round(f.int * mult));
    return { ok: true, gainInt: Math.round(f.int * mult), fullness: Math.round(data.fullness[id]), res };
  }

  function canPetCat(id) {
    const last = (data.lastPetAt && data.lastPetAt[id]) || 0;
    const elapsed = Math.max(0, Date.now() - last);
    const remainMs = Math.max(0, PET_COOLDOWN_MS - elapsed);
    return {
      ok: remainMs === 0,
      remainMs,
      remainMin: Math.ceil(remainMs / 60000)
    };
  }

  function petCat(id) {
    const chk = canPetCat(id);
    if (!chk.ok) return { ok: false, remainMs: chk.remainMs, remainMin: chk.remainMin };
    if (!data.lastPetAt) data.lastPetAt = {};
    data.lastPetAt[id] = Date.now();
    const gain = id === 'xiaobuding' ? 12 : (id === 'feifei' ? 20 : 10);
    const res = addIntimacy(id, gain);
    return { ok: true, gain, res };
  }

  function unlockCat(id) {
    if (!data.unlocked.includes(id)) {
      data.unlocked.push(id);
      if (!data.intimacy[id]) data.intimacy[id] = { lv: 1, xp: 0 };
      if (data.fullness[id] === undefined) data.fullness[id] = 10;
      save();
      return true;
    }
    return false;
  }

  function recordAd() {
    data.adCount += 1;
    let unlockedTom = false;
    if (data.adCount >= 10 && !data.unlocked.includes('tangmu')) {
      unlockCat('tangmu');
      unlockedTom = true;
    }
    save();
    return { adCount: data.adCount, unlockedTom };
  }

  function doSignIn() {
    const today = new Date().toISOString().slice(0, 10);
    if (data.lastSignInDay === today) return { ok: false, msg: '今天已经签过到啦（Demo 可在设置重置存档再测）' };
    if (data.signInCount >= 7) return { ok: false, msg: '7日新手签到已全部领完！' };
    data.signInCount += 1;
    data.lastSignInDay = today;
    const rewards = [
      { g: 50, item: 'kibble', cnt: 2, txt: '🪙+50, 猫粮×2' },
      { g: 80, item: 'strip', cnt: 1, txt: '🪙+80, 猫条×1' },
      { g: 100, cat: 'jintiantian', txt: '🪙+100, 解锁「金舔舔」!' },
      { g: 120, item: 'can', cnt: 1, txt: '🪙+120, 猫罐头×1' },
      { g: 150, item: 'strip', cnt: 2, txt: '🪙+150, 猫条×2' },
      { g: 200, item: 'can', cnt: 1, txt: '🪙+200, 猫罐头×1' },
      { g: 300, cat: 'feifei', txt: '🪙+300, 解锁「菲菲」!' }
    ];
    const r = rewards[data.signInCount - 1];
    data.gold += r.g;
    if (r.item) data.items[r.item] = (data.items[r.item] || 0) + r.cnt;
    if (r.cat) unlockCat(r.cat);
    save();
    return { ok: true, day: data.signInCount, txt: r.txt, cat: r.cat };
  }

  window.Store = {
    get: () => { tickTime(); return data; },
    save,
    EXP_NEXT,
    getCatIntimacy,
    addIntimacy,
    calcOfflineGold,
    collectOfflineGold,
    feedCat,
    canPetCat,
    petCat,
    unlockCat,
    recordAd,
    doSignIn,
    addGold: (g) => { data.gold += g; save(); },
    spendGold: (g) => { if (data.gold < g) return false; data.gold -= g; save(); return true; },
    getPlayableCats: () => {
      const cats = window.CATS || [];
      return data.sandboxAll ? cats : cats.filter((c) => data.unlocked.includes(c.id));
    },
    exportCode: () => btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    importCode: (code) => {
      try {
        const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        data = mergeState(obj);
        save();
        return true;
      } catch (_) { return false; }
    },
    reset: () => { data = defaultState(); save(); }
  };
})();
