/* 2.5D Q版手办/盲盒风 参数化猫咪 SVG 生成器
 * 3/4 立体视角 + 球体受光渐变 + 轮廓光 + 叠层四肢与立体配饰
 * viewBox 0 0 220 240
 */
(function () {
  let uid = 0;
  const OUTLINE = '#4D352B';

  // 颜色明暗工具：amt > 0 提亮，amt < 0 压暗
  function shiftColor(hex, amt) {
    const n = parseInt(hex.replace('#', ''), 16);
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(((n >> 16) & 255) + amt);
    const g = clamp(((n >> 8) & 255) + amt);
    const b = clamp((n & 255) + amt);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function grad3D(id, base, lightShift = 28, darkShift = -36, cx = '34%', cy = '26%') {
    const hi = shiftColor(base, lightShift);
    const lo = shiftColor(base, darkShift);
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="72%">
      <stop offset="0%" stop-color="${hi}"/>
      <stop offset="52%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${lo}"/>
    </radialGradient>`;
  }

  // 3/4 视角立体圆润猫耳（far: 右后侧远耳；near: 左前侧近耳）
  function ear25D(side, a, colors, id) {
    const big = !!a.bigEars;
    const isNear = side === 'l';
    const c = colors[side];
    const cShade = shiftColor(c, isNear ? -18 : -34);
    const inner = a.earInner || '#FFABB2';

    // 圆润 Q 版立体耳廓，不再使用尖锐三角形
    const outerPath = isNear
      ? (big
          ? 'M 42 82 C 33 42 42 12 67 14 C 85 16 95 36 92 51 Z'
          : 'M 47 77 C 40 44 48 20 68 22 C 83 24 91 40 89 52 Z')
      : (big
          ? 'M 128 52 C 129 34 142 14 162 15 C 181 17 186 44 176 80 Z'
          : 'M 131 53 C 133 38 144 22 159 23 C 175 25 179 47 171 76 Z');
    const innerPath = isNear
      ? (big
          ? 'M 52 72 C 47 46 53 26 67 27 C 77 28 83 41 81 51 Z'
          : 'M 56 68 C 52 48 57 32 68 33 C 77 34 81 44 79 52 Z')
      : (big
          ? 'M 138 52 C 140 39 148 26 159 27 C 170 28 173 45 167 70 Z'
          : 'M 139 53 C 141 42 149 32 158 33 C 168 34 170 48 164 67 Z');
    // 简州猫"四耳"：圆润双耳小瓣
    const foldPath = isNear
      ? 'M 56 72 C 55 56 62 50 71 54 C 77 57 78 66 72 72 Z'
      : 'M 145 69 C 141 58 146 50 154 53 C 162 56 165 65 160 72 Z';
    const ox = isNear ? 66 : 152;
    const oy = 64;

    return `<g class="ear ear-${side}" style="transform-origin:${ox}px ${oy}px">
      <defs>
        <linearGradient id="${id}e${side}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${shiftColor(c, isNear ? 18 : 0)}"/>
          <stop offset="100%" stop-color="${cShade}"/>
        </linearGradient>
      </defs>
      <path d="${outerPath}" fill="url(#${id}e${side})" stroke="${OUTLINE}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${innerPath}" fill="${inner}" stroke="${shiftColor(inner, -28)}" stroke-width="1.4" stroke-linejoin="round"/>
      ${big ? `<path d="${foldPath}" fill="${shiftColor(a.base, 14)}" stroke="${OUTLINE}" stroke-width="1.8" stroke-linejoin="round"/>` : ''}
    </g>`;
  }

  // 2.5D 立体光泽猫眼（近眼略宽，远眼略收）
  function eye25D(x, y, rx, ry, a, lidColor, id) {
    const irisHi = shiftColor(a.eye, 35);
    const irisLo = shiftColor(a.eye, -38);
    let s = `<g class="eye" style="transform-origin:${x}px ${y}px">`;
    s += `<defs><radialGradient id="${id}ey" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="${irisHi}"/>
      <stop offset="65%" stop-color="${a.eye}"/>
      <stop offset="100%" stop-color="${irisLo}"/>
    </radialGradient></defs>`;
    // 眼窝微阴影
    s += `<ellipse cx="${x}" cy="${y + 1.5}" rx="${rx + 1.8}" ry="${ry + 1.5}" fill="rgba(70,40,25,.16)"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}ey)" stroke="${OUTLINE}" stroke-width="1.7"/>`;
    // 瞳孔
    s += `<ellipse cx="${x + 0.6}" cy="${y + 1}" rx="${rx * 0.52}" ry="${ry * 0.72}" fill="#241B17"/>`;
    // 立体双高光
    s += `<circle cx="${x - rx * 0.32}" cy="${y - ry * 0.36}" r="${rx * 0.32}" fill="#FFFFFF"/>`;
    s += `<circle cx="${x + rx * 0.34}" cy="${y + ry * 0.34}" r="${rx * 0.16}" fill="#FFFFFF" opacity=".9"/>`;
    // 菲菲傲娇半眯上眼睑
    if (lidColor) {
      s += `<path class="lid" style="transform-origin:${x}px ${y - ry - 1}px" d="M ${x - rx - 2} ${y - 1} Q ${x} ${y - ry - 7} ${x + rx + 2} ${y - 1} Z" fill="${lidColor}"/>`;
      s += `<path class="lid-line" style="transform-origin:${x}px ${y - ry - 1}px" d="M ${x - rx - 1.5} ${y - 1} Q ${x} ${y - 3.5} ${x + rx + 1.5} ${y - 1}" stroke="${OUTLINE}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    return s + '</g>';
  }

  // 头部花纹（适配 3/4 略向右转的头中心 x≈112）
  function headPattern25D(a, id) {
    let s = `<g clip-path="url(#${id}hc)">`;
    const st = (d, w = 3.5) => `<path d="${d}" stroke="${a.stripe}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;
    const cheeks = st('M 48 92 L 64 96') + st('M 50 103 L 65 104') + st('M 172 91 L 158 95') + st('M 171 102 L 157 103');

    switch (a.pattern) {
      case 'wang':
        s += st('M 103 52 L 125 52') + st('M 105 60 L 123 60') + st('M 101 68 L 127 68') + st('M 114 50 L 114 68');
        s += st('M 84 52 L 88 63', 3) + st('M 140 53 L 136 63', 3) + cheeks;
        break;
      case 'mackerel':
        s += st('M 96 67 L 102 52 L 114 63 L 125 52 L 130 67', 3.4);
        s += st('M 105 44 L 106 54') + st('M 114 42 L 114 54') + st('M 122 44 L 121 54');
        s += st('M 84 48 L 90 60', 3) + st('M 139 49 L 134 60', 3) + cheeks;
        break;
      case 'tabbyLight':
        s += st('M 98 68 L 103 58 L 113 65 L 123 58 L 128 68', 3);
        s += st('M 107 48 L 108 56', 2.8) + st('M 120 48 L 119 56', 2.8) + st('M 50 96 L 64 98', 2.8) + st('M 171 95 L 158 97', 2.8);
        break;
      case 'shaded':
        s += `<rect x="35" y="34" width="150" height="82" fill="url(#${id}sg)"/>`;
        break;
      case 'pointed':
        s += `<rect x="35" y="34" width="150" height="82" fill="url(#${id}sg)"/>`;
        s += `<ellipse cx="116" cy="108" rx="44" ry="38" fill="url(#${id}mg)"/>`;
        break;
      case 'ragdoll':
        s += `<ellipse cx="116" cy="100" rx="42" ry="34" fill="url(#${id}mg)"/>`;
        s += `<path d="M 118 85 Q 106 106 100 134 L 134 134 Q 128 106 118 85 Z" fill="#FFFFFF" opacity=".96"/>`;
        break;
      case 'bicolor':
        s += `<path d="M 118 66 Q 110 88 94 105 Q 84 118 86 146 L 146 146 Q 148 118 136 105 Q 124 88 118 66 Z" fill="${a.muzzle}"/>`;
        break;
      case 'calico':
        s += `<ellipse cx="76" cy="64" rx="34" ry="26" fill="url(#${id}co)"/>`;
        s += `<ellipse cx="144" cy="60" rx="28" ry="22" fill="url(#${id}cb)"/>`;
        s += `<ellipse cx="142" cy="95" rx="21" ry="18" fill="url(#${id}cb)"/>`;
        s += `<ellipse cx="62" cy="108" rx="14" ry="11" fill="url(#${id}co)"/>`;
        break;
    }
    return s + '</g>';
  }

  // 3/4 立体身体花纹
  function bodyPattern25D(a, id, bw) {
    let s = `<g clip-path="url(#${id}bc)">`;
    if (a.shade) s += `<rect x="10" y="128" width="200" height="75" fill="url(#${id}sg)"/>`;
    // 肚皮/胸口（向右侧 3/4 透视偏移）
    if (a.pattern === 'bicolor') {
      s += `<ellipse cx="116" cy="188" rx="${bw * 0.68}" ry="42" fill="${a.belly}"/>`;
    } else if (a.belly) {
      s += `<ellipse cx="116" cy="184" rx="${bw * 0.48}" ry="34" fill="${a.belly}"/>`;
    }
    // 虎斑环绕躯干弧度
    if (a.stripe) {
      const n = a.pattern === 'tabbyLight' ? 3 : 4;
      const sw = a.pattern === 'tabbyLight' ? 3 : 3.6;
      for (let i = 0; i < n; i++) {
        const y = 148 + i * 13;
        s += `<path d="M ${96 - bw} ${y} q 18 -3 25 8" stroke="${a.stripe}" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity=".86"/>`;
        s += `<path d="M ${106 + bw} ${y} q -14 -2 -19 7" stroke="${a.stripe}" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity=".86"/>`;
      }
    }
    if (a.pattern === 'calico') {
      s += `<ellipse cx="${96 - bw * 0.38}" cy="166" rx="26" ry="22" fill="url(#${id}co)"/>`;
      s += `<ellipse cx="${104 + bw * 0.54}" cy="178" rx="20" ry="22" fill="url(#${id}cb)"/>`;
      s += `<ellipse cx="118" cy="144" rx="14" ry="9" fill="url(#${id}co)"/>`;
    }
    // 腹部底缘暗部环境光遮蔽（AO），强化球体感
    s += `<ellipse cx="105" cy="222" rx="${bw * 1.1}" ry="20" fill="rgba(55,30,18,.15)"/>`;
    return s + '</g>';
  }

  // 2.5D 立体尾巴（带圆柱高光与阴影）
  function tail25D(a, id, bw) {
    const x0 = 96 - bw + 12; // 从左后方翘起，更符合 3/4 立体构图
    const d = `M ${x0} 204 C ${x0 - 40} 206 ${x0 - 46} 158 ${x0 - 26} 126`;
    const w = a.tailW || 15;
    let color = a.base;
    if (a.tail === 'points') color = a.points;
    if (a.tail === 'shadedTip') color = `url(#${id}tg)`;

    let s = `<g class="tail" style="transform-origin:${x0}px 204px">`;
    s += `<defs><linearGradient id="${id}tg" gradientUnits="userSpaceOnUse" x1="${x0}" y1="204" x2="${x0 - 26}" y2="126">
      <stop offset="0%" stop-color="${a.base}"/><stop offset="100%" stop-color="${a.shade || a.base}"/>
    </linearGradient></defs>`;
    s += `<path d="${d}" stroke="${OUTLINE}" stroke-width="${w + 4.4}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${d}" stroke="${shiftColor(a.tail === 'points' ? a.points : a.base, -22)}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${d}" stroke="${color}" stroke-width="${w - 2}" fill="none" stroke-linecap="round" transform="translate(-1,-1)"/>`;
    if (a.tail === 'rings') s += `<path d="${d}" stroke="${a.stripe}" stroke-width="${w}" fill="none" stroke-dasharray="6 9" stroke-dashoffset="-5" opacity=".88"/>`;
    if (a.tail === 'calico') s += `<path d="${d}" stroke="${a.black}" stroke-width="${w}" fill="none" stroke-dasharray="14 10 60"/>`;
    // 尾巴高光条
    s += `<path d="${d}" stroke="#FFFFFF" stroke-width="${Math.max(2, w * 0.22)}" fill="none" stroke-linecap="round" opacity=".3" transform="translate(-2,-2)"/>`;
    return s + '</g>';
  }

  // 颈部后层配件（布偶大围脖 / 金舔舔白胸毛）
  function neckBack25D(a) {
    let s = '';
    if (a.acc.includes('ruff')) {
      for (let ang = 24; ang <= 156; ang += 14) {
        const r = ang * Math.PI / 180;
        const cx = 110 + 60 * Math.cos(r);
        const cy = 104 + 50 * Math.sin(r);
        s += `<circle cx="${cx}" cy="${cy}" r="11.5" fill="#FFFFFF" stroke="rgba(180,155,140,.35)" stroke-width="1.2"/>`;
      }
    }
    if (a.acc.includes('chestfluff')) {
      s += `<circle cx="105" cy="154" r="9.5" fill="#FFF9EC" stroke="rgba(180,145,90,.28)" stroke-width="1"/>`;
      s += `<circle cx="116" cy="157" r="10.5" fill="#FFFDF5" stroke="rgba(180,145,90,.28)" stroke-width="1"/>`;
      s += `<circle cx="126" cy="153" r="9" fill="#FFF9EC" stroke="rgba(180,145,90,.28)" stroke-width="1"/>`;
    }
    return s;
  }

  // 颈部前层立体配饰
  function neckFront25D(a) {
    let s = '';
    if (a.acc.includes('fishbell')) {
      s += `<path d="M 76 140 Q 112 161 142 139" stroke="#C73439" stroke-width="7.5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 76 139 Q 112 160 142 138" stroke="#F2555A" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="116" cy="158" r="9" fill="#FFD34E" stroke="#B67C0C" stroke-width="1.6"/>`;
      s += `<circle cx="113" cy="154.5" r="2.6" fill="#FFF7C2"/>`;
      s += `<path d="M 111 158 L 121 158 M 114 155 L 114 161 M 117 155 L 117 161 M 111 158 L 108.5 155.5 M 111 158 L 108.5 160.5" stroke="#9C6800" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    if (a.acc.includes('horn')) {
      s += `<path d="M 78 140 Q 112 159 140 139" stroke="#8F2E2E" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 113 150 L 118 150 L 125 165 L 107 165 Z" fill="#FFD34E" stroke="#B67C0C" stroke-width="1.3" stroke-linejoin="round"/>`;
      s += `<ellipse cx="116" cy="165" rx="9" ry="3" fill="#E8B01E" stroke="#B67C0C" stroke-width="1"/>`;
    }
    if (a.acc.includes('bandana')) {
      s += `<path d="M 75 138 Q 112 159 142 138" stroke="#2D8A47" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 75 137 Q 112 158 142 137" stroke="#47B866" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 98 148 L 128 148 L 115 172 Z" fill="#3FA45B" stroke="#26733B" stroke-width="1.6" stroke-linejoin="round"/>`;
      // 侧面飘扬的头巾尾结（强化 2.5D 立体感）
      s += `<path d="M 74 139 L 60 147 L 66 155 Z" fill="#328F4C" stroke="#26733B" stroke-width="1.4" stroke-linejoin="round"/>`;
      s += `<circle cx="109" cy="154" r="1.7" fill="#fff"/><circle cx="119" cy="155" r="1.7" fill="#fff"/><circle cx="114" cy="162" r="1.7" fill="#fff"/>`;
    }
    return s;
  }

  // 头顶立体配饰
  function headTop25D(a) {
    let s = '';
    if (a.acc.includes('bow')) {
      s += `<g transform="translate(64 34) rotate(-20)">`;
      s += `<path d="M 0 2 L -16 -9 L -16 11 Z" fill="#F06299" stroke="#C23C73" stroke-width="1.6" stroke-linejoin="round"/>`;
      s += `<path d="M 0 2 L 16 -9 L 16 11 Z" fill="#FF85B8" stroke="#C23C73" stroke-width="1.6" stroke-linejoin="round"/>`;
      s += `<ellipse cx="0" cy="1.5" rx="5" ry="4.5" fill="#FF4D94" stroke="#C23C73" stroke-width="1.4"/>`;
      s += `<circle cx="-1.5" cy="0" r="1.6" fill="#FFD1E5"/></g>`;
    }
    if (a.acc.includes('crown')) {
      s += `<g transform="translate(8, -2) rotate(5 104 42)">`;
      s += `<path d="M 88 46 L 85 26 L 96 35 L 105 19 L 114 35 L 124 26 L 121 46 Z" fill="#FFD646" stroke="#B87E08" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<path d="M 89 43 L 120 43" stroke="#E5A812" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="105" cy="36" r="3.2" fill="#FF5277"/><circle cx="95" cy="39" r="2.2" fill="#4DB3FF"/><circle cx="115" cy="39" r="2.2" fill="#4DB3FF"/>`;
      s += `</g>`;
    }
    if (a.acc.includes('headband')) {
      s += `<path d="M 52 72 Q 112 33 166 72" stroke="#A67004" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 52 71 Q 112 32 166 71" stroke="#FFD646" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 68 58 Q 112 37 148 56" stroke="#FFF8C7" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>`;
      s += `<path d="M 52 71 q -9 6 -2 13 q 6 4 8 -3" stroke="#FFD646" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M 166 71 q 8 6 2 12 q -6 4 -8 -3" stroke="#FFD646" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  window.catSVG = function (cat) {
    const a = cat.art;
    const id = 'c25d_' + (++uid);
    const bw = a.bodyW || 46;
    const earColors = {
      l: a.pattern === 'calico' ? a.orange : (a.points || a.base),
      r: a.pattern === 'calico' ? a.black : (a.points || a.base)
    };
    const pawColor = a.paw || a.base;
    const farPawColor = shiftColor(pawColor, -22);
    const lidL = a.lids ? a.base : null;
    const lidR = a.lids ? (a.pattern === 'calico' ? a.black : a.base) : null;
    const maskOp = a.pattern === 'ragdoll' ? 0.82 : 1;

    // 2.5D 躯干路径（梨形饱满立体轮廓）
    const bodyPath = `M ${102 - bw} 168 C ${98 - bw} 134 ${108 + bw} 134 ${108 + bw} 168 C ${110 + bw} 206 ${98 + bw * 0.72} 218 106 218 C ${104 - bw * 0.78} 218 ${100 - bw} 206 ${102 - bw} 168 Z`;

    let s = `<svg class="cat-svg" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg">`;
    s += `<defs>
      <clipPath id="${id}hc"><ellipse cx="108" cy="94" rx="63" ry="52"/></clipPath>
      <clipPath id="${id}bc"><path d="${bodyPath}"/></clipPath>
      ${grad3D(id + 'hg', a.base, 32, -32, '35%', '26%')}
      ${grad3D(id + 'bg', a.base, 24, -40, '38%', '24%')}
      ${grad3D(id + 'pl', pawColor, 22, -24, '35%', '25%')}
      ${grad3D(id + 'pr', farPawColor, 14, -24, '35%', '25%')}
      ${a.orange ? grad3D(id + 'co', a.orange, 22, -28) : ''}
      ${a.black ? grad3D(id + 'cb', a.black, 22, -16) : ''}
      <linearGradient id="${id}sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${a.shade || '#000'}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${a.shade || '#000'}" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${id}mg" cx="50%" cy="48%" r="55%">
        <stop offset="0%" stop-color="${a.points || '#000'}" stop-opacity="${maskOp}"/>
        <stop offset="58%" stop-color="${a.points || '#000'}" stop-opacity="${maskOp * 0.85}"/>
        <stop offset="100%" stop-color="${a.points || '#000'}" stop-opacity="0"/>
      </radialGradient>
    </defs>`;

    // ===== 身体层 =====
    s += `<g class="body-wrap">`;
    // 远侧后腿（藏在右侧微露，体现 2.5D 站姿深度）
    s += `<ellipse cx="${108 + bw * 0.72}" cy="200" rx="16" ry="18" fill="${shiftColor(a.base, -34)}" stroke="${OUTLINE}" stroke-width="2.6"/>`;
    s += tail25D(a, id, bw);

    // 主躯干
    s += `<path d="${bodyPath}" fill="url(#${id}bg)"/>`;
    s += bodyPattern25D(a, id, bw);
    // 躯干左上角柔和轮廓高光
    s += `<path d="M ${106 - bw * 0.85} 156 Q ${104 - bw * 0.55} 138 96 136" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".32"/>`;
    s += `<path d="${bodyPath}" fill="none" stroke="${OUTLINE}" stroke-width="2.8"/>`;

    // 近侧后腿（左下方圆润大腿 + 小脚丫，立体叠加感）
    s += `<ellipse cx="${102 - bw * 0.58}" cy="196" rx="17" ry="19" fill="${shiftColor(a.base, -10)}" stroke="${OUTLINE}" stroke-width="2.6"/>`;
    s += `<ellipse cx="${102 - bw * 0.52}" cy="214" rx="13" ry="8" fill="url(#${id}pl)" stroke="${OUTLINE}" stroke-width="2.4"/>`;

    // 前爪（左近大、右远小，交错排布）
    s += `<g class="paw paw-r" style="transform-origin:132px 206px">
      <ellipse cx="132" cy="213" rx="13.5" ry="8.5" fill="url(#${id}pr)" stroke="${OUTLINE}" stroke-width="2.5"/>
      <path d="M 129 210 L 129 215 M 136 210 L 136 215" stroke="${OUTLINE}" stroke-width="1.3" stroke-linecap="round" opacity=".55"/>
    </g>`;
    s += `<g class="paw paw-l">
      <ellipse cx="96" cy="218" rx="15" ry="9.5" fill="url(#${id}pl)" stroke="${OUTLINE}" stroke-width="2.6"/>
      <path d="M 92 215 L 92 221 M 100 215 L 100 221" stroke="${OUTLINE}" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>
    </g>`;

    s += neckBack25D(a);
    s += `</g>`;

    // ===== 头部层（3/4 微向右转） =====
    s += `<g class="head" style="transform-origin:108px 142px">`;
    // 远耳在头后，近耳在前
    s += ear25D('r', a, earColors, id);
    s += `<ellipse cx="108" cy="94" rx="63" ry="52" fill="url(#${id}hg)"/>`;
    s += headPattern25D(a, id);
    // 头部左上角轮廓高光（手办光泽感）
    s += `<path d="M 58 76 Q 74 49 106 47" stroke="#FFFFFF" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".36"/>`;
    s += `<ellipse cx="108" cy="94" rx="63" ry="52" fill="none" stroke="${OUTLINE}" stroke-width="2.8"/>`;
    s += ear25D('l', a, earColors, id);

    // 立体嘴套（3/4 透视略偏右）
    if (a.muzzle) {
      s += `<ellipse cx="104" cy="115" rx="13" ry="9.5" fill="${a.muzzle}" stroke="rgba(90,60,45,.15)" stroke-width="1"/>`;
      s += `<ellipse cx="122" cy="115" rx="12" ry="9.2" fill="${shiftColor(a.muzzle, -6)}" stroke="rgba(90,60,45,.15)" stroke-width="1"/>`;
    }
    s += headTop25D(a);

    // 胡须
    s += `<g stroke="${OUTLINE}" stroke-width="1.4" stroke-linecap="round" opacity=".35">
      <path d="M 68 108 L 44 103"/><path d="M 68 113 L 45 116"/>
      <path d="M 152 108 L 176 103"/><path d="M 152 113 L 175 116"/>
    </g>`;
    // 腮红
    s += `<ellipse cx="74" cy="112" rx="9.5" ry="5.5" fill="#FF8AA0" opacity=".46"/>`;
    s += `<ellipse cx="146" cy="111" rx="8.5" ry="5" fill="#FF8AA0" opacity=".4"/>`;

    // 眼睛（近眼在左 x=88 略宽；远眼在右 x=134 略窄，体现头颅曲度）
    s += `<g class="eyes-open">
      ${eye25D(88, 95, 11, 12.4, a, lidL, id + 'el')}
      ${eye25D(134, 95, 9.8, 12, a, lidR, id + 'er')}
    </g>`;
    s += `<g class="eyes-closed" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M 78 96 Q 88 103 98 96"/><path d="M 124 96 Q 134 103 143 96"/>
    </g>`;

    // 3D 鼻头 + 嘴巴
    s += `<path d="M 109 105 L 118 105 L 113.5 110 Z" fill="#FF869E" stroke="#D95B77" stroke-width="1.5" stroke-linejoin="round"/>`;
    s += `<circle cx="112.2" cy="106.5" r="1.2" fill="#FFD6DF"/>`;
    const mouth = a.mouth === 'smirk'
      ? 'M 104 113 Q 112 119 116 114 Q 120 116 125 109'
      : 'M 104 113 Q 108.8 118 113.5 113 Q 118 118 123 113';
    s += `<path class="mouth" d="${mouth}" stroke="${OUTLINE}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<g class="mouth-open">
      <ellipse cx="113.5" cy="119" rx="7.5" ry="8.5" fill="#7A2F3A" stroke="${OUTLINE}" stroke-width="1.6"/>
      <ellipse cx="113.5" cy="123" rx="4.5" ry="3" fill="#FF8FA3"/>
    </g>`;
    if (a.acc.includes('tongue')) {
      s += `<g class="tongue" style="transform-origin:113.5px 115px">
        <path d="M 108.5 114 Q 108 126.5 113.5 126.5 Q 119 126.5 118.5 114 Z" fill="#FF789B" stroke="#C94A6D" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M 113.5 116 L 113.5 122.5" stroke="#C94A6D" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="111.5" cy="118.5" rx="1.4" ry="2.4" fill="#FFC4D3" opacity=".8"/>
      </g>`;
    }
    s += `</g>`;
    s += neckFront25D(a);

    // 动作道具（2.5D 立体食盆 / 马克杯）
    s += `<g class="prop prop-bowl">
      <ellipse cx="114" cy="227" rx="34" ry="8" fill="rgba(50,30,15,.18)"/>
      <path d="M 78 214 Q 114 240 150 214 Z" fill="#3B8FEF" stroke="${OUTLINE}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="114" cy="214" rx="36" ry="7" fill="#C4783A" stroke="${OUTLINE}" stroke-width="2"/>
      <circle cx="100" cy="212" r="3.4" fill="#9C5A24"/><circle cx="114" cy="210" r="3.4" fill="#9C5A24"/><circle cx="127" cy="212" r="3.4" fill="#9C5A24"/>
    </g>`;
    s += `<g class="prop prop-cup" style="transform-origin:182px 154px">
      <rect x="168" y="138" width="24" height="26" rx="4" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2.2"/>
      <ellipse cx="180" cy="138" rx="12" ry="4" fill="#F4ECE1" stroke="${OUTLINE}" stroke-width="2"/>
      <path d="M 192 144 Q 202 147 192 157" stroke="${OUTLINE}" stroke-width="2.2" fill="none"/>
      <path d="M 171 146 L 189 146" stroke="#FF8FA3" stroke-width="3.2" stroke-linecap="round"/>
    </g>`;
    s += `</svg>`;
    return s;
  };
})();
