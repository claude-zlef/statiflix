/* Generates Chrome Web Store assets for Statiflix at exact required sizes.
   Self-contained mock UI (no real personal data) in the product's Netflix-red theme.
   Run: NODE_PATH=/usr/lib/node_modules node store/gen-assets.js  (from project root) */
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'assets');

const FONT = `"Netflix Sans","Helvetica Neue",system-ui,-apple-system,Roboto,Arial,sans-serif`;
const C = {
  bg: '#0b0b0f', s1: '#16161c', s2: '#1d1d24', line: '#25252e',
  red: '#E50914', redDim: '#b3121a', text: '#f3f3f3', soft: '#cfcfcf', muted: '#9a9aa2', dim: '#6d6d75',
};

const SHOWS = [
  ['Crimson Lines', '#3a1c1c,#7a2b2b'], ['Northbound', '#1c2a3a,#2b5a7a'],
  ['Paper Crown', '#2a1c3a,#5a2b7a'], ['Deep Current', '#1c3a2a,#2b7a4a'],
  ['Glasshouse', '#3a2c1c,#7a5a2b'], ['Afterlight', '#3a1c2c,#7a2b5a'],
  ['The Cartographer', '#1c1c1c,#4a4a4a'], ['Saudade', '#2a2a1c,#5a5a2b'],
];
function banner(name, grad, w, meta) {
  return `<div style="width:${w}px;flex:0 0 auto">
    <div style="height:${Math.round(w*0.56)}px;border-radius:7px;background:linear-gradient(135deg,${grad});display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.9);font-weight:800;font-size:${Math.round(w*0.13)}px;text-align:center;padding:0 8px;line-height:1.05">${name}</div>
    <div style="font-size:13px;font-weight:600;margin-top:8px;color:${C.text}">${name}</div>
    <div style="font-size:11px;color:${C.muted};margin-top:2px">${meta}</div>
  </div>`;
}
function rail(w) {
  const metas = ['177 episodes', '88 episodes', '4.2h', '76 episodes', '61 episodes', '1.9h', '54 episodes', '40 episodes'];
  return `<div style="display:flex;gap:14px;overflow:hidden">${SHOWS.map((s, i) => banner(s[0], s[1], w, metas[i])).join('')}</div>`;
}
function heatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let rows = '';
  for (let d = 0; d < 7; d++) {
    let cells = '';
    for (let h = 0; h < 16; h++) {
      const a = Math.min(1, (Math.sin(d * 1.1 + h * 0.7) * 0.5 + 0.5) * (h / 15 * 0.8 + 0.25));
      const bg = a < 0.08 ? 'rgba(255,255,255,.05)' : `rgba(229,9,20,${(0.18 + a * 0.82).toFixed(2)})`;
      cells += `<div style="flex:1;height:15px;border-radius:3px;background:${bg}"></div>`;
    }
    rows += `<div style="display:flex;gap:4px;align-items:center"><span style="width:30px;color:${C.muted};font-size:11px">${days[d]}</span><div style="flex:1;display:flex;gap:4px">${cells}</div></div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:5px">${rows}</div>
    <div style="display:flex;justify-content:space-between;color:${C.dim};font-size:10px;margin-top:7px;padding-left:34px"><span>6a</span><span>12p</span><span>6p</span><span>12a</span></div>`;
}
function donut() {
  const segs = ['#E50914 0 42%', '#b3121a 42% 63%', '#7a2b2b 63% 78%', '#c98a2e 78% 89%', '#5a5a2b 89% 96%', '#404040 96% 100%'];
  const rows = [['Drama', 42], ['Thriller', 21], ['Crime', 15], ['Comedy', 11], ['Docs', 7], ['Other', 4]];
  return `<div style="display:flex;align-items:center;gap:20px">
    <div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${segs.join(',')});position:relative;flex:0 0 auto">
      <div style="position:absolute;inset:34px;background:${C.s1};border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:20px;font-weight:800">6</span><span style="font-size:10px;color:${C.muted}">genres</span></div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:9px">
      ${rows.map((r, i) => `<div style="display:flex;align-items:center;gap:8px;font-size:13px"><span style="width:10px;height:10px;border-radius:3px;background:${segs[i].split(' ')[0]}"></span>${r[0]}<span style="color:${C.muted};margin-left:auto">${r[1]}%</span></div>`).join('')}
    </div>
  </div>`;
}
function kpi(label, value, unit, red) {
  return `<div style="flex:1;background:${C.s1};border:1px solid ${C.line};border-radius:14px;padding:16px 18px">
    <div style="color:${C.muted};font-size:11px;text-transform:uppercase;letter-spacing:.6px">${label}</div>
    <div style="font-size:28px;font-weight:800;margin-top:6px;line-height:1;${red ? 'color:' + C.red : ''}">${value}${unit ? `<span style="font-size:13px;font-weight:600;color:${C.muted};margin-left:4px">${unit}</span>` : ''}</div>
  </div>`;
}
function bars(rows, accent) {
  const max = Math.max(...rows.map(r => r[1]));
  return `<div style="display:flex;flex-direction:column;gap:11px">${rows.map(r => `
    <div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span>${r[0]}</span><span style="color:${C.muted}">${r[2]}</span></div>
    <div style="height:7px;background:#23232b;border-radius:4px;overflow:hidden"><div style="width:${Math.round(r[1] / max * 100)}%;height:100%;background:linear-gradient(90deg,${C.redDim},${C.red})"></div></div></div>`).join('')}</div>`;
}
function logo(sz) {
  return `<div style="display:flex;align-items:center;gap:${Math.round(sz/3)}px">
    <div style="width:${sz}px;height:${sz}px;border-radius:${Math.round(sz/4)}px;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${Math.round(sz*0.55)}px;box-shadow:0 0 ${sz}px rgba(229,9,20,.5)">S</div>
    <span style="font-weight:800;font-size:${Math.round(sz*0.7)}px;letter-spacing:-.02em">STATI<span style="color:${C.red}">FLIX</span></span>
  </div>`;
}
function card(inner, title, hint) {
  return `<div style="background:${C.s1};border:1px solid ${C.line};border-radius:16px;padding:20px 22px">
    ${title ? `<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px"><h3 style="font-size:16px;font-weight:700">${title}</h3>${hint ? `<span style="color:${C.dim};font-size:12px">${hint}</span>` : ''}</div>` : ''}${inner}</div>`;
}
function frame(w, h, inner) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:${FONT}}
    html,body{width:${w}px;height:${h}px;overflow:hidden}
    body{background:radial-gradient(1100px 560px at 78% -8%, #2a0a0d 0%, ${C.bg} 55%);color:${C.text};position:relative}
    .eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:14px;font-weight:700;color:${C.red}}
    h3{font-weight:700}
  </style></head><body>${inner}</body></html>`;
}
const W = 1280, H = 800;

// 1 — hero
const s1 = frame(W, H, `
  <div style="height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 70px;gap:34px">
    <div>
      ${logo(48)}
      <div class="eyebrow" style="margin:26px 0 14px">Chrome extension · Free · Private</div>
      <div style="font-size:60px;line-height:1.03;letter-spacing:-.03em;font-weight:800">Your Netflix viewing,<br><span style="color:${C.red}">finally visible.</span></div>
      <div style="font-size:21px;color:${C.soft};margin-top:22px;max-width:62ch">Spotify Wrapped for your streaming — rewatch-free stats, abandoned shows, genres and your real binge hours. 100% on your device.</div>
    </div>
    <div style="display:flex;gap:12px">${[kpi('Hours watched', '3,077', 'h', true), kpi('Titles', '816'), kpi('Episodes', '3,089'), kpi('Peak hour', '10pm')].join('')}</div>
  </div>`);

// 2 — the dashboard (money shot)
const s2 = frame(W, H, `
  <div style="height:100%;display:flex;flex-direction:column;padding:26px 34px;gap:16px">
    <div style="display:flex;align-items:center;gap:14px">${logo(30)}<span style="color:${C.dim};font-size:13px">· All time · Alex</span><div style="margin-left:auto;display:flex;gap:10px"><span style="background:${C.s2};border:1px solid ${C.line};border-radius:8px;padding:8px 14px;font-size:13px;color:${C.muted}">All time ▾</span><span style="background:${C.red};border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700">Sync to phone</span></div></div>
    <div style="display:flex;gap:12px">${[kpi('Hours watched', '3,077', 'h', true), kpi('Titles', '816'), kpi('Episodes', '3,089'), kpi('Movies', '564')].join('')}</div>
    ${card(rail(150), 'Most watched')}
    <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;flex:1">${card(heatmap(), 'When you watch', 'day × hour')}${card(donut(), 'Top genres')}</div>
  </div>`);

// 3 — insights (abandoned + binge + weekday)
const s3 = frame(W, H, `
  <div style="height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;gap:22px">
    <div><div class="eyebrow">Insights you've never seen</div><div style="font-size:40px;font-weight:800;letter-spacing:-.02em;margin-top:12px">The shows you quit, the nights you binged</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      ${card(`<div style="display:flex;flex-direction:column;gap:14px">
        ${[['Glasshouse', '#3a2c1c,#7a5a2b', '8 of 26 episodes'], ['Afterlight', '#3a1c2c,#7a2b5a', 'stopped at 17%'], ['Saudade', '#2a2a1c,#5a5a2b', '2 of 12 episodes']].map(r => `<div style="display:flex;align-items:center;gap:12px"><div style="width:64px;height:36px;border-radius:6px;background:linear-gradient(135deg,${r[1]});flex:0 0 auto"></div><div style="flex:1"><div style="font-size:14px;font-weight:600">${r[0]}</div><div style="font-size:11.5px;color:${C.muted}">${r[2]}</div></div></div>`).join('')}
      </div>`, 'Abandoned', 'shows you quit')}
      ${card(`<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px"><span style="font-size:26px;font-weight:800;color:${C.red}">7.4h</span><span style="color:${C.muted};font-size:13px">Saturday, May 17</span></div>${rail(116)}`, 'Biggest binge day')}
    </div>
    ${card(bars([['Mon', 55, '55h'], ['Wed', 61, '61h'], ['Fri', 70, '70h'], ['Sat', 88, '88h'], ['Sun', 60, '60h']]), 'By weekday')}
  </div>`);

// 4 — E2EE mobile
const s4 = frame(W, H, `
  <div style="height:100%;display:grid;grid-template-columns:1fr .8fr;align-items:center;padding:0 80px;gap:50px">
    <div>
      <div class="eyebrow">End-to-end encrypted</div>
      <div style="font-size:46px;font-weight:800;letter-spacing:-.02em;margin:14px 0 22px">Your stats on your phone</div>
      <div style="font-size:19px;color:${C.soft};max-width:46ch;margin-bottom:28px">Scan one QR code to open a poster-rich view on mobile. The decryption key lives only in the code — our relay only ever stores ciphertext it can't read.</div>
      ${[['🔒', 'AES-256 encryption, key never leaves the QR'], ['📵', 'Relay is zero-knowledge — ciphertext only'], ['⏳', 'Auto-expires in 24 hours']].map(r => `<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;font-size:17px;color:${C.soft}"><span style="font-size:22px">${r[0]}</span>${r[1]}</div>`).join('')}
    </div>
    <div style="display:flex;justify-content:center">
      <div style="width:300px;background:${C.s1};border:1px solid ${C.line};border-radius:20px;padding:28px;text-align:center">
        <div style="font-size:17px;font-weight:700;margin-bottom:8px">Open on your phone</div>
        <div style="font-size:12.5px;color:${C.muted};margin-bottom:20px;line-height:1.5">Scan with your camera. Stats decrypt on your device.</div>
        <div style="width:200px;height:200px;margin:0 auto;background:#fff;border-radius:12px;background-image:repeating-linear-gradient(90deg,#141414 0,#141414 8px,#fff 8px,#fff 16px),repeating-linear-gradient(0deg,#141414 0,#141414 8px,#fff 8px,#fff 16px);background-blend-mode:multiply"></div>
        <div style="font-size:11px;color:${C.dim};margin-top:16px">Link expires in 24h.</div>
      </div>
    </div>
  </div>`);

// 5 — privacy
const s5 = frame(W, H, `
  <div style="height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 80px">
    <div class="eyebrow" style="text-align:center">Private by architecture</div>
    <div style="font-size:46px;font-weight:800;letter-spacing:-.02em;margin:14px 0 48px;text-align:center">100% local. No account. No tracking.</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px">
      ${[['🖥️', 'Parsed on device', 'Your history is read & analysed locally in your browser.'], ['🙅', 'No account', 'No sign-up, no email, no analytics, no ad IDs.'], ['🔐', 'E2EE sync', 'Mobile hand-off is encrypted; the relay sees only ciphertext.'], ['🔍', 'Open source', 'Every line is auditable on GitHub.']].map(c => `<div style="background:${C.s1};border:1px solid ${C.line};border-radius:14px;padding:28px 22px;text-align:center"><div style="font-size:32px;margin-bottom:14px">${c[0]}</div><div style="font-size:20px;font-weight:700;margin-bottom:8px">${c[1]}</div><div style="font-size:14px;color:${C.muted};line-height:1.5">${c[2]}</div></div>`).join('')}
    </div>
  </div>`);

// promo small 440x280
const promoSmall = frame(440, 280, `
  <div style="height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 34px">
    ${logo(40)}
    <div style="font-size:25px;font-weight:800;line-height:1.15;margin-top:20px">Your Netflix<br>viewing, quantified</div>
    <div style="font-size:14px;color:${C.muted};margin-top:12px">A private, Wrapped-style dashboard. Free.</div>
  </div>`);

// promo marquee 1400x560
const promoMarquee = frame(1400, 560, `
  <div style="height:100%;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;padding:0 90px;gap:50px">
    <div>
      ${logo(50)}
      <div style="font-size:56px;line-height:1.04;letter-spacing:-.03em;font-weight:800;margin-top:26px">Your Netflix viewing,<br><span style="color:${C.red}">finally visible.</span></div>
      <div style="font-size:20px;color:${C.soft};margin-top:22px;max-width:46ch">Spotify Wrapped for your streaming — private by design, with an end-to-end-encrypted mobile companion.</div>
    </div>
    <div>${card(rail(118), 'Most watched')}</div>
  </div>`);

// store icon 128
const icon = frame(128, 128, `<div style="height:100%;display:flex;align-items:center;justify-content:center"><div style="width:116px;height:116px;border-radius:26px;background:linear-gradient(135deg,#ff2630,#b3121a);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:78px">S</div></div>`);

(async () => {
  const b = await chromium.launch();
  const jobs = [
    ['screenshot-1-hero.png', W, H, s1],
    ['screenshot-2-dashboard.png', W, H, s2],
    ['screenshot-3-insights.png', W, H, s3],
    ['screenshot-4-mobile.png', W, H, s4],
    ['screenshot-5-privacy.png', W, H, s5],
    ['promo-small-440x280.png', 440, 280, promoSmall],
    ['promo-marquee-1400x560.png', 1400, 560, promoMarquee],
    ['store-icon-128.png', 128, 128, icon],
  ];
  for (const [name, w, h, html] of jobs) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(OUT, name) });
    await p.close();
    console.log('wrote', name, `${w}x${h}`);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
