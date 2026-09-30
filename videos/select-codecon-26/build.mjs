// Generates the six standalone compositions (3 angles × 9:16 / 16:9) in the codecon.dev/select
// design system (see frame.md). Run: node build.mjs → compositions/<angle>-<aspect>.html
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const FORMATS = {
  "9x16": { w: 1080, h: 1920, port: true, colL: 60, colR: 1020 },
  "16x9": { w: 1920, h: 1080, port: false, colL: 360, colR: 1560 },
};

const COUPON = "PALESTRANTE20";
const PRICE = "R$ 1.290";
const PRICE_OFF = "R$ 1.032";
const SITE = "codecon.dev/select";

const PAPER = "#F0EFEE";
const INK = "#050707";
const RULE = "#D4D3D1";
const RULE_DK = "#2A2D2D";
const MUTE = "#6B6A69";
const STEEL = "#99A0A9";

const EVENT = JSON.parse(readFileSync("../../src/data/event.json", "utf8"));
const WHO = Object.fromEntries(EVENT.speakers.map((s) => [s.id, s]));
const ASCII = JSON.parse(readFileSync("assets/logo/select-ascii.json", "utf8"));

// ---------------------------------------------------------------- shared

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const STAR = (c) =>
  `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 0 C10.8 7 13 9.2 20 10 C13 10.8 10.8 13 10 20 C9.2 13 7 10.8 0 10 C7 9.2 9.2 7 10 0Z" style="fill:${c}"/></svg>`;

const css = (f) => `
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/SpaceMono-Regular.woff") format("woff")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/SpaceMono-Bold.woff") format("woff")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${f.w}px;height:${f.h}px;overflow:hidden;background:${PAPER}}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:${PAPER};color:${INK};font-family:"Space Mono",monospace}
.scene{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}
.bg-paper{position:absolute;inset:0;background:${PAPER}}
.bg-ink{position:absolute;inset:0;background:${INK}}
.on-ink{color:${PAPER}}
.grain{position:absolute;inset:0;pointer-events:none;background-image:${GRAIN};opacity:.07;mix-blend-mode:multiply}
.on-ink .grain,.grain.dk{opacity:.10;mix-blend-mode:screen}
.gut{position:absolute;top:0;bottom:0;background-image:radial-gradient(circle,${RULE} 1.3px,transparent 1.7px);background-size:16px 16px}
.on-ink .gut{background-image:radial-gradient(circle,#1c1f1f 1.3px,transparent 1.7px)}
.vl{position:absolute;top:0;bottom:0;width:1px;background:${RULE};transform-origin:50% 0}
.hl{position:absolute;left:0;right:0;height:1px;background:${RULE};transform-origin:0 50%}
.on-ink .vl,.on-ink .hl{background:${RULE_DK}}
.star{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px}
.star svg{display:block}
.hatch{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,${RULE} 0 1px,transparent 1px 9px);border-top:1px solid ${RULE};border-bottom:1px solid ${RULE}}
.col{position:absolute;left:${f.colL + 40}px;width:${f.colR - f.colL - 80}px}
.b{font-weight:700}
.up{text-transform:uppercase}
.mute{color:${MUTE}}
.steel{color:${STEEL}}
.nw{white-space:nowrap}
.ty{display:block;flex-shrink:0;overflow:hidden;white-space:nowrap;width:0;line-height:1.12;padding-bottom:.04em}
.cur{display:block;flex-shrink:0;width:.6em;height:.9em;background:currentColor;margin-top:.1em;opacity:0}
.line{display:flex;align-items:flex-start;white-space:nowrap}
.btn{display:inline-flex;align-items:center;justify-content:center;background:${INK};color:${PAPER};height:${f.port ? 92 : 64}px;padding:0 ${f.port ? 36 : 26}px;
  font-size:${f.port ? 34 : 24}px;white-space:nowrap;perspective:600px;position:relative;overflow:hidden}
.on-ink .btn,.btn.lt{background:${PAPER};color:${INK}}
.btn .fa,.btn .fb{display:block;backface-visibility:hidden;transform-origin:50% 50% -${f.port ? 20 : 14}px}
.btn .fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.photo{position:absolute;overflow:hidden;background:#111}
.photo img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.12) brightness(.96)}
.photo::after{content:"";position:absolute;inset:0;background-image:${GRAIN};opacity:.22;mix-blend-mode:screen}
.logo{display:block;height:auto}
.tile{display:flex;flex-direction:column;gap:${f.port ? 10 : 8}px}
.tile .ph{position:relative;overflow:hidden;background:#ddd}
.tile .ph img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.08)}
.tile .ph::after{content:"";position:absolute;inset:0;background-image:${GRAIN};opacity:.18;mix-blend-mode:screen}
.tile .nm{font-weight:700;font-size:${f.port ? 26 : 17}px;line-height:1.25}
.tile .rl{font-size:${f.port ? 19 : 13}px;color:${MUTE};line-height:1.35}
`;

