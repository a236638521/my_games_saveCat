/* 首页看板猫专属 2.5D 主题场景与持续特性动画（v0.4.1） */
(function () {
  const SCENES = {
    dajv: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFDF6 0%, #FFE8C4 62%, #F5C384 100%)',
      anim: 'showcase-daju',
      hint: '暖阳窗台 · 干饭专座',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FFFBE0" stop-opacity=".68"/>
              <stop offset="100%" stop-color="#FFFBE0" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- 阳光窗影 -->
          <polygon points="10,0 130,0 205,215 35,215" fill="url(#sunRay)"/>
          <g opacity=".9">
            <rect x="20" y="14" width="68" height="72" rx="8" fill="#FFF7DA" stroke="#D9A76A" stroke-width="3"/>
            <line x1="54" y1="14" x2="54" y2="86" stroke="#D9A76A" stroke-width="2.5"/>
            <line x1="20" y1="50" x2="88" y2="50" stroke="#D9A76A" stroke-width="2.5"/>
          </g>
          <!-- 右侧：快递大纸箱 -->
          <g transform="translate(248,96)">
            <polygon points="8,24 58,8 92,22 42,38" fill="#DFAA6E" stroke="#6E4726" stroke-width="2" stroke-linejoin="round"/>
            <rect x="8" y="24" width="34" height="58" fill="#C98D50" stroke="#6E4726" stroke-width="2"/>
            <polygon points="42,38 92,22 92,76 42,82" fill="#E6B47B" stroke="#6E4726" stroke-width="2"/>
            <polygon points="10,23 36,10 56,16 32,29" fill="#F0C896" stroke="#6E4726" stroke-width="1.8"/>
            <text x="53" y="59" font-size="11" font-weight="900" fill="#8F5524" transform="rotate(-12 53 59)">猫粮</text>
          </g>
          <!-- 橘猫暖垫 -->
          <ellipse cx="180" cy="186" rx="88" ry="20" fill="#F7A45C" stroke="#B85F24" stroke-width="2.4"/>
          <ellipse cx="180" cy="183" rx="70" ry="13" fill="#FFD19B"/>
          <!-- 左前：堆满小鱼干的大食盆 -->
          <g transform="translate(38,144)">
            <ellipse cx="36" cy="48" rx="34" ry="8" fill="rgba(120,65,20,.18)"/>
            <path d="M 6 24 Q 36 58 66 24 Z" fill="#FF7E47" stroke="#6E3A1E" stroke-width="2.2"/>
            <ellipse cx="36" cy="24" rx="30" ry="9" fill="#FFE6BF" stroke="#6E3A1E" stroke-width="2"/>
            <!-- 小鱼干堆 -->
            <ellipse cx="26" cy="20" rx="10" ry="4" fill="#E5A256" stroke="#6E3A1E" stroke-width="1.4" transform="rotate(-12 26 20)"/>
            <ellipse cx="44" cy="19" rx="11" ry="4" fill="#F0B56C" stroke="#6E3A1E" stroke-width="1.4" transform="rotate(14 44 19)"/>
            <circle cx="35" cy="23" r="3" fill="#B56E2B"/><circle cx="23" cy="24" r="2.6" fill="#9E5B20"/><circle cx="46" cy="25" r="2.8" fill="#B56E2B"/>
          </g>
        </svg>
        <span class="scene-float sf-1">🐟</span>
        <span class="scene-float sf-2">🍗</span>
      `
    },

    jintiantian: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFDF2 0%, #FFECC1 62%, #F2C97D 100%)',
      anim: 'showcase-selflick',
      hint: '全屋都是被舔过的痕迹💦',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="salivaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E8F9FF" stop-opacity=".95"/>
              <stop offset="100%" stop-color="#7FD5FF" stop-opacity=".82"/>
            </linearGradient>
          </defs>
          <!-- 蜂蜜色地垫与反光口水渍 -->
          <ellipse cx="180" cy="186" rx="94" ry="20" fill="#F7DC9C" stroke="#B98738" stroke-width="2.2"/>
          <path d="M 102 188 Q 116 180 132 187 Q 124 196 105 194 Z" fill="url(#salivaGrad)" stroke="#5DBBE6" stroke-width="1.3"/>
          <path d="M 225 186 Q 246 179 262 188 Q 252 197 228 193 Z" fill="url(#salivaGrad)" stroke="#5DBBE6" stroke-width="1.3"/>

          <!-- 左后：被舔得湿漉漉的反光小镜子 -->
          <g transform="translate(26,64) rotate(-8 34 45)">
            <rect x="6" y="4" width="54" height="72" rx="27" fill="#DDF5FF" stroke="#B68344" stroke-width="4"/>
            <rect x="26" y="76" width="14" height="20" rx="4" fill="#B68344"/>
            <ellipse cx="33" cy="96" rx="22" ry="6" fill="#C99655" stroke="#8C602A" stroke-width="1.8"/>
            <!-- 镜面被舔过的舌印水迹 + 滑落口水 -->
            <path d="M 20 34 Q 32 22 44 38 Q 38 56 26 52 Z" fill="url(#salivaGrad)" opacity=".88"/>
            <path d="M 38 45 Q 43 58 38 66" stroke="#7ED8FF" stroke-width="3.2" stroke-linecap="round" fill="none"/>
            <circle cx="38" cy="68" r="3.5" fill="#9EE6FF"/>
            <path d="M 18 22 L 26 16" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
          </g>

          <!-- 左前：被舔到冒泡的玩具小老鼠 -->
          <g transform="translate(46,154)">
            <ellipse cx="26" cy="24" rx="24" ry="13" fill="#B9A6C9" stroke="#5A466B" stroke-width="2"/>
            <circle cx="14" cy="14" r="7" fill="#DFC3E8" stroke="#5A466B" stroke-width="1.8"/>
            <circle cx="28" cy="12" r="7" fill="#DFC3E8" stroke="#5A466B" stroke-width="1.8"/>
            <circle cx="10" cy="23" r="2.2" fill="#3B2B44"/><circle cx="3" cy="25" r="2.8" fill="#FF7A9C"/>
            <path d="M 50 24 Q 68 18 66 29" stroke="#C98CA6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <!-- 湿漉漉的口水包层和滴落水珠 -->
            <path d="M 12 18 Q 28 10 42 20 Q 34 29 14 25 Z" fill="url(#salivaGrad)" opacity=".8"/>
            <path class="drool-drop" d="M 30 28 Q 34 38 30 42 Q 26 38 30 28 Z" fill="#8EE0FF" stroke="#47B2E6" stroke-width="1.2"/>
          </g>

          <!-- 右后：被舔湿的毛线球（带口水反光丝） -->
          <g transform="translate(264,102)">
            <circle cx="28" cy="28" r="24" fill="#FF9EB5" stroke="#7A3E4E" stroke-width="2.2"/>
            <path d="M 12 18 Q 28 32 46 16 M 10 34 Q 28 16 48 34 M 20 8 Q 34 28 18 48" stroke="#D96E88" stroke-width="2" fill="none"/>
            <path d="M 15 16 Q 28 10 42 22 Q 36 33 18 28 Z" fill="url(#salivaGrad)" opacity=".82"/>
            <path class="drool-drop" d="M 41 26 Q 46 37 41 42 Q 36 37 41 26 Z" fill="#8EE0FF" stroke="#47B2E6" stroke-width="1.2"/>
          </g>

          <!-- 右前：被舔得锃亮反光的小奶盆（底部残留口水光斑） -->
          <g transform="translate(254,158)">
            <path d="M 4 14 Q 28 42 52 14 Z" fill="#FFE066" stroke="#7A5620" stroke-width="2"/>
            <ellipse cx="28" cy="14" rx="24" ry="7" fill="#FFF9E6" stroke="#7A5620" stroke-width="1.8"/>
            <ellipse cx="26" cy="14" rx="15" ry="4" fill="url(#salivaGrad)"/>
            <path d="M 17 11 L 24 14 M 33 10 L 38 13" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
          </g>
        </svg>
        <span class="scene-float sf-1 drool-float">💦</span>
        <span class="scene-float sf-2 drool-float">👅</span>
        <span class="scene-float sf-3 drool-float">💧</span>
      `
    },

    yinxiaomei: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFFFF 0%, #E3F0FA 64%, #BCD6EC 100%)',
      anim: 'showcase-ballet',
      hint: '银丝绒芭蕾练习室',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <rect x="26" y="28" width="54" height="106" rx="27" fill="#F2FAFF" stroke="#9BB7D0" stroke-width="3.5"/>
          <path d="M 38 56 L 62 40 M 40 72 L 66 56" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".85"/>
          <!-- 粉色芭蕾丝绒圆台 -->
          <ellipse cx="180" cy="186" rx="84" ry="18" fill="#FFD1E1" stroke="#B86B86" stroke-width="2.2"/>
          <ellipse cx="180" cy="182" rx="68" ry="12" fill="#FFEAF2"/>
          <!-- 右侧缎带小立架 -->
          <g transform="translate(274,108)">
            <line x1="20" y1="8" x2="20" y2="74" stroke="#8FA8BE" stroke-width="3.5" stroke-linecap="round"/>
            <ellipse cx="20" cy="74" rx="16" ry="5" fill="#B5CADB" stroke="#718A9E" stroke-width="1.8"/>
            <path d="M 20 14 Q 44 26 32 48 Q 18 60 38 68" stroke="#FF85AE" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="20" cy="10" r="6" fill="#FF85AE" stroke="#A64869" stroke-width="1.8"/>
          </g>
        </svg>
        <span class="scene-float sf-1">🎀</span>
        <span class="scene-float sf-2">✨</span>
      `
    },

    xiaobuding: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFFFF 0%, #E5EEFF 62%, #BED2FA 100%)',
      anim: 'showcase-nap',
      hint: '软绵云朵午睡角',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 云朵软垫 -->
          <g fill="#FFFFFF" stroke="#8FB0E8" stroke-width="2.4">
            <circle cx="116" cy="182" r="24"/><circle cx="148" cy="176" r="28"/><circle cx="184" cy="176" r="30"/><circle cx="218" cy="178" r="26"/><circle cx="246" cy="183" r="22"/>
            <rect x="110" y="176" width="142" height="24" rx="12" stroke="none"/>
          </g>
          <!-- 左：布丁甜品杯 -->
          <g transform="translate(36,144)">
            <path d="M 10 22 L 42 22 L 36 44 L 16 44 Z" fill="#FFE6A8" stroke="#8C6239" stroke-width="2"/>
            <path d="M 10 22 Q 26 14 42 22 Z" fill="#8C5230"/>
            <circle cx="26" cy="14" r="5" fill="#FF6B8B"/>
          </g>
          <!-- 右：弯月星星小抱枕 -->
          <g transform="translate(270,130)">
            <path d="M 32 6 A 24 24 0 1 0 32 52 A 18 20 0 1 1 32 6 Z" fill="#FFE27A" stroke="#C28D1B" stroke-width="2"/>
          </g>
        </svg>
        <span class="scene-float sf-1">☁️</span>
        <span class="scene-float sf-2">💤</span>
      `
    },

    xiaoluo: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFBF4 0%, #F4DFC6 62%, #DFB58A 100%)',
      anim: 'showcase-chirp',
      hint: '全向大喇叭脱口秀角',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 复古小音箱 -->
          <g transform="translate(24,114)">
            <rect x="0" y="0" width="54" height="66" rx="10" fill="#785038" stroke="#4A2E1F" stroke-width="2.4"/>
            <circle cx="27" cy="24" r="13" fill="#3B261C" stroke="#D9A36A" stroke-width="2.2"/>
            <circle cx="27" cy="49" r="9" fill="#3B261C" stroke="#D9A36A" stroke-width="2"/>
          </g>
          <!-- 咖啡色演出地毯 -->
          <ellipse cx="180" cy="186" rx="86" ry="18" fill="#D89860" stroke="#7A4C24" stroke-width="2.2"/>
          <ellipse cx="180" cy="183" rx="68" ry="11" fill="#F6D5A9"/>
          <!-- 右侧小黑板 & 大喇叭 -->
          <g transform="translate(268,118)">
            <rect x="6" y="10" width="54" height="44" rx="6" fill="#4A5548" stroke="#9C6A3E" stroke-width="3"/>
            <text x="14" y="34" font-size="11" font-weight="800" fill="#FFE8A3">喵!喵!</text>
          </g>
        </svg>
        <span class="scene-float sf-1">📢</span>
        <span class="scene-float sf-2">🎵</span>
      `
    },

    tangmu: {
      bg: 'radial-gradient(circle at 50% 34%, #F9FBFF 0%, #DBE4F2 62%, #B5C4DC 100%)',
      anim: 'showcase-mischief',
      hint: '危险茶几现场 · 杯子危！',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 格纹地毯 -->
          <ellipse cx="180" cy="186" rx="88" ry="18" fill="#8093B5" stroke="#455573" stroke-width="2.2"/>
          <!-- 左：打翻泼水的马克杯 -->
          <g transform="translate(30,148)">
            <ellipse cx="48" cy="30" rx="22" ry="7" fill="#A6E1FF" opacity=".82"/>
            <g transform="rotate(72 22 20)">
              <rect x="10" y="6" width="22" height="26" rx="4" fill="#FFFFFF" stroke="#4A3A33" stroke-width="2"/>
              <path d="M 32 12 Q 40 16 32 24" stroke="#4A3A33" stroke-width="2" fill="none"/>
            </g>
          </g>
          <!-- 右：桌上摇摇欲坠的高脚花瓶 -->
          <g transform="translate(264,126) rotate(-10 26 32)">
            <path d="M 16 14 L 36 14 L 40 52 L 12 52 Z" fill="#89B9E6" stroke="#455573" stroke-width="2"/>
            <circle cx="26" cy="8" r="8" fill="#FF8AA0" stroke="#7A3646" stroke-width="1.6"/>
          </g>
        </svg>
        <span class="scene-float sf-1">☕</span>
        <span class="scene-float sf-2">💥</span>
      `
    },

    feifei: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFBF7 0%, #FFE4CC 62%, #F5BE95 100%)',
      anim: 'showcase-royal',
      hint: '女王招财锦缎宝座',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 金边红丝绒宝座垫 -->
          <ellipse cx="180" cy="186" rx="90" ry="20" fill="#D94B5A" stroke="#8F222E" stroke-width="2.4"/>
          <ellipse cx="180" cy="183" rx="74" ry="13" fill="none" stroke="#FFD646" stroke-width="2.6" stroke-dasharray="6 4"/>
          <!-- 左：金币招财小堆 -->
          <g transform="translate(36,154)">
            <ellipse cx="24" cy="24" rx="18" ry="8" fill="#FFCF40" stroke="#A67400" stroke-width="1.8"/>
            <ellipse cx="38" cy="18" rx="15" ry="7" fill="#FFE27A" stroke="#A67400" stroke-width="1.8"/>
            <circle cx="24" cy="10" r="10" fill="#FFD646" stroke="#A67400" stroke-width="1.8"/>
            <rect x="21" y="7" width="6" height="6" fill="#A67400"/>
          </g>
          <!-- 右：山茶花盆 -->
          <g transform="translate(272,130)">
            <path d="M 10 30 L 42 30 L 36 54 L 16 54 Z" fill="#F29B76" stroke="#7A3E24" stroke-width="2"/>
            <circle cx="26" cy="20" r="13" fill="#FF758F" stroke="#992F46" stroke-width="1.8"/>
            <circle cx="26" cy="20" r="5" fill="#FFE066"/>
          </g>
        </svg>
        <span class="scene-float sf-1">👑</span>
        <span class="scene-float sf-2">🪙</span>
      `
    },

    ali: {
      bg: 'radial-gradient(circle at 50% 34%, #F9FCF4 0%, #DCEAC6 62%, #B6CC94 100%)',
      anim: 'showcase-prowl',
      hint: '竹林屋檐练功哨所',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 左：翠竹 -->
          <g stroke="#4E7C3E" stroke-width="2">
            <rect x="34" y="16" width="10" height="168" rx="4" fill="#77B85E"/>
            <line x1="33" y1="68" x2="45" y2="68" stroke="#3F6631" stroke-width="3"/>
            <line x1="33" y1="122" x2="45" y2="122" stroke="#3F6631" stroke-width="3"/>
            <ellipse cx="58" cy="48" rx="16" ry="5" fill="#82C964" transform="rotate(-18 58 48)"/>
            <ellipse cx="62" cy="96" rx="15" ry="5" fill="#82C964" transform="rotate(14 62 96)"/>
          </g>
          <!-- 木桩战垫 -->
          <ellipse cx="180" cy="186" rx="84" ry="18" fill="#8C6747" stroke="#4D3520" stroke-width="2.4"/>
          <ellipse cx="180" cy="182" rx="68" ry="11" fill="#C9A276"/>
          <!-- 右：悬挂靶子与手里剑 -->
          <g transform="translate(270,118)">
            <circle cx="28" cy="36" r="22" fill="#FFF3D6" stroke="#7A4C2A" stroke-width="2.4"/>
            <circle cx="28" cy="36" r="13" fill="#FF6B5B"/><circle cx="28" cy="36" r="5" fill="#FFE066"/>
          </g>
        </svg>
        <span class="scene-float sf-1">🍃</span>
        <span class="scene-float sf-2">🎯</span>
      `
    },

    wukong: {
      bg: 'radial-gradient(circle at 50% 34%, #FFFDF2 0%, #FFE8AF 62%, #F2BE63 100%)',
      anim: 'showcase-hero',
      hint: '齐天祥云仙桃台',
      html: `
        <svg class="scene-svg" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
          <!-- 左：金色如意金箍棒斜靠 -->
          <g transform="translate(36,78) rotate(-18 20 60)">
            <rect x="14" y="0" width="12" height="106" rx="5" fill="#D93D32" stroke="#781A14" stroke-width="2"/>
            <rect x="12" y="0" width="16" height="18" rx="3" fill="#FFD646" stroke="#996800" stroke-width="2"/>
            <rect x="12" y="88" width="16" height="18" rx="3" fill="#FFD646" stroke="#996800" stroke-width="2"/>
          </g>
          <!-- 祥云石台 -->
          <ellipse cx="180" cy="186" rx="90" ry="19" fill="#FFF4D1" stroke="#C98A2B" stroke-width="2.4"/>
          <path d="M 105 186 Q 120 174 138 184 M 222 184 Q 240 174 256 186" stroke="#E0A545" stroke-width="3" fill="none" stroke-linecap="round"/>
          <!-- 右：大仙桃 -->
          <g transform="translate(268,140)">
            <ellipse cx="26" cy="30" rx="20" ry="17" fill="#FF9AA2" stroke="#993B47" stroke-width="2"/>
            <path d="M 12 24 Q 26 42 40 24" fill="#FFF1D0" opacity=".45"/>
            <ellipse cx="16" cy="38" rx="10" ry="5" fill="#68B85D" transform="rotate(-20 16 38)"/>
          </g>
        </svg>
        <span class="scene-float sf-1">☁️</span>
        <span class="scene-float sf-2">🍑</span>
      `
    }
  };

  window.SHOWCASE_SCENES = SCENES;
})();
