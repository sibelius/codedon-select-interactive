// Generates the six standalone compositions (3 angles × 9:16 / 16:9) from shared scene code.
// Run: node build.mjs  → compositions/<angle>-<aspect>.html
import { mkdirSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const FORMATS = {
  "9x16": { w: 1080, h: 1920, port: true },
  "16x9": { w: 1920, h: 1080, port: false },
};

const COUPON = "PALESTRANTE20";
const PRICE = "R$ 1.290";
const PRICE_OFF = "R$ 1.032";
const URL = "select-experience-26.vercel.app";

const ALL_FACES = readdirSync("assets/speakers")
  .map((f) => f.replace(".jpg", ""))
  .filter((id) => id !== "bu-kinoshita");
// sseraphini first so the pink-ringed tile is always present
const FACES = ["sseraphini", ...ALL_FACES.filter((f) => f !== "sseraphini")];

const SESSIONS = [
  ["09:30", "FISHBOWL", "#2f80ed", "o futuro das IDEs"],
  ["10:30", "KATA", "#00a3a3", "modelando o Pix"],
  ["11:30", "ROUNDTABLE", "#f2994a", "métrica ou vigilância?"],
  ["14:30", "MENTORIA", "#27ae60", "o dia a dia de um principal engineer"],
  ["15:30", "FISHBOWL", "#2f80ed", "build vs. buy vs. wrap-an-LLM"],
  ["17:00", "AMA", "#9b51e0", "ask me anything: felipe ribeiro"],
  ["18:00", "LIÇÕES", "#c9a227", "construindo a Resend"],
];

// ---------------------------------------------------------------- shared

const css = (f) => `
@font-face{font-family:"DM Sans";font-weight:400;src:url("assets/fonts/DMSans-Regular.woff") format("woff")}
@font-face{font-family:"DM Sans";font-weight:700;src:url("assets/fonts/DMSans-Bold.woff") format("woff")}
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/SpaceMono-Regular.woff") format("woff")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/SpaceMono-Bold.woff") format("woff")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${f.w}px;height:${f.h}px;overflow:hidden;background:#050707}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:#050707;color:#f0efee;font-family:"DM Sans",sans-serif}
.scene{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}
.bg{position:absolute;inset:0;background:#050707}
.bg-pink{position:absolute;inset:0;background:#e73288}
.glow{position:absolute;width:${f.port ? 1400 : 1300}px;height:${f.port ? 1400 : 1300}px;border-radius:50%;
  background:radial-gradient(circle,rgba(231,50,136,.42),rgba(231,50,136,0) 65%);right:${f.port ? -600 : -420}px;top:${f.port ? -420 : -520}px}
.grain{position:absolute;inset:0;opacity:.16;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.mono{font-family:"Space Mono",monospace}
.label{font-family:"Space Mono",monospace;text-transform:uppercase;letter-spacing:.2em;font-size:${f.port ? 30 : 24}px;color:rgba(240,239,238,.6)}
.pink{color:#e73288}
.logo{font-weight:700;font-size:${f.port ? 64 : 52}px;letter-spacing:-.02em;display:flex;align-items:baseline;gap:4px}
.logo b{color:#e73288}
.mask{display:block;overflow:hidden;padding-bottom:.06em}
.mask > span{display:block}
.chip{display:inline-block;background:#e73288;color:#fff;font-family:"Space Mono",monospace;font-weight:700;
  border-radius:999px;padding:${f.port ? "18px 34px" : "14px 28px"};font-size:${f.port ? 36 : 30}px}
.face{display:block;object-fit:cover;border-radius:${f.port ? 26 : 22}px;filter:grayscale(1) contrast(1.05);border:3px solid rgba(240,239,238,.08)}
.face.me{filter:none;border:6px solid #e73288}
`;

function doc(f, id, duration, style, body, script) {
  const track = `assets/audio/${id.split("-")[0]}.mp3`;
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
${script}
window.__timelines["${id}"] = tl;
</script>
</body>
</html>
`;
}

// End card: coupon ticket, strike-through price, URL. Shared by all three angles.
function endCard(f, start, dur, kicker) {
  const s = start;
  const html = `
<section id="end" class="scene clip" data-start="${s}" data-duration="${dur}" data-track-index="1">
  <div class="bg-pink" id="end-bg"></div>
  <div class="grain"></div>
  ${f.port ? "" : `<div class="end-faces" id="end-faces">${["sseraphini","mario-souto","erick-wendel","elemar-junior","waldemar-neto","rafael-dohms","felipe-ribeiro","marcela-godoy","juliano-martins"].map((id) => `<img class="face${id === "sseraphini" ? " me" : ""} ef" src="assets/speakers/${id}.jpg" alt="" />`).join("")}</div>`}
  <div id="end-in" class="end-in">
    <div class="label end-kicker" id="end-kicker">${kicker}</div>
    <div class="ticket" id="ticket">
      <div class="ticket-code mono" id="ticket-code">${COUPON}</div>
      <div class="ticket-sub mono" id="ticket-sub">20% OFF · CUPOM DE PALESTRANTE</div>
    </div>
    <div class="prices">
      <span class="old mono" id="old">${PRICE}<i id="strike"></i></span>
      <span class="new mono" id="new">${PRICE_OFF}</span>
    </div>
    <div class="end-meta">
      <div class="logo end-logo" id="end-logo">select<b>//</b><span class="mono end-exp">EXPERIENCE 26</span></div>
      <div class="mono end-url" id="end-url">14.11 · SÃO PAULO · ${URL}</div>
    </div>
  </div>
</section>`;
  const style = `
.end-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:${f.port ? "center" : "flex-start"};justify-content:center;
  gap:${f.port ? 56 : 34}px;padding:${f.port ? "0 70px" : "0 140px"};color:#fff;text-align:${f.port ? "center" : "left"}}
.end-kicker{color:#fff;opacity:.9;font-size:${f.port ? 34 : 28}px}
.ticket{border:5px dashed rgba(5,7,7,.85);border-radius:36px;padding:${f.port ? "48px 40px" : "40px 64px"};background:rgba(5,7,7,.12)}
.ticket-code{font-weight:700;font-size:${f.port ? 112 : 112}px;letter-spacing:.04em;line-height:1;color:#fff;
  clip-path:inset(0 100% 0 0)}
.ticket-sub{margin-top:18px;font-size:${f.port ? 30 : 30}px;letter-spacing:.14em;color:#050707;font-weight:700}
.prices{display:flex;align-items:baseline;gap:32px}
.old{position:relative;font-size:${f.port ? 56 : 58}px;color:rgba(5,7,7,.72)}
.old i{position:absolute;left:-6px;right:-6px;top:52%;height:7px;background:#050707;display:block;transform-origin:left center}
.new{font-weight:700;font-size:${f.port ? 128 : 132}px;line-height:1;color:#050707}
.end-meta{display:flex;flex-direction:column;align-items:${f.port ? "center" : "flex-start"};gap:14px;margin-top:${f.port ? 30 : 6}px}
.end-logo{color:#050707}
.end-logo b{color:#fff}
.end-exp{font-size:${f.port ? 24 : 20}px;letter-spacing:.3em;margin-left:14px;color:rgba(5,7,7,.7)}
.end-faces{position:absolute;right:110px;top:50%;margin-top:-270px;display:grid;grid-template-columns:repeat(3,160px);gap:22px;transform:rotate(4deg)}
.end-faces .face{width:160px;height:160px;border-color:rgba(5,7,7,.25);filter:grayscale(1) contrast(1.1)}
.end-faces .face.me{filter:none;border:6px solid #050707}
.end-url{white-space:nowrap;font-size:${f.port ? 26 : 28}px;color:#050707;letter-spacing:.06em}
`;
  const script = `
tl.fromTo("#end-bg", { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "power4.out" }, ${s});
if (!P) gsap.utils.toArray(".ef").forEach((el, i) => tl.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${s} + 0.5 + i * 0.07));
tl.fromTo("#end-kicker", { opacity: 0, y: 20 }, { opacity: 0.9, y: 0, duration: 0.35 }, ${s + 0.3});
tl.fromTo("#ticket", { scale: 0.85, opacity: 0, rotation: -3 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, ${s + 0.35});
tl.to("#ticket-code", { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "steps(13)" }, ${s + 0.6});
tl.fromTo("#ticket-sub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${s + 1.3});
tl.fromTo("#old", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, ${s + 1.5});
tl.fromTo("#strike", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, ${s + 1.85});
tl.fromTo("#new", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.5)" }, ${s + 2.1});
tl.fromTo("#end-logo", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, ${s + 2.5});
tl.fromTo("#end-url", { opacity: 0 }, { opacity: 1, duration: 0.35 }, ${s + 2.7});
tl.to("#ticket", { scale: 1.04, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, ${s + 3.1});
`;
  return { html, style, script };
}

// ---------------------------------------------------------------- 1) hype

function hype(f) {
  const cols = f.port ? 5 : 9;
  const rows = f.port ? 6 : 3;
  const size = f.port ? 186 : 186;
  const faces = FACES.slice(0, cols * rows);
  const lines = SESSIONS.map(
    ([t, tag, c, title], i) =>
      `<div class="tline" id="tl-${i}"><span class="tt mono">${t}</span><span class="tag mono" style="color:${c}">${tag}</span><span class="ttl">${title}</span></div>`,
  ).join("");

  const end = endCard(f, 11.5, 3.5, "garanta seu lugar com 20% off");

  const body = `
<section id="s1" class="scene clip" data-start="0" data-duration="3.1" data-track-index="1">
  <div class="bg"></div><div class="glow" id="s1-glow"></div><div class="grain"></div>
  <div class="s1-in">
    <div class="label" id="s1-label">select experience 26 · 14.11 · SP</div>
    <h1 class="big">
      <span class="mask"><span id="w1">keep</span></span>
      <span class="mask"><span id="w2">getting</span></span>
      <span class="mask"><span id="w3" class="pink">better<em id="cursor">_</em></span></span>
    </h1>
  </div>
</section>

<section id="s2" class="scene clip" data-start="3.1" data-duration="3.5" data-track-index="1">
  <div class="bg"></div><div class="grain"></div>
  <div class="grid" id="grid">
    ${faces.map((id, i) => `<img class="face${id === "sseraphini" ? " me" : ""} gface" id="gf-${i}" src="assets/speakers/${id}.jpg" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px" />`).join("")}
  </div>
  <div class="s2-over" id="s2-over">
    <div class="count mono"><span id="count">0</span></div>
    <div class="count-l">palestrantes que <span class="pink">já chegaram lá</span></div>
    <div class="label cos" id="cos">nubank · google · ifood · mercado livre · oracle · picpay · quintoandar</div>
  </div>
</section>

<section id="s3" class="scene clip" data-start="6.6" data-duration="3.0" data-track-index="1">
  <div class="bg"></div><div class="glow"></div><div class="grain"></div>
  <div class="s3-in">
    <div class="s3-head">
      <div class="label">formato</div>
      <div class="talk" id="talk">talkless<span class="pink">_</span></div>
      <div class="talk-sub" id="talk-sub">sem palco. sem plateia calada.</div>
    </div>
    <div class="term" id="term">
      <div class="term-bar"><i></i><i></i><i></i><span class="mono">tail -f programacao.log</span></div>
      <div class="term-body">${lines}</div>
    </div>
  </div>
</section>

<section id="s4" class="scene clip" data-start="9.6" data-duration="1.9" data-track-index="1">
  <div class="bg"></div><div class="grain"></div>
  <div class="s4-in">
    <div class="stat mono" id="stat">300</div>
    <div class="stat-l" id="stat-l">vagas. <span class="pink">apenas.</span></div>
    <div class="label stat-m" id="stat-m">5 salas · 30 sessões · 1 dia</div>
  </div>
</section>
${end.html}`;

  const style = `
.s1-in{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${f.port ? "0 80px" : "0 150px"};gap:${f.port ? 50 : 36}px}
.big{font-weight:700;font-size:${f.port ? 250 : 250}px;line-height:.9;letter-spacing:-.05em}
.big em{font-style:normal;display:inline-block}
.grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(${cols},${size}px);grid-auto-rows:${size}px;gap:${f.port ? 22 : 20}px;
  justify-content:center;align-content:center}
.s2-over{position:absolute;left:0;right:0;bottom:0;padding:${f.port ? "90px 70px 110px" : "60px 150px 70px"};
  background:linear-gradient(to top,#050707 55%,rgba(5,7,7,0));display:flex;flex-direction:column;gap:12px}
.count{font-weight:700;font-size:${f.port ? 230 : 200}px;line-height:.9;color:#e73288}
.count-l{font-weight:700;font-size:${f.port ? 72 : 64}px;letter-spacing:-.03em}
.cos{margin-top:14px;white-space:nowrap}
.s3-in{position:absolute;inset:0;display:flex;flex-direction:${f.port ? "column" : "row"};align-items:${f.port ? "stretch" : "center"};
  justify-content:center;gap:${f.port ? 70 : 90}px;padding:${f.port ? "0 64px" : "0 130px"}}
.s3-head{display:flex;flex-direction:column;gap:18px;${f.port ? "" : "width:560px;flex-shrink:0"}}
.talk{font-weight:700;font-size:${f.port ? 170 : 150}px;letter-spacing:-.05em;line-height:.95}
.talk-sub{font-size:${f.port ? 54 : 46}px;color:rgba(240,239,238,.75)}
.term{${f.port ? "" : "flex:1;"}border:2px solid rgba(240,239,238,.12);border-radius:28px;background:rgba(0,0,0,.55);overflow:hidden}
.term-bar{display:flex;align-items:center;gap:12px;padding:22px 28px;border-bottom:2px solid rgba(240,239,238,.1)}
.term-bar i{display:block;width:18px;height:18px;border-radius:50%;background:#ff5f57}
.term-bar i:nth-child(2){background:#febc2e}.term-bar i:nth-child(3){background:#28c840}
.term-bar span{margin-left:14px;font-size:24px;color:rgba(240,239,238,.4)}
.term-body{padding:28px 30px;display:flex;flex-direction:column;gap:${f.port ? 26 : 18}px}
.tline{display:flex;align-items:baseline;gap:20px;font-size:${f.port ? 44 : 40}px;white-space:nowrap}
.tt{color:rgba(240,239,238,.45);font-size:.8em}
.tag{font-weight:700;font-size:.7em;letter-spacing:.08em;min-width:${f.port ? 190 : 170}px}
.ttl{font-weight:700;overflow:hidden;text-overflow:ellipsis}
.s4-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px}
.stat{font-weight:700;font-size:${f.port ? 440 : 400}px;line-height:.85;letter-spacing:-.04em}
.stat-l{font-weight:700;font-size:${f.port ? 110 : 96}px;letter-spacing:-.04em}
.stat-m{margin-top:30px}
${end.style}`;

  const script = `
// s1 — type slam
tl.fromTo("#s1-label", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 0.05);
["#w1", "#w2", "#w3"].forEach((w, i) => tl.fromTo(w, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power4.out" }, 0.2 + i * 0.4));
tl.fromTo("#cursor", { opacity: 1 }, { opacity: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.24 }, 1.3);
tl.fromTo("#s1-glow", { scale: 0.7, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 3, ease: "sine.out" }, 0);
tl.to(".s1-in", { scale: 1.06, opacity: 0, duration: 0.3, ease: "power2.in" }, 2.8);

// s2 — faces wall + count-up
const faces = gsap.utils.toArray(".gface");
const cx = ${cols - 1} / 2, cy = ${rows - 1} / 2;
faces.forEach((el, i) => {
  const d = Math.hypot((i % ${cols}) - cx, Math.floor(i / ${cols}) - cy);
  tl.fromTo(el, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, 3.15 + d * 0.09);
});
tl.fromTo("#grid", { scale: 1.12 }, { scale: 1, duration: 3.5, ease: "power1.out" }, 3.1);
tl.fromTo("#s2-over", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 3.7);
const counter = { v: 0 };
tl.to(counter, { v: 40, duration: 1.2, ease: "power2.out", onUpdate: () => { document.getElementById("count").textContent = Math.round(counter.v); } }, 3.8);
tl.fromTo("#cos", { x: 0 }, { x: P ? -520 : -200, duration: 2.6, ease: "none" }, 4.0);

// s3 — talkless + terminal lines
tl.fromTo("#talk", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, 6.65);
tl.fromTo("#talk-sub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 6.95);
tl.fromTo("#term", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 6.8);
gsap.utils.toArray(".tline").forEach((el, i) => {
  tl.fromTo(el, { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.28, ease: "steps(10)" }, 7.05 + i * 0.24);
});

// s4 — stat slam
tl.fromTo("#stat", { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" }, 9.62);
tl.fromTo("#stat-l", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 9.9);
tl.fromTo("#stat-m", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 10.2);
${end.script}`;
  return doc(f, `hype-${f.port ? "9x16" : "16x9"}`, 15, style, body, script);
}

// ---------------------------------------------------------------- 2) invite

function invite(f) {
  const end = endCard(f, 10.5, 4.5, "vem comigo · use meu cupom");
  const card = f.port ? "sibelius-stories.jpg" : "sibelius-feed.jpg";
  const rowFaces = FACES.filter((x) => x !== "sseraphini");
  const rows = [0, 1, 2].map((r) => rowFaces.filter((_, i) => i % 3 === r));
  const fsz = f.port ? 230 : 200;

  const body = `
<section id="i1" class="scene clip" data-start="0" data-duration="3.6" data-track-index="1">
  <div class="bg"></div><div class="glow"></div><div class="grain"></div>
  <div class="i1-in">
    <img id="card" class="card" src="assets/promo/${card}" alt="sseraphini — presença confirmada" />
    <div class="i1-txt">
      <div class="label" id="i1-label">cto @ woovi · palestrante</div>
      <div class="say" id="say1">eu vou estar</div>
      <div class="say pink" id="say2">na select_</div>
    </div>
  </div>
</section>

<section id="i2" class="scene clip" data-start="3.6" data-duration="3.9" data-track-index="1">
  <div class="bg"></div><div class="grain"></div>
  <div class="i2-in">
    <div class="meta mono" id="meta"><span class="blue">🐟 FISHBOWL</span> · STUDIO · 15:30</div>
    <h2 class="stitle" id="stitle">
      <span class="mask"><span id="t1">build vs. buy</span></span>
      <span class="mask"><span id="t2">vs. <span class="pink">wrap-an-LLM</span></span></span>
    </h2>
    <div class="sdesc" id="sdesc">onde vale investir engenharia própria, e onde faz mais sentido aproveitar o que já existe.</div>
    <div class="duo">
      <div class="who" id="who1"><img class="face" src="assets/speakers/juliano-martins.jpg" alt="" /><div><b>Juliano Martins</b><span>GenAI & Eng. Research · Mercado Livre</span></div></div>
      <div class="who" id="who2"><img class="face me" src="assets/speakers/sseraphini.jpg" alt="" /><div><b>sseraphini</b><span>CTO · Woovi</span></div></div>
    </div>
  </div>
</section>

<section id="i3" class="scene clip" data-start="7.5" data-duration="3.0" data-track-index="1">
  <div class="bg"></div><div class="grain"></div>
  <div class="rows" id="rows">
    ${rows.map((r, ri) => `<div class="row" id="row-${ri}">${[...r, ...r].map((id) => `<img class="face" src="assets/speakers/${id}.jpg" alt="" width="${fsz}" height="${fsz}" style="width:${fsz}px;height:${fsz}px" />`).join("")}</div>`).join("")}
  </div>
  <div class="i3-over">
    <div class="i3-big" id="i3-big">+38 pessoas</div>
    <div class="i3-sub" id="i3-sub">de Nubank, Google, iFood, Oracle, Mercado Livre…</div>
  </div>
</section>
${end.html}`;

  const style = `
.i1-in{position:absolute;inset:0;display:flex;flex-direction:${f.port ? "column-reverse" : "row"};align-items:center;justify-content:center;
  gap:${f.port ? 60 : 110}px;padding:${f.port ? "90px 70px" : "0 130px"}}
.card{display:block;${f.port ? "height:1250px;width:auto" : "height:900px;width:auto"};border-radius:32px;box-shadow:0 40px 120px rgba(0,0,0,.6)}
.i1-txt{display:flex;flex-direction:column;gap:16px;${f.port ? "align-items:center;text-align:center" : ""}}
.say{font-weight:700;font-size:${f.port ? 120 : 130}px;letter-spacing:-.05em;line-height:.95}
.i2-in{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:${f.port ? 46 : 34}px;padding:${f.port ? "0 70px" : "0 150px"}}
.meta{font-size:${f.port ? 36 : 32}px;letter-spacing:.1em;color:rgba(240,239,238,.7)}
.blue{color:#5aa2ff;font-weight:700}
.stitle{font-weight:700;font-size:${f.port ? 150 : 150}px;letter-spacing:-.05em;line-height:.95}
.sdesc{font-size:${f.port ? 46 : 42}px;color:rgba(240,239,238,.7);max-width:${f.port ? 940 : 1300}px;line-height:1.3}
.duo{display:flex;flex-direction:${f.port ? "column" : "row"};gap:${f.port ? 28 : 40}px;margin-top:10px}
.who{display:flex;align-items:center;gap:26px;border:2px solid rgba(240,239,238,.14);border-radius:28px;padding:18px 34px 18px 18px;background:rgba(240,239,238,.04)}
.who .face{width:${f.port ? 140 : 120}px;height:${f.port ? 140 : 120}px;filter:none}
.who b{display:block;font-family:"Space Mono",monospace;font-size:${f.port ? 40 : 34}px;text-transform:uppercase}
.who span{display:block;font-size:${f.port ? 30 : 26}px;color:rgba(240,239,238,.6)}
.rows{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:24px;transform:rotate(-6deg) scale(1.2)}
.row{display:flex;gap:24px;width:max-content}
.i3-over{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:20px;
  background:radial-gradient(ellipse at center,rgba(5,7,7,.92) 30%,rgba(5,7,7,.35) 75%);padding:0 60px}
.i3-big{font-weight:700;font-size:${f.port ? 190 : 200}px;letter-spacing:-.05em;line-height:.9}
.i3-sub{font-size:${f.port ? 48 : 46}px;color:rgba(240,239,238,.8);max-width:${f.port ? 900 : 1400}px}
${end.style}`;

  const script = `
// i1 — promo card + "eu vou estar na select"
tl.fromTo("#card", { scale: 1.15, rotation: P ? 0 : -4, opacity: 0 }, { scale: 1, rotation: P ? 0 : -2, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.05);
tl.to("#card", { rotation: 0, scale: 1.03, duration: 2.8, ease: "sine.inOut" }, 0.75);
tl.fromTo("#i1-label", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.5);
tl.fromTo("#say1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.7);
tl.fromTo("#say2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.05);

// i2 — the session
tl.fromTo("#meta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 3.65);
tl.fromTo("#t1", { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power4.out" }, 3.8);
tl.fromTo("#t2", { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power4.out" }, 4.1);
tl.fromTo("#sdesc", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 4.6);
tl.fromTo("#who1", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, 5.1);
tl.fromTo("#who2", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, 5.35);
tl.to("#who2", { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1 }, 6.2);

// i3 — faces river
tl.fromTo("#row-0", { x: 0 }, { x: -900, duration: 3, ease: "none" }, 7.5);
tl.fromTo("#row-1", { x: -1200 }, { x: -300, duration: 3, ease: "none" }, 7.5);
tl.fromTo("#row-2", { x: -200 }, { x: -1100, duration: 3, ease: "none" }, 7.5);
tl.fromTo("#i3-big", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 7.7);
tl.fromTo("#i3-sub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 8.1);
${end.script}`;
  return doc(f, `invite-${f.port ? "9x16" : "16x9"}`, 15, style, body, script);
}

// ---------------------------------------------------------------- 3) site tour

function tour(f) {
  const t = f.port ? "port" : "land";
  const end = endCard(f, 11.2, 3.8, "tudo isso te esperando em 14.11");
  const shots = [
    { id: "t1", start: 0, dur: 2.8, origin: "25% 35%", img: `${t}-01-hero.png`, cap: "a programação inteira da select", cap2: "interativa_" },
    { id: "t2", start: 2.8, dur: 2.8, origin: "50% 30%", img: `${t}-02-palette.png`, cap: "⌘K busca tudo", cap2: "sessões, pessoas, empresas" },
    { id: "t3", start: 5.6, dur: 2.8, origin: "35% 55%", img: `${t}-03-schedule.png`, cap: "5 salas simultâneas", cap2: "filtre por tema" },
    { id: "t4", start: 8.4, dur: 2.8, origin: "100% 25%", img: `${t}-05-agenda.png`, cap: "★ monte sua jornada", cap2: "e a gente avisa conflito" },
  ];
  const body =
    shots
      .map(
        (s) => `
<section id="${s.id}" class="scene clip" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1">
  <div class="bg"></div><div class="glow"></div><div class="grain"></div>
  <div class="tour-in">
    <div class="caps">
      <div class="cap" id="${s.id}-cap">${s.cap}</div>
      <div class="cap2 mono" id="${s.id}-cap2">${s.cap2}</div>
    </div>
    <div class="device" id="${s.id}-dev">
      ${f.port ? "" : `<div class="chrome"><i></i><i></i><i></i><span class="mono">${URL}</span></div>`}
      <div class="screen"><img id="${s.id}-img" style="transform-origin:${s.origin}" class="shot" src="assets/site/${s.img}" alt="" /></div>
    </div>
  </div>
</section>`,
      )
      .join("") + end.html;

  const style = `
.tour-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:${f.port ? "flex-start" : "center"};
  gap:${f.port ? 50 : 34}px;padding:${f.port ? "120px 60px 0" : "40px 0 0"}}
.caps{display:flex;flex-direction:${f.port ? "column" : "row"};align-items:${f.port ? "center" : "baseline"};gap:${f.port ? 10 : 28}px;text-align:center}
.cap{font-weight:700;font-size:${f.port ? 84 : 72}px;letter-spacing:-.04em;line-height:1}
.cap2{font-size:${f.port ? 36 : 34}px;color:#e73288}
.device{border-radius:${f.port ? 56 : 22}px;overflow:hidden;border:${f.port ? "14px" : "2px"} solid ${f.port ? "#1c1e1e" : "rgba(240,239,238,.16)"};
  box-shadow:0 50px 140px rgba(0,0,0,.7),0 0 0 2px rgba(240,239,238,.08);background:#111}
.chrome{display:flex;align-items:center;gap:10px;height:46px;padding:0 20px;background:#1a1c1c}
.chrome i{display:block;width:14px;height:14px;border-radius:50%;background:#ff5f57}
.chrome i:nth-child(2){background:#febc2e}.chrome i:nth-child(3){background:#28c840}
.chrome span{margin:0 auto;font-size:18px;color:rgba(240,239,238,.5);background:#050707;padding:6px 120px;border-radius:8px}
.screen{overflow:hidden;${f.port ? "width:690px;height:1227px" : "width:1500px;height:844px"}}
.shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
${end.style}`;

  const script =
    shots
      .map(
        (s) => `
tl.fromTo("#${s.id}-dev", { y: ${f.port ? 140 : 90}, opacity: 0.35, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }, ${s.start + 0.02});
tl.fromTo("#${s.id}-img", { scale: ${f.port ? 1 : 1.02} }, { scale: ${f.port ? 1.08 : 1.32}, duration: ${s.dur}, ease: "power1.inOut" }, ${s.start});
tl.fromTo("#${s.id}-cap", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, ${s.start + 0.05});
tl.fromTo("#${s.id}-cap2", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${s.start + 0.45});`,
      )
      .join("") + end.script;

  return doc(f, `tour-${f.port ? "9x16" : "16x9"}`, 15, style, body, script);
}

mkdirSync("compositions", { recursive: true });
for (const [key, f] of Object.entries(FORMATS)) {
  writeFileSync(`compositions/hype-${key}.html`, hype(f));
  writeFileSync(`compositions/invite-${key}.html`, invite(f));
  writeFileSync(`compositions/tour-${key}.html`, tour(f));
}
console.log("built 6 compositions");