function doc(f, id, duration, style, body, script, track) {
  const audio = existsSync(track)
    ? `<audio id="bgm" src="${track}" data-start="0" data-duration="${duration}" data-track-index="9" data-volume="0.85"></audio>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${f.w}, height=${f.h}" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>${css(f)}${style}</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${duration}" data-width="${f.w}" data-height="${f.h}" data-fps="30">
${body}
${audio}
</div>
<script>
const P = ${f.port};
const tl = gsap.timeline({ paused: true });
// typed mono text: width grows in whole characters, block cursor rides the edge
function type(sel, n, at, cps, keepCursor) {
  const el = document.querySelector(sel);
  const cur = el.nextElementSibling && el.nextElementSibling.classList.contains("cur") ? el.nextElementSibling : null;
  const d = n / (cps || 22);
  const pr = { v: 0 };
  el.style.width = "0ch";
  tl.fromTo(pr, { v: 0 }, { v: n, duration: d, ease: "none", onUpdate: () => { el.style.width = Math.floor(pr.v + 1e-6) + "ch"; } }, at);
  if (cur) {
    tl.set(cur, { opacity: 1 }, at);
    if (!keepCursor) tl.set(cur, { opacity: 0 }, at + d + 0.12);
  }
  return at + d;
}
function blink(sel, from, to) {
  for (let t = from; t < to; t += 0.5) { tl.set(sel, { opacity: 0 }, t); tl.set(sel, { opacity: 1 }, t + 0.25); }
}
function draw(root, at) {
  tl.fromTo(root + " .vl", { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power3.out", stagger: 0.05 }, at);
  tl.fromTo(root + " .hl", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", stagger: 0.05 }, at + 0.05);
  tl.fromTo(root + " .star", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: "power2.out", stagger: 0.03 }, at + 0.3);
}
function flipIn(sel, at) {
  tl.fromTo(sel, { rotationX: -90, opacity: 0, transformPerspective: 600 }, { rotationX: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, at);
}
function flipSwap(btn, at) {
  tl.to(btn + " .fa", { rotationX: 90, opacity: 0, duration: 0.3, ease: "power2.in" }, at);
  tl.fromTo(btn + " .fb", { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, at + 0.12);
}
${script}
window.__timelines = window.__timelines || {};
window.__timelines["${id}"] = tl;
</script>
</body>
</html>
`;
}

// construction: framed column, dotted gutters, hairlines with stars on the crossings
function construct(f, { rows = [], hatch = null, gutters = true } = {}) {
  const c = (color) => STAR(color);
  const starColor = "var(--star)";
  let h = "";
  if (gutters)
    h += `<div class="gut" style="left:0;width:${f.colL}px"></div><div class="gut" style="left:${f.colR + 1}px;right:0"></div>`;
  if (hatch) h += `<div class="hatch" style="top:${hatch[0]}px;height:${hatch[1]}px"></div>`;
  h += `<div class="vl" style="left:${f.colL}px"></div><div class="vl" style="left:${f.colR}px"></div>`;
  for (const y of rows) {
    h += `<div class="hl" style="top:${y}px"></div>`;
    h += `<div class="star" style="left:${f.colL + 0.5}px;top:${y + 0.5}px">${c(starColor)}</div>`;
    h += `<div class="star" style="left:${f.colR + 0.5}px;top:${y + 0.5}px">${c(starColor)}</div>`;
  }
  return `<div class="construct">${h}</div>`;
}

const typed = (id, text, cls = "") =>
  `<span class="line ${cls}"><span class="ty" id="${id}">${text}</span><i class="cur" id="${id}-c"></i></span>`;
const button = (id, a, b, cls = "") =>
  `<div class="btn ${cls}" id="${id}"><span class="fa">${a}</span>${b ? `<span class="fb" style="opacity:0">${b}</span>` : ""}</div>`;

// ASCII logo: three brightness layers of glyphs, resolved over time (pure function of t → seek-safe)
function asciiBlock(f, id, width) {
  const cw = width / ASCII.w;
  const fs = cw / 0.6;
  const html = `<div class="ascii" id="${id}" style="width:${width}px;height:${Math.round(fs * ASCII.h)}px">
  <pre class="al a3" id="${id}-3" data-layout-allow-overlap></pre><pre class="al a2" id="${id}-2" data-layout-allow-overlap></pre><pre class="al a1" id="${id}-1" data-layout-allow-overlap></pre></div>`;
  const style = `
.ascii{position:relative}
.al{position:absolute;left:0;top:0;margin:0;font-family:"Space Mono",monospace;font-size:${fs.toFixed(3)}px;line-height:${fs.toFixed(3)}px;letter-spacing:0;color:${PAPER};white-space:pre}
.a1{text-shadow:0 0 ${Math.round(fs * 0.9)}px rgba(240,239,238,.55)}
.a2{opacity:.55}
.a3{opacity:.22}`;
  return { html, style };
}
const asciiScript = (id, start, dur) => `
(function () {
  const A = ${JSON.stringify(ASCII)};
  const R1 = "0QOUXJCLZ#", R2 = "zuvxcnrj1Y", R3 = ":;~-+<>i!_";
  const hash = (a, b, c) => { let x = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; x = (x ^ (x >>> 13)) * 1274126177; return ((x ^ (x >>> 16)) >>> 0) / 4294967295; };
  const L = [document.getElementById("${id}-1"), document.getElementById("${id}-2"), document.getElementById("${id}-3")];
  const st = { t: 0 };
  function paint() {
    const t = st.t, fr = Math.floor(t * 12);
    const out = ["", "", ""];
    for (let y = 0; y < A.h; y++) {
      for (let x = 0; x < A.w; x++) {
        const v = A.v[y * A.w + x];
        const r = hash(x, y, 7) * 0.7 + (x / A.w) * 0.5;
        const lvl = v > 160 ? 0 : v > 60 ? 1 : v > 15 ? 2 : -1;
        for (let k = 0; k < 3; k++) {
          let ch = " ";
          if (lvl === k && t >= r) {
            const set = k === 0 ? R1 : k === 1 ? R2 : R3;
            const settle = t - r > 0.35 ? Math.floor(fr / 3) : fr;
            ch = set[Math.floor(hash(x, y, settle) * set.length)];
          } else if (lvl >= 0 && k === 2 && t >= r - 0.18 && t < r) {
            ch = R3[Math.floor(hash(x, y, fr) * R3.length)];
          }
          out[k] += ch;
        }
      }
      out[0] += "\\n"; out[1] += "\\n"; out[2] += "\\n";
    }
    L[0].textContent = out[0]; L[1].textContent = out[1]; L[2].textContent = out[2];
  }
  paint();
  tl.to(st, { t: ${dur}, duration: ${dur}, ease: "none", onUpdate: paint }, ${start});
})();`;

