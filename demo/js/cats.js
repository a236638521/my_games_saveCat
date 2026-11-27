/* 第一期 9 只猫咪数据（v0.4 保卫萝卜式塔防 + 2.5D 外形参数）
 * 与 docs/GDD_v0.4.md 第 5 节保持一致
 */
window.CATS = [
  {
    id: 'dajv', name: '大橘', breed: '橘猫', sex: '♂', verb: '重锤拆障', verbIcon: '📦',
    acquire: { type: 'init', text: '初始拥有' },
    tags: ['贪吃', '重击溅射', '拆障专家'],
    theme: '#FFE2C2',
    look: '圆滚滚的橘色大胖猫，额头有"王"字虎纹，白下巴、白肚皮，尾巴上一圈圈环纹，脖子挂着小鱼骨铃铛。',
    intro: '小区流浪猫的前任老大，饭量能顶三只猫，力气也大得惊人，一屁股能把纸箱坐扁。被你收养那天，它把珍藏的最后一条小鱼干推到你脚边——从此它就是你的第一个家人，也是喵喵救援队的队长。',
    td: { cost: 60, range: 1.85, rate: 1.25, dmg: 32, color: '#FF8C42', role: '重锤拆障塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '纸箱重砸', desc: '丢出沉重纸箱砸向目标，造成小范围溅射伤害，顺带敲碎路边障碍物。' },
      { lv: 3, kind: '被动', name: '拆箱专家', desc: '攻击纸箱/花盆等路边障碍物时，伤害额外 +35%，更快爆出鲜鱼点。' },
      { lv: 5, kind: 'MAX阶', name: '黄金大纸箱', desc: '解锁局内 Lv3 → Lv MAX 形态，纸箱变大且溅射范围更广。' },
      { lv: 7, kind: '大招', name: '泰山压顶', desc: '向血量最高的目标区域跳砸，造成巨额范围伤害并击退敌人。' },
      { lv: 10, kind: '皮肤', name: '大橘为重', desc: '老大专属披风 + 家园特殊动作。' }
    ],
    home: '永远守在饭盆边，喂食获得的亲密度 +10%。',
    food: '鸡肉罐头', quote: '开饭了吗？有障碍交给我来砸！',
    action: 'eat', actionName: '干饭推土机',
    art: {
      base: '#F6A24B', stripe: '#DB7426', belly: '#FFF6EA', muzzle: '#FFF6EA',
      eye: '#F2A93B', pattern: 'wang', bodyW: 58, tail: 'rings', acc: ['fishbell']
    }
  },
  {
    id: 'jintiantian', name: '金舔舔', breed: '金渐层', sex: '♂', verb: '毒伤+攻速', verbIcon: '👅',
    acquire: { type: 'sign', text: '累计签到第 3 天' },
    tags: ['爱舔', '持续毒伤', '攻速光环'],
    theme: '#FFF0C9',
    look: '奶油金色的毛，背部和尾巴有金棕色渐层，碧绿色大眼睛，粉色小舌头永远收不回去，胸前一撮蓬松的白毛。',
    intro: '从小就喜欢到处舔：舔别的小猫、舔玩具、舔人类的脸，连镜子里的自己都不放过。在金舔舔的世界里，没有什么问题是舔一舔解决不了的——如果有，那就多舔几下。',
    td: { cost: 75, range: 1.75, rate: 1.0, dmg: 14, color: '#F2B84B', role: '毒伤辅助塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '舔舔粘液', desc: '使敌人持续掉血并轻微减速，同时提升相邻 4 格内猫咪塔的攻速。' },
      { lv: 3, kind: '被动', name: '热情传染', desc: '受到攻速加成的队友暴击率 +10%。' },
      { lv: 5, kind: 'MAX阶', name: '蜂蜜糖浆', desc: '解锁局内 Lv3 → Lv MAX 形态，持续毒伤翻倍。' },
      { lv: 7, kind: '大招', name: '疯狂舔舔', desc: '8 秒内全图猫咪塔攻速大幅提升，全力输出！' },
      { lv: 10, kind: '皮肤', name: '蜂蜜王子', desc: '蜂蜜罐王冠 + 家园特殊动作。' }
    ],
    home: '会主动去舔其他猫，被舔过的猫当天互动亲密度 +5。',
    food: '三文鱼猫条', quote: '让我舔一口！队友攻速也变快啦！',
    action: 'lick', actionName: '舔舔大法',
    art: {
      base: '#F7DDA4', shade: '#C98E3E', belly: '#FFF8E8', muzzle: '#FFF8E8',
      eye: '#4DB86A', pattern: 'shaded', bodyW: 48, tail: 'shadedTip', acc: ['chestfluff', 'tongue']
    }
  },
  {
    id: 'yinxiaomei', name: '银小妹', breed: '银渐层', sex: '♀', verb: '极速连射', verbIcon: '🎀',
    acquire: { type: 'main', text: '主线第 10 关' },
    tags: ['优雅', '极速连射', '暴击单体'],
    theme: '#E6EEF3',
    look: '银白色的毛，背部和尾尖带银灰色渐层，翠绿色眼睛，身材娇小纤细，左耳戴着粉色蝴蝶结。',
    intro: '院子里最轻盈的小姑娘，走路像踮着脚尖跳芭蕾，能轻松跳上一人高的柜子，从不碰倒任何东西。被大橘从高高的空调外机上救下来以后，银小妹就决定：以后换我来守护大家。',
    td: { cost: 65, range: 2.3, rate: 0.42, dmg: 15, color: '#6DAEDB', role: '极速连射塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '芭蕾飞针', desc: '像瓶子炮一样高速连射银针，对单个敌人持续倾泻火力。' },
      { lv: 3, kind: '被动', name: '轻盈暴击', desc: '每第 5 次攻击必定触发 1.8 倍暴击。' },
      { lv: 5, kind: 'MAX阶', name: '双发月光针', desc: '解锁局内 Lv3 → Lv MAX 形态，每次射击放出双发银针。' },
      { lv: 7, kind: '大招', name: '天鹅湖', desc: '6 秒内自身射速翻倍并自动追击跑得最前的敌人。' },
      { lv: 10, kind: '皮肤', name: '月光芭蕾', desc: '芭蕾纱裙 + 家园特殊动作。' }
    ],
    home: '喜欢待在院子里最高的家具上。',
    food: '鳕鱼冻干', quote: '嘘——优雅，连射也要保持优雅。',
    action: 'jump', actionName: '芭蕾跳跃',
    art: {
      base: '#F1F4F6', shade: '#8E9AA6', belly: '#FFFFFF', muzzle: '#FFFFFF',
      eye: '#2FBF8A', pattern: 'shaded', bodyW: 40, tail: 'shadedTip', tailW: 11, acc: ['bow']
    }
  },
  {
    id: 'xiaobuding', name: '小布丁', breed: '布偶猫', sex: '♀', verb: '范围减速', verbIcon: '☁️',
    acquire: { type: 'main', text: '主线第 20 关' },
    tags: ['温柔', '范围减速', '群体催眠'],
    theme: '#EAF1FF',
    look: '长长的奶白色蓬松毛，脸、耳朵和尾巴是海豹褐重点色，戴着四只白手套，宝石蓝大眼睛，脖子一圈蓬松的围脖毛。',
    intro: '一抱起来就全身瘫软，像只真正的布娃娃。小布丁能在任何地方睡着——大家起初以为它只会睡觉，后来才发现，它的呼噜声能把冲过来的野狗和老鼠都催眠放慢！',
    td: { cost: 70, range: 1.9, rate: 1.1, dmg: 10, color: '#79A8FF', role: '呼噜减速塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '呼噜减速波', desc: '持续散发软绵呼噜波，让范围内所有敌人移速大幅降低 45%。' },
      { lv: 3, kind: '被动', name: '棉花糖粘滞', desc: '延长减速效果持续时间，让队友有更充裕的输出窗口。' },
      { lv: 5, kind: 'MAX阶', name: '软绵催眠阵', desc: '解锁局内 Lv3 → Lv MAX 形态，减速范围更大、时间更久且伤害提升。' },
      { lv: 7, kind: '大招', name: '呼噜催眠', desc: '发出超大声呼噜，让全屏所有敌人原地沉睡 3 秒！' },
      { lv: 10, kind: '皮肤', name: '云朵布丁', desc: '云朵睡衣 + 家园特殊动作。' }
    ],
    home: '一摸就翻肚皮，抚摸获得的亲密度 ×1.2。',
    food: '羊奶布丁', quote: '呼噜……大家一起慢下来睡一觉嘛……',
    action: 'flop', actionName: '布偶瘫',
    art: {
      base: '#FBF5EA', points: '#7A5A48', belly: '#FFFFFF', muzzle: '#FFFFFF', paw: '#FFFFFF',
      eye: '#3D8BFF', pattern: 'ragdoll', bodyW: 52, tail: 'points', tailW: 20, acc: ['ruff']
    }
  },
  {
    id: 'xiaoluo', name: '小罗', breed: '暹罗猫', sex: '♂', verb: '全向声波', verbIcon: '📢',
    acquire: { type: 'main', text: '主线第 30 关' },
    tags: ['话痨', '全向AOE', '太阳花清场'],
    theme: '#F3EADF',
    look: '奶油色的身体，脸、耳朵、四爪和尾巴是深咖啡色重点色（"挖煤脸"），冰蓝色眼睛，身材修长，脖子挂着小喇叭吊坠。',
    intro: '院子里的"大喇叭"，一天到晚喵个不停，从早饭聊到晚饭。小罗的嗓门大到能把三条街外的狗狗震得晕头转向——非常适合放在拐角中心做全向声波清场。',
    td: { cost: 90, range: 1.65, rate: 1.15, dmg: 24, color: '#D98A4E', role: '全向声波塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '喵喵声波圈', desc: '向四周 360° 扩散声波环，同时伤害圈内所有敌人与路边障碍物。' },
      { lv: 3, kind: '被动', name: '大嗓门', desc: '声波覆盖半径 +15%，轻松波及双车道拐角。' },
      { lv: 5, kind: 'MAX阶', name: '摇滚重低音', desc: '解锁局内 Lv3 → Lv MAX 形态，一次连续释放两圈共振声波。' },
      { lv: 7, kind: '大招', name: '狮吼功', desc: '震耳欲聋的全屏猫叫，对所有敌人造成大量伤害并震晕 1.5 秒。' },
      { lv: 10, kind: '皮肤', name: '摇滚歌手', desc: '墨镜 + 小吉他 + 家园特殊动作。' }
    ],
    home: '你一进家园它就跑来迎接，每天第一次进家园额外送金币。',
    food: '金枪鱼猫条', quote: '喵！喵喵！看我全屏大喇叭！',
    action: 'meow', actionName: '喵喵大喇叭',
    art: {
      base: '#F4E8D6', points: '#4A3428', shade: '#CDB79A', muzzle: null, paw: '#4A3428',
      eye: '#5CC4FF', pattern: 'pointed', bodyW: 42, tail: 'points', tailW: 11, acc: ['horn']
    }
  },
  {
    id: 'tangmu', name: '汤姆', breed: '蓝白猫', sex: '♂', verb: '抛物眩晕', verbIcon: '😼',
    acquire: { type: 'ad', text: '累计看广告 10 次' },
    tags: ['捣蛋', '抛杯轰炸', '范围眩晕'],
    theme: '#E3E9F2',
    look: '上半身蓝灰色，嘴巴、胸口和四爪雪白（像穿着白衬衫、白袜子），圆脸，铜色圆眼睛，嘴角总挂着坏笑。',
    intro: '桌上的杯子？拍下去。架子上的花瓶？拍下去。汤姆是院子里的头号拆家大王，但在守护小猫的战场上，他把高空抛物变成了精准的范围眩晕轰炸！',
    td: { cost: 95, range: 2.8, rate: 1.75, dmg: 38, color: '#6E82A6', role: '抛物轰炸塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '推杯换盏', desc: '超远抛物线砸出马克杯，造成范围爆炸伤害并短暂眩晕敌人。' },
      { lv: 3, kind: '被动', name: '拆家惯犯', desc: '杯子碎片飞溅，额外弹伤周围 1 个障碍物。' },
      { lv: 5, kind: 'MAX阶', name: '豪华茶壶弹', desc: '解锁局内 Lv3 → Lv MAX 形态，爆炸范围与眩晕时长显著提高。' },
      { lv: 7, kind: '大招', name: '高空坠物', desc: '对场上血量最高的 3 个区域连续空投大花瓶轰炸！' },
      { lv: 10, kind: '皮肤', name: '绅士汤姆', desc: '小礼帽 + 领结 + 家园特殊动作。' }
    ],
    home: '偶尔把家具上的小摆件拍到地上，捡起来能得到金币。',
    food: '牛肉冻干', quote: '这个杯子……它自己飞过去砸怪的。',
    action: 'knock', actionName: '推杯换盏',
    art: {
      base: '#8C9AAE', belly: '#FFFFFF', muzzle: '#FFFFFF', paw: '#FFFFFF',
      eye: '#E8892B', pattern: 'bicolor', bodyW: 48, tail: 'plain', mouth: 'smirk', acc: []
    }
  },
  {
    id: 'feifei', name: '菲菲', breed: '三花猫', sex: '♀', verb: '狙击招财', verbIcon: '👑',
    acquire: { type: 'sign', text: '累计签到第 7 天' },
    tags: ['傲娇', '精英狙击', '击杀招财'],
    theme: '#FFF1E6',
    look: '白底毛色，头顶和背上有橘色、黑色两色花斑，一侧眼睛被黑斑包着，琥珀色眼睛，头戴小金冠，尾巴总是高高翘起。',
    intro: '三花猫几乎都是小母猫，传说还能招来好运。菲菲是院子里的小女王，用她那双眼睛锁定谁，谁就又痛又动弹不得，而且顺带替大家招来额外的鲜鱼点！',
    td: { cost: 85, range: 3.2, rate: 1.5, dmg: 46, color: '#F09D42', role: '狙击招财塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '女王射线', desc: '超远射程精准点杀高血量敌人，单发伤害极高。' },
      { lv: 3, kind: '被动', name: '招福体质', desc: '菲菲亲自击杀敌人时，额外爆出 +30% 鲜鱼点。' },
      { lv: 5, kind: 'MAX阶', name: '金色幸运光', desc: '解锁局内 Lv3 → Lv MAX 形态，射线附带破甲易伤与暴击效果。' },
      { lv: 7, kind: '大招', name: '女王凝视', desc: '定身全屏血量最高的目标 4 秒，并使其受到的所有伤害 +50%！' },
      { lv: 10, kind: '皮肤', name: '招福女王', desc: '招财猫和服 + 家园特殊动作。' }
    ],
    home: '傲娇，每天能抚摸的次数少 1 次，但每次获得的亲密度翻倍。',
    food: '高级三文鱼罐头', quote: '哼，这只肥老鼠归本女王了。',
    action: 'stare', actionName: '女王凝视',
    art: {
      base: '#FFFDF8', orange: '#F0A04B', black: '#3A3330', muzzle: null,
      eye: '#F0B430', pattern: 'calico', bodyW: 44, tail: 'calico', lids: true, acc: ['crown']
    }
  },
  {
    id: 'ali', name: '阿狸', breed: '狸花猫', sex: '♂', verb: '弹射刺客', verbIcon: '🌿',
    acquire: { type: 'shop', text: '金币商店 8500' },
    tags: ['勇敢', '连环弹射', '收割斩杀'],
    theme: '#EDEBDD',
    look: '棕灰色的毛，全身黑色鱼骨状条纹，额头有清晰的"M"字纹，黄绿色眼睛，身材结实，戴着一条绿色小头巾。',
    intro: '中华田园猫里的"特种兵"，身手矫健，擅长在屋檐和怪物群之间连续弹射突袭。虽然有点高冷，但只要他在场上，漏网的小老鼠一个也跑不掉。',
    td: { cost: 100, range: 2.2, rate: 0.9, dmg: 28, color: '#58A45C', role: '弹射刺客塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '飞镖连弹', desc: '掷出飞镖在敌人间连续弹射 3 次，对残血敌人伤害大幅提升。' },
      { lv: 3, kind: '被动', name: '街头掠夺', desc: '每次弹射命中都有概率额外偷取少量鲜鱼点。' },
      { lv: 5, kind: 'MAX阶', name: '五连手里剑', desc: '解锁局内 Lv3 → Lv MAX 形态，弹射次数增加到 5 次。' },
      { lv: 7, kind: '大招', name: '飞檐走壁', desc: '化身疾风残影沿全图路径往返突袭一圈，收割残血敌人！' },
      { lv: 10, kind: '皮肤', name: '侠客阿狸', desc: '斗笠 + 披风 + 家园特殊动作。' }
    ],
    home: '每天夜里带回一件"战利品"（随机道具或家具材料）。',
    food: '鸡胸肉干', quote: '跑得再快，也逃不过三连弹射。',
    action: 'climb', actionName: '飞檐走壁',
    art: {
      base: '#B3A58F', stripe: '#3B332B', belly: '#E9E0CF', muzzle: '#EFE8DA',
      eye: '#B5D13F', pattern: 'mackerel', bodyW: 48, tail: 'rings', acc: ['bandana']
    }
  },
  {
    id: 'wukong', name: '悟空', breed: '简州猫', sex: '♂', verb: '穿透激光', verbIcon: '🐒',
    acquire: { type: 'main', text: '主线第 40 关' },
    tags: ['机灵', '穿透激光', '全图狙杀'],
    theme: '#FFF0CF',
    look: '金黄色短毛带浅色虎斑，一对大耳朵，每只耳朵里还多长了一片小耳廓（"四耳猫"），金色眼睛，额头戴着一圈金箍。',
    intro: '来自四川简阳的本土名猫，耳廓里多长了一层小耳朵，人称"四耳猫"，也是远近闻名的捕鼠高手。悟空用顺风耳锁定整条直线上的敌人，一道金光直接贯穿全场！',
    td: { cost: 110, range: 2.6, rate: 1.35, dmg: 36, color: '#E8A838', role: '穿透激光塔' },
    skills: [
      { lv: 1, kind: '普攻', name: '火眼激光', desc: '射出超长穿透金光，同时贯穿一条直线上的多个敌人与障碍物。' },
      { lv: 3, kind: '被动', name: '顺风耳', desc: '自动揭露周围范围内的隐身或钻地敌人。' },
      { lv: 5, kind: 'MAX阶', name: '大圣金光炮', desc: '解锁局内 Lv3 → Lv MAX 形态，激光更粗且附带持续灼烧。' },
      { lv: 7, kind: '大招', name: '金箍棒降临', desc: '指定一条路径召唤巨型金箍棒横扫全线，造成毁灭性穿透伤害！' },
      { lv: 10, kind: '皮肤', name: '齐天大圣', desc: '战甲 + 披风 + 金箍棒 + 家园特殊动作。' }
    ],
    home: '有它在院子里巡逻，访客带来的礼物品质会提升。',
    food: '清水煮羊肉', quote: '俺老猫的金光，能直接穿成一串！',
    action: 'listen', actionName: '顺风耳 · 筋斗翻',
    art: {
      base: '#E8B65A', stripe: '#C88A33', belly: '#FFF1D2', muzzle: '#FFF1D2',
      eye: '#F5C518', pattern: 'tabbyLight', bodyW: 46, tail: 'rings', bigEars: true, acc: ['headband']
    }
  }
];

window.ACQUIRE_STYLE = {
  init: { label: '初始', color: '#FF9F43' },
  main: { label: '主线', color: '#4C9AFF' },
  sign: { label: '签到', color: '#2ECC71' },
  shop: { label: '商店', color: '#F5B700' },
  ad:   { label: '广告', color: '#A66CFF' }
};