// ---------------------------------------------------------------- end card (shared)

function endCard(f, start, dur, kicker) {
  const s = start;
  const P = f.port;
  const rows = P ? [240, 1640] : [100, 980];
  const html = `
<section id="end" class="scene clip" data-start="${s}" data-duration="${dur}" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows })}
  <div class="grain"></div>
  <img class="logo" id="end-logo" src="assets/logo/select-ink.svg" alt="select experience" />
  <div class="col end-l">
    <div class="end-kick up" id="end-kick">${kicker}</div>
    <h2 class="end-h">${typed("end-h1", "Garanta seu")}${typed("end-h2", "lugar")}</h2>
    <div class="end-sub mute" id="end-sub">São poucas vagas disponíveis.</div>
  </div>
  <div class="end-r">
    <div class="lbl" id="end-l1">Lote atual</div>
    <div class="old" id="end-old"><span>${PRICE}</span><i id="end-strike"></i></div>
    <div class="lbl" id="end-l2">com o cupom de palestrante <span class="off">-20%</span></div>
    <div class="code b" id="end-code"><span class="ty" id="end-code-t">${COUPON}</span><i class="cur" id="end-code-t-c"></i></div>
    <div class="new b nw" id="end-new">${PRICE_OFF}</div>
    ${button("end-btn", "garanta seu lugar →", `use ${COUPON} →`)}
  </div>
  <div class="end-meta up" id="end-meta"><span>14 de novembro <b class="steel">//</b> State Innovation Center · SP</span><span>${SITE}</span></div>
</section>`;
  const style = P
    ? `
#end-logo{position:absolute;left:100px;top:150px;width:250px}
.end-l{top:300px}
.end-kick{font-size:26px;color:${MUTE};margin-bottom:22px}
.end-h{font-weight:400;font-size:112px;line-height:1.02;letter-spacing:-.01em}
.end-sub{font-size:30px;margin-top:22px}
.end-r{position:absolute;left:100px;width:880px;top:720px;display:flex;flex-direction:column;align-items:flex-start}
.lbl{font-size:30px;margin-bottom:6px}
.old{position:relative;font-size:72px;color:${MUTE};margin-bottom:34px;line-height:1.1}
.old i{position:absolute;left:-4px;right:-4px;top:54%;height:5px;background:${MUTE};transform-origin:0 50%}
.code{background:${INK};color:${PAPER};font-size:84px;line-height:1;padding:26px 30px;margin:10px 0 26px}
.new{font-size:150px;line-height:1;margin-bottom:40px}
.off{font-size:28px;border:1px solid ${INK};padding:2px 10px;margin-left:12px;font-weight:700}
.end-meta{position:absolute;left:100px;right:100px;top:1672px;display:flex;flex-direction:column;gap:10px;font-size:24px;color:${INK}}`
    : `
#end-logo{position:absolute;left:400px;top:28px;width:150px}
.end-l{top:250px;width:520px}
.end-kick{font-size:20px;color:${MUTE};margin-bottom:20px}
.end-h{font-weight:400;font-size:76px;line-height:1.02;letter-spacing:-.01em}
.end-sub{font-size:24px;margin-top:22px}
.end-r{position:absolute;left:960px;width:560px;top:180px;display:flex;flex-direction:column;align-items:flex-start}
.lbl{font-size:22px;margin-bottom:4px}
.old{position:relative;font-size:52px;color:${MUTE};margin-bottom:26px;line-height:1.1}
.old i{position:absolute;left:-4px;right:-4px;top:54%;height:4px;background:${MUTE};transform-origin:0 50%}
.code{background:${INK};color:${PAPER};font-size:60px;line-height:1;padding:20px 24px;margin:8px 0 22px}
.new{font-size:108px;line-height:1;margin-bottom:34px}
.off{font-size:20px;border:1px solid ${INK};padding:2px 8px;margin-left:10px;font-weight:700}
.end-meta{position:absolute;left:400px;right:400px;top:1004px;display:flex;justify-content:space-between;font-size:20px;color:${INK}}`;
  const script = `
draw("#end", ${s});
tl.fromTo("#end-logo", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, ${s + 0.1});
tl.fromTo("#end-kick", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${s + 0.15});
{ const t1 = type("#end-h1", 11, ${s + 0.2}, 34); type("#end-h2", 5, t1 + 0.02, 34, true); blink("#end-h2-c", t1 + 0.4, ${s + dur}); }
tl.fromTo("#end-sub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${s + 0.8});
tl.fromTo(["#end-l1", "#end-old"], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 }, ${s + 0.55});
tl.fromTo("#end-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, ${s + 0.95});
tl.fromTo("#end-l2", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${s + 1.15});
tl.fromTo("#end-code", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.25, ease: "steps(6)" }, ${s + 1.25});
type("#end-code-t", 13, ${s + 1.45}, 28);
flipIn("#end-new", ${s + 1.95});
flipIn("#end-btn", ${s + 2.3});
tl.fromTo("#end-meta", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${s + 2.5});
flipSwap("#end-btn", ${Math.min(s + 3.05, s + dur - 0.9)});
`;
  return { html, style, script };
}

const tileHTML = (id, sz, extra = "") => {
  const p = WHO[id];
  const role = p.company || p.role;
  return `<div class="tile ${extra}" style="width:${sz}px"><div class="ph" style="width:${sz}px;height:${sz}px"><img src="assets/speakers/${id}.jpg" alt="" /></div><div class="nm">${p.name}</div><div class="rl">${role}</div></div>`;
};

// ---------------------------------------------------------------- 1) hype

function hype(f) {
  const P = f.port;
  const end = endCard(f, 11.6, 3.4, "cupom de palestrante · 20% off");
  const photos = ["fishbowl", "mic", "trio", "stage-chair", "listener", "glasses"];
  const formats = ["FISHBOWL", "MENTORIA", "WORKSHOP", "ROUNDTABLE", "KATA", "AMA"];
  const quem = P
    ? ["sseraphini", "mario-souto", "erick-wendel", "marcela-godoy", "elemar-junior", "rafael-dias", "felipe-ribeiro", "rosicleia-frasson", "juliano-martins"]
    : ["sseraphini", "mario-souto", "erick-wendel", "marcela-godoy", "elemar-junior", "rafael-dias", "felipe-ribeiro", "rosicleia-frasson", "juliano-martins", "henrique-souza", "rafael-dohms", "marcelio-leal"];
  const tsz = P ? 260 : 170;
  const asc = asciiBlock(f, "asc", P ? 880 : 1120);
  const stats = [
    ["300", "vagas. apenas."],
    ["+25", "palestrantes reconhecidos."],
    ["+20", "sessões para você montar sua jornada."],
    ["1", "um dia que transforma."],
  ];

  const body = `
<section id="s1" class="scene clip" data-start="0" data-duration="3.0" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows: P ? [250, 1660] : [80, 1000] })}
  <div class="nav" id="nav">
    <img class="logo" src="assets/logo/select-ink.svg" alt="select experience" />
    ${P ? "" : `<span class="links">programação&nbsp;&nbsp;&nbsp;por que participar?&nbsp;&nbsp;&nbsp;perguntas frequentes</span>`}
    ${button("nav-btn", "inscreva-se", "")}
  </div>
  <div class="col hero">
    <h1 class="kgb b up">${typed("k1", "Keep")}${typed("k2", "Getting")}${typed("k3", "Better")}</h1>
    <div class="sub" id="sub"><span class="line">O encontro anual dos devs que</span><span class="line">chegaram longe e não têm</span><span class="line">intenção de parar.</span></div>
    ${P ? "" : `<div class="meta nw" id="meta">14 de novembro · São Paulo · 300 participantes</div>`}
    ${P ? "" : button("hero-btn", "garanta seu lugar →", "")}
  </div>
  <div class="photo" id="hero-ph"><img src="assets/photos/hero-stage.jpg" alt="" /></div>
  <div class="grain"></div>
</section>

<section id="s2" class="scene clip on-ink" data-start="3.0" data-duration="3.4" data-track-index="1" style="--star:${RULE_DK}">
  <div class="bg-ink"></div>
  ${photos.map((p, i) => `<div class="photo s2ph" id="s2p-${i}" style="opacity:0"><img src="assets/photos/${p}.jpg" alt="" /></div>`).join("")}
  <div class="s2-shade"></div>
  ${construct(f, { rows: P ? [1200] : [], gutters: false })}
  <div class="col s2-txt">
    <div class="fmt up" id="fmt">${formats.map((x, i) => `<span class="fmt-i" id="fmt-${i}" style="opacity:0">${x}</span>`).join("")}</div>
    <div class="talk b up" id="talk">Talkless.</div>
    ${typed("tk1", "sem palco central.")}${typed("tk2", "sem palestrante no pedestal.")}${typed("tk3", "sem plateia calada.")}
  </div>
  <div class="grain dk"></div>
</section>

<section id="s3" class="scene clip" data-start="6.4" data-duration="2.8" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows: P ? [220] : [100] })}
  <div class="col quem">
    <h2 class="qh b">${typed("qh", "Quem vai")}</h2>
    <div class="qs mute" id="qs">Desenvolvedores sênior e lideranças técnicas${P ? "<br/>" : " "}de Nubank, Google, iFood, Oracle, Mercado Livre…</div>
    <div class="qgrid">${quem.map((id) => tileHTML(id, tsz, "qt")).join("")}</div>
  </div>
  <div class="grain"></div>
</section>

<section id="s4" class="scene clip on-ink" data-start="9.2" data-duration="2.4" data-track-index="1" style="--star:${RULE_DK}">
  <div class="bg-ink"></div>
  ${construct(f, { rows: P ? [780] : [620] })}
  <div class="asc-wrap">${asc.html}</div>
  <div class="col stats">${stats.map(([n, l], i) => `<div class="stat" id="st-${i}"><div class="sn">${n}</div><div class="sl up">${l}</div></div>`).join("")}</div>
  <div class="grain dk"></div>
</section>
${end.html}`;

  const style = `
${asc.style}
.nav{position:absolute;left:${f.colL + 40}px;right:${f.w - f.colR + 40}px;top:${P ? 150 : 16}px;display:flex;align-items:center;gap:${P ? 0 : 26}px;justify-content:space-between}
.nav .logo{width:${P ? 230 : 128}px}
.nav .links{font-size:18px;margin-right:auto;margin-left:10px;margin-top:10px}
.nav .btn{height:${P ? 72 : 46}px;font-size:${P ? 28 : 18}px;padding:0 ${P ? 26 : 14}px}
.hero{top:${P ? 330 : 190}px;${P ? "" : "width:520px"}}
.kgb{font-size:${P ? 180 : 116}px;line-height:1;letter-spacing:0}
.sub{font-size:${P ? 36 : 26}px;line-height:1.5;margin-top:${P ? 50 : 40}px}
.meta{font-size:18px;margin-top:30px}
#hero-btn{margin-top:${P ? 50 : 36}px}
#hero-ph{${P ? "left:61px;right:61px;top:1200px;height:459px" : "left:960px;width:600px;top:81px;height:919px"}}
.s2ph{${P ? "left:0;right:0;top:0;height:1200px" : "inset:0"}}
.s2-shade{position:absolute;inset:0;background:${P ? `linear-gradient(to bottom,rgba(5,7,7,0) 0,rgba(5,7,7,0) 900px,${INK} 1200px)` : `linear-gradient(to right,rgba(5,7,7,.92) 0,rgba(5,7,7,.75) 40%,rgba(5,7,7,0) 75%)`}}
.s2-txt{top:${P ? 1060 : 330}px}
.fmt{position:relative;height:${P ? 60 : 46}px;margin-bottom:${P ? 40 : 30}px}
.fmt-i{position:absolute;left:0;top:0;background:${PAPER};color:${INK};font-size:${P ? 30 : 22}px;height:${P ? 60 : 46}px;line-height:${P ? 60 : 46}px;padding:0 ${P ? 18 : 14}px}
.talk{font-size:${P ? 150 : 128}px;line-height:1;margin-bottom:${P ? 40 : 34}px}
.s2-txt .line{font-size:${P ? 40 : 34}px;line-height:1.6}
.quem{top:${P ? 280 : 140}px}
.qh{font-size:${P ? 84 : 60}px;line-height:1.1;font-weight:700}
.qs{font-size:${P ? 30 : 22}px;line-height:1.5;margin-top:${P ? 16 : 10}px}
.qgrid{display:grid;grid-template-columns:repeat(${P ? 3 : 6},${tsz}px);gap:${P ? "34px 50px" : "30px 20px"};margin-top:${P ? 60 : 44}px}
.asc-wrap{position:absolute;left:${f.colL + 40}px;top:${P ? 360 : 150}px}
.stats{top:${P ? 880 : 690}px;display:grid;grid-template-columns:${P ? "1fr 1fr" : "repeat(4,1fr)"};gap:${P ? "70px 40px" : "0 30px"}}
.sn{font-size:${P ? 170 : 116}px;line-height:1;font-weight:400}
.sl{font-size:${P ? 28 : 20}px;line-height:1.4;margin-top:${P ? 14 : 12}px;max-width:${P ? 400 : 250}px}
${end.style}`;

  const script = `
// s1 — the site's hero, built live
draw("#s1", 0);
tl.fromTo("#nav", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.1);
{ let t = type("#k1", 4, 0.3, 20); t = type("#k2", 7, t + 0.04, 20); t = type("#k3", 6, t + 0.04, 20, true); blink("#k3-c", t + 0.25, 3.0); }
tl.fromTo("#hero-ph", { clipPath: P ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.5, ease: "steps(8)" }, 0.45);
tl.fromTo("#hero-ph img", { scale: 1.12 }, { scale: 1.0, duration: 2.6, ease: "power1.out" }, 0.45);
tl.fromTo("#sub .line", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.12 }, 1.45);
${P ? "" : `tl.fromTo("#meta", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 1.9);`}
if (!P) flipIn("#hero-btn", 2.1);

// s2 — talkless over the real floor, hard cuts on the beat
{ const cut = 3.4 / 6;
  for (let i = 0; i < 6; i++) {
    const t0 = 3.0 + i * cut;
    tl.set("#s2p-" + i, { opacity: 1 }, t0);
    if (i < 5) tl.set("#s2p-" + i, { opacity: 0 }, t0 + cut);
    tl.fromTo("#s2p-" + i + " img", { scale: 1.1 }, { scale: 1.0, duration: cut + 0.1, ease: "none" }, t0);
    tl.set("#fmt-" + i, { opacity: 1 }, t0);
    if (i < 5) tl.set("#fmt-" + i, { opacity: 0 }, t0 + cut);
  }
}
tl.fromTo("#talk", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "steps(9)" }, 3.15);
{ let t = type("#tk1", 18, 3.6, 40); t = type("#tk2", 28, t + 0.15, 40); type("#tk3", 19, t + 0.15, 40, true); }

// s3 — quem vai
draw("#s3", 6.4);
type("#qh", 8, 6.45, 26);
tl.fromTo("#qs", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 6.75);
tl.fromTo(".qt .ph", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.3, ease: "steps(6)", stagger: 0.07 }, 6.75);
tl.fromTo(".qt .nm, .qt .rl", { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.035 }, 6.95);
tl.fromTo(".qt .ph img", { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power1.out" }, 6.75);

// s4 — ASCII logo + stats
draw("#s4", 9.2);
${asciiScript("asc", 9.2, 2.4)}
tl.fromTo(".stat", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out", stagger: 0.12 }, 9.8);
${end.script}`;
  return doc(f, `hype-${P ? "9x16" : "16x9"}`, 15, style, body, script, "assets/audio/hype.mp3");
}

// ---------------------------------------------------------------- 2) invite

function invite(f) {
  const P = f.port;
  const end = endCard(f, 10.6, 4.4, "vem comigo · use meu cupom");
  const river = ["mario-souto", "erick-wendel", "marcela-godoy", "elemar-junior", "rafael-dias", "felipe-ribeiro", "rosicleia-frasson", "henrique-souza", "rafael-dohms", "marcelio-leal", "paula-moura", "waldemar-neto", "leonardo-accorsi", "damiana-costa", "rodrigo-branas", "alex-rios", "ana-neri", "douglas-hermann"];
  const rsz = P ? 250 : 190;
  const rows = [0, 1, 2].map((r) => river.filter((_, i) => i % 3 === r));

  const body = `
<section id="i1" class="scene clip" data-start="0" data-duration="3.6" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows: P ? [250, 1660] : [80, 1000] })}
  <div class="col i1-txt">
    <div class="pc up" id="pc">presença confirmada</div>
    <h1 class="say b up">${typed("y1", "Eu vou")}${typed("y2", "estar na")}${typed("y3", "Select.")}</h1>
    <div class="who1" id="who1">sseraphini · CTO @ Woovi</div>
  </div>
  <div class="card" id="card"><img src="assets/promo/sibelius-feed.jpg" alt="sseraphini — presença confirmada" /></div>
  <div class="grain"></div>
</section>

<section id="i2" class="scene clip" data-start="3.6" data-duration="4.0" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows: P ? [250, 1660] : [80, 1000], hatch: null })}
  <div class="col i2-in">
    <div class="meta2 up" id="meta2"><span class="tag">Fishbowl</span><span>Studio</span><span>15:30</span></div>
    <h2 class="st b up">${typed("t1", "Build vs. buy")}${typed("t2", "vs. wrap-an-LLM")}</h2>
    <div class="sd mute" id="sd">Onde vale investir engenharia própria — e onde faz mais sentido aproveitar o que já existe.</div>
    <div class="duo">
      ${tileHTML("juliano-martins", P ? 420 : 200, "du")}
      ${tileHTML("sseraphini", P ? 420 : 200, "du me")}
    </div>
  </div>
  <div class="grain"></div>
</section>

<section id="i3" class="scene clip on-ink" data-start="7.6" data-duration="3.0" data-track-index="1" style="--star:${RULE_DK}">
  <div class="bg-ink"></div>
  <div class="rows">${rows.map((r, ri) => `<div class="row" id="row-${ri}">${[...r, ...r, ...r].map((id) => `<div class="photo rp" style="width:${rsz}px;height:${rsz}px"><img src="assets/speakers/${id}.jpg" alt="" /></div>`).join("")}</div>`).join("")}</div>
  <div class="i3-shade"></div>
  ${construct(f, { rows: [], gutters: false })}
  <div class="col i3-in">
    <div class="i3-k up" id="i3-k">Quem vai</div>
    <div class="i3-big b up" id="i3-big">+25 palestrantes</div>
    <div class="i3-sub" id="i3-sub">Se você precisou pensar se isso é pra você, provavelmente é.</div>
  </div>
  <div class="grain dk"></div>
</section>
${end.html}`;

  const style = `
.i1-txt{top:${P ? 330 : 300}px;${P ? "" : "width:560px"}}
.pc{font-size:${P ? 30 : 22}px;color:${MUTE};letter-spacing:.08em;margin-bottom:${P ? 26 : 22}px}
.say{font-size:${P ? 118 : 104}px;line-height:1.02}
.who1{font-size:${P ? 30 : 24}px;margin-top:${P ? 30 : 30}px}
.card{position:absolute;overflow:hidden;${P ? "left:230px;width:620px;top:940px;height:775px" : "left:960px;top:81px;width:600px;height:750px"}}
.card img{display:block;width:100%;height:100%;object-fit:cover}
.i2-in{top:${P ? 330 : 170}px}
.meta2{display:flex;gap:0;font-size:${P ? 28 : 22}px;margin-bottom:${P ? 44 : 34}px}
.meta2 span{border:1px solid ${INK};padding:${P ? "10px 18px" : "8px 14px"};margin-right:-1px}
.meta2 .tag{background:${INK};color:${PAPER}}
.st{font-size:${P ? 88 : 96}px;line-height:1.04}
.sd{font-size:${P ? 30 : 24}px;line-height:1.5;margin-top:${P ? 30 : 26}px;max-width:${P ? 880 : 900}px}
.duo{display:flex;gap:${P ? 40 : 30}px;margin-top:${P ? 80 : 50}px}
.du{width:${P ? 420 : 360}px}
.du .nm{font-size:${P ? 30 : 22}px}
.du .rl{font-size:${P ? 20 : 15}px;white-space:normal}
${P ? "" : ".du{flex-direction:row;align-items:flex-start;gap:20px;width:540px !important}.du .ph{flex-shrink:0}.du .txt{display:flex;flex-direction:column}"}
.me .ph img{filter:none}
.rows{position:absolute;inset:-200px;display:flex;flex-direction:column;justify-content:center;gap:16px;transform:rotate(-8deg)}
.row{display:flex;gap:16px;width:max-content}
.rp{position:relative;flex-shrink:0}
.i3-shade{position:absolute;inset:0;background:${P ? `linear-gradient(to bottom,rgba(5,7,7,.35),rgba(5,7,7,.85) 45%,rgba(5,7,7,.85) 70%,rgba(5,7,7,.35))` : `linear-gradient(to right,rgba(5,7,7,.95) 20%,rgba(5,7,7,.75) 55%,rgba(5,7,7,.25))`}}
.i3-in{top:${P ? 720 : 360}px}
.i3-k{font-size:${P ? 30 : 22}px;color:${STEEL};margin-bottom:20px}
.i3-big{font-size:${P ? 104 : 110}px;line-height:1.02}
.i3-sub{font-size:${P ? 34 : 30}px;line-height:1.5;margin-top:${P ? 34 : 30}px;max-width:${P ? 880 : 800}px}
${end.style}`;

  // desktop: the duo tiles sit photo-left / text-right
  const bodyFixed = P ? body : body.replace(/<div class="tile du([^"]*)"([^>]*)><div class="ph"([^>]*)>(.*?)<\/div><div class="nm">(.*?)<\/div><div class="rl">(.*?)<\/div><\/div>/g,
    (_, c, tAttr, phAttr, img, nm, rl) => `<div class="tile du${c}"${tAttr}><div class="ph"${phAttr}>${img}</div><div class="txt"><div class="nm">${nm}</div><div class="rl">${rl}</div></div></div>`);

  const script = `
// i1 — the official card + "eu vou estar na select"
draw("#i1", 0);
tl.fromTo("#pc", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.15);
{ let t = type("#y1", 6, 0.35, 18); t = type("#y2", 8, t + 0.04, 18); t = type("#y3", 7, t + 0.04, 18, true); blink("#y3-c", t + 0.25, 3.6); }
tl.fromTo("#card", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "steps(10)" }, 0.5);
tl.fromTo("#card img", { scale: 1.1 }, { scale: 1.0, duration: 3.0, ease: "power1.out" }, 0.5);
tl.fromTo("#who1", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.1);

// i2 — the session
draw("#i2", 3.6);
tl.fromTo("#meta2 span", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.08 }, 3.7);
{ const t = type("#t1", 13, 3.9, 30); type("#t2", 15, t + 0.05, 30, true); blink("#t2-c", t + 0.8, 7.6); }
tl.fromTo("#sd", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 5.05);
tl.fromTo(".du .ph", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.3, ease: "steps(6)", stagger: 0.2 }, 5.4);
tl.fromTo(".du .nm, .du .rl", { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.08 }, 5.6);

// i3 — faces river
tl.fromTo("#row-0", { x: 0 }, { x: -${rsz * 3}, duration: 3, ease: "none" }, 7.6);
tl.fromTo("#row-1", { x: -${rsz * 4} }, { x: -${rsz}, duration: 3, ease: "none" }, 7.6);
tl.fromTo("#row-2", { x: -${rsz} }, { x: -${rsz * 4}, duration: 3, ease: "none" }, 7.6);
tl.fromTo("#i3-k", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 7.7);
tl.fromTo("#i3-big", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "steps(16)" }, 7.8);
tl.fromTo("#i3-sub", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, 8.5);
${end.script}`;
  return doc(f, `invite-${P ? "9x16" : "16x9"}`, 15, style, bodyFixed, script, "assets/audio/invite.mp3");
}

// ---------------------------------------------------------------- 3) site tour

function tour(f) {
  const P = f.port;
  const end = endCard(f, 11.2, 3.8, "tudo isso em 14.11 · são paulo");
  // portrait: the screen crops the desktop page and pans across it (x in source px)
  const shots = [
    { id: "t1", img: "scroll-000.png", k: "01 / 04", cap: "Keep getting better", o: "30% 40%", x: [380, 600] },
    { id: "t2", img: "scroll-016.png", k: "02 / 04", cap: "300 vagas. apenas.", o: "50% 80%", x: [400, 740] },
    { id: "t3", img: "scroll-032.png", k: "03 / 04", cap: "Quem vai", o: "35% 60%", x: [640, 380] },
    { id: "t4", img: "scroll-024.png", k: "04 / 04", cap: "Garanta seu lugar", o: "55% 45%", x: [380, 740] },
  ];
  const dur = 2.8;
  const scrH = P ? 1160 : 788;
  const scrW = P ? 880 : 1400;
  const sc = P ? scrH / 1080 : scrW / 1920;

  const body =
    shots
      .map(
        (s, i) => `
<section id="${s.id}" class="scene clip" data-start="${i * dur}" data-duration="${dur}" data-track-index="1" style="--star:${RULE}">
  <div class="bg-paper"></div>
  ${construct(f, { rows: P ? [250, 1660] : [] })}
  <div class="caps">
    <span class="ck" id="${s.id}-k">${s.k}</span>
    <span class="cap b up">${typed(s.id + "-c", s.cap)}</span>
  </div>
  <div class="browser" id="${s.id}-b">
    <div class="chrome"><img class="logo" src="assets/logo/select-ink.svg" alt="" /><span>${SITE}</span><i></i></div>
    <div class="screen"><img id="${s.id}-img" class="shot" src="assets/site/${s.img}" alt="" style="transform-origin:${s.o}" /></div>
  </div>
  <div class="grain"></div>
</section>`,
      )
      .join("") + end.html;

  const style = `
.caps{position:absolute;left:${f.colL + 40}px;right:${f.w - f.colR + 40}px;top:${P ? 300 : 52}px;display:flex;${P ? "flex-direction:column;gap:14px" : "align-items:baseline;gap:30px"}}
.ck{font-size:${P ? 28 : 22}px;color:${MUTE}}
.cap{font-size:${P ? 76 : 58}px;line-height:1}
.browser{position:absolute;left:${(f.w - scrW) / 2 - 1}px;top:${P ? 480 : 168}px;border:1px solid ${INK};background:${INK}}
.chrome{height:${P ? 60 : 44}px;display:flex;align-items:center;gap:18px;padding:0 18px;background:${PAPER};border-bottom:1px solid ${INK};font-size:${P ? 24 : 18}px}
.chrome .logo{width:${P ? 110 : 84}px}
.chrome span{flex:1;text-align:center;color:${MUTE}}
.chrome i{display:block;width:${P ? 110 : 84}px}
.screen{position:relative;overflow:hidden;width:${scrW}px;height:${scrH}px;background:${PAPER}}
.shot{position:absolute;left:0;top:0;display:block;width:${Math.round(1920 * sc)}px;height:${Math.round(1080 * sc)}px}
${end.style}`;

  const script =
    shots
      .map((s, i) => {
        const t0 = i * dur;
        const cps = 30;
        const move = P
          ? `tl.fromTo("#${s.id}-img", { x: ${-Math.round(s.x[0] * sc)} }, { x: ${-Math.round(s.x[1] * sc)}, duration: ${dur}, ease: "power1.inOut" }, ${t0});`
          : `tl.fromTo("#${s.id}-img", { scale: 1.0 }, { scale: 1.16, duration: ${dur}, ease: "power1.inOut" }, ${t0});`;
        return `
${i === 0 ? `draw("#${s.id}", 0);` : ""}
tl.fromTo("#${s.id}-b", { y: ${P ? 80 : 60}, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, ${t0 + 0.02});
tl.fromTo("#${s.id}-k", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${t0 + 0.05});
type("#${s.id}-c", ${s.cap.length}, ${t0 + 0.1}, ${cps}, true);
blink("#${s.id}-c-c", ${t0 + 0.1 + s.cap.length / cps + 0.25}, ${t0 + dur});
${move}`;
      })
      .join("") + end.script;

  return doc(f, `tour-${P ? "9x16" : "16x9"}`, 15, style, body, script, "assets/audio/tour.mp3");
}

mkdirSync("compositions", { recursive: true });
for (const [key, f] of Object.entries(FORMATS)) {
  writeFileSync(`compositions/hype-${key}.html`, hype(f));
  writeFileSync(`compositions/invite-${key}.html`, invite(f));
  writeFileSync(`compositions/tour-${key}.html`, tour(f));
}
console.log("built 6 compositions");
