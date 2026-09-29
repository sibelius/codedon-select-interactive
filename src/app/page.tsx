import Program from "@/components/Program";
import { CouponTicket } from "@/components/Coupon";
import { Countdown } from "@/components/Countdown";
import { Terminal } from "@/components/Terminal";
import { PaletteButton } from "@/components/CommandPalette";
import {
  CHECKOUT_URL,
  COUPON,
  CURRENT_LOT,
  EVENT_START,
  FAQ,
  FORMATS,
  LOTS,
  OFFICIAL_URL,
  brl,
  sessions,
  speakers,
  withCoupon,
} from "@/lib/event";

const talks = sessions.filter((s) => s.type !== "Intervalo" && s.type !== "Abertura");
const companies = Array.from(new Set(speakers.map((s) => s.company).filter(Boolean)));
const formatCounts = talks.reduce<Record<string, number>>((acc, s) => {
  acc[s.type] = (acc[s.type] ?? 0) + 1;
  return acc;
}, {});


const PROMOS = [
  { src: "/promo/sibelius-feed.jpg", alt: "sseraphini, CTO @ Woovi" },
  { src: "/promo/thuran-feed.jpg", alt: "Thuran" },
  { src: "/promo/rosicleia-stories.jpg", alt: "Rosicléia Frasson" },
  { src: "/promo/sibelius-stories.jpg", alt: "sseraphini" },
  { src: "/promo/thuran-stories.jpg", alt: "Thuran" },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${className}`}>
      select
      <span className="ml-0.5 text-pink" aria-hidden>
        {"//"}
      </span>
    </span>
  );
}

export default function Home() {
  const discounted = withCoupon(CURRENT_LOT.price);
  const next = LOTS[3];

  return (
    <main className="pb-24">
      {/* ============ NAV ============ */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-paper/10 bg-ink/90 text-paper backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <Logo className="text-2xl" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 sm:inline">
              experience 26
            </span>
          </a>
          <div className="flex items-center gap-5 font-mono text-xs uppercase">
            <PaletteButton />
            <a href="#programacao" className="hidden hover:text-pink sm:inline">
              programação
            </a>
            <a href="#palestrantes" className="hidden hover:text-pink sm:inline">
              palestrantes
            </a>
            <a href="#ingresso" className="hidden hover:text-pink md:inline">
              ingresso
            </a>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener"
              className="rounded-full bg-pink px-4 py-2 font-bold text-white hover:bg-pink-2"
            >
              20% off →
            </a>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="grain relative overflow-hidden bg-ink pt-16 text-paper">
        <div className="pointer-events-none absolute -right-40 top-10 h-[36rem] w-[36rem] rounded-full bg-pink/25 blur-[120px]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-paper/60">
              presencial · 14 de novembro · 9h às 19h · são paulo
            </p>
            <h1 className="mt-5 text-6xl font-bold leading-[0.9] tracking-tighter sm:text-8xl lg:text-[8.5rem]">
              Keep
              <br />
              Getting
              <br />
              <span className="text-pink">Better</span>
              <span className="caret text-pink">_</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-paper/75">
              O encontro anual dos devs que chegaram longe e não têm intenção de parar. Formato{" "}
              <b className="text-paper">talkless</b>: sem palco central, sem plateia calada.
            </p>
            <div className="mt-8">
              <Countdown target={EVENT_START.toISOString()} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-pink px-7 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_0_#9c1d5a] transition hover:-translate-y-0.5 hover:bg-pink-2 active:translate-y-1 active:shadow-none"
              >
                garantir vaga por {brl(discounted)} →
              </a>
              <a
                href="#programacao"
                className="rounded-full border-2 border-paper/30 px-7 py-4 font-mono text-sm font-bold uppercase tracking-wider hover:border-paper"
              >
                explorar programação
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-end gap-4">
            <Terminal />
            <div className="grid grid-cols-2 gap-3">
              {[
                ["300", "vagas. apenas."],
                [`${speakers.length}`, "palestrantes reconhecidos"],
                [`${talks.length}`, "sessões pra montar sua jornada"],
                ["5", "salas simultâneas"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl border border-paper/10 bg-paper/5 p-4">
                  <p className="font-mono text-4xl font-bold sm:text-5xl">{n}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-paper/60">{l}</p>
                </div>
              ))}
            </div>
            <CouponTicket dark />
          </div>
        </div>

        {/* marquee of speakers */}
        <div className="relative overflow-hidden border-y border-paper/10 py-4">
          <div className="marquee flex w-max gap-8">
            {[...speakers, ...speakers].map((s, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" className="h-8 w-8 rounded-full object-cover grayscale" loading="lazy" />
                <span className="font-mono text-sm uppercase">{s.name}</span>
                {s.company && <span className="font-mono text-xs text-paper/40">@{s.company}</span>}
                <span className="text-pink">{"//"}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY / FORMATS ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// por que ir"}</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              A maioria dos eventos foi feita pra quem está chegando.
            </h2>
            <p className="mt-4 text-xl text-mute">
              A Select foi feita pra quem <b className="text-ink">já chegou</b>. E sabe que estagnação não avisa quando
              aparece.
            </p>
            <p className="mt-4 text-mute">
              Quem está na sala tem tanto a contribuir quanto quem está na frente. Se você precisou pensar se isso é pra
              você, provavelmente é.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(formatCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => {
                const f = FORMATS[t];
                return (
                  <div
                    key={t}
                    className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050707]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl transition group-hover:scale-125">{f?.emoji}</span>
                      <span className="font-mono text-xs text-mute">
                        {n}× no dia
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-sm font-bold uppercase" style={{ color: f?.color }}>
                      {t}
                    </p>
                    <p className="mt-1 text-sm text-mute">{f?.blurb}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <Program />

      {/* ============ PROMO GALLERY ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// presença confirmada"}</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Te vejo lá?</h2>
        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {PROMOS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="h-[26rem] w-auto shrink-0 snap-start rounded-2xl object-cover shadow-lg transition hover:-rotate-1 hover:scale-[1.02]"
            />
          ))}
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="ingresso" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="grain relative overflow-hidden rounded-[2rem] bg-ink p-6 text-paper sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-pink/30 blur-[100px]" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// ingresso"}</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Poucas vagas. <br />
                Preço sobe em breve.
              </h2>
              <p className="mt-4 text-paper/70">
                O lote atual vira em{" "}
                <b className="text-pink">
                  <Countdown target={CURRENT_LOT.until.toISOString()} compact />
                </b>
                . Depois disso: {brl(next.price)}.
              </p>
              <ul className="mt-6 space-y-2 font-mono text-sm text-paper/80">
                <li>✓ todas as {talks.length} sessões, 5 salas</li>
                <li>✓ almoço + coffee break + happy hour</li>
                <li>✓ {companies.length}+ empresas representadas na conversa</li>
                <li>✓ curadoria de participantes: só gente sênior+</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-paper p-6 text-ink">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-mute">lote atual · até 30/09</span>
                  <span className="rounded-full bg-pink px-3 py-1 font-mono text-[11px] font-bold text-white">
                    -20%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-mono text-lg text-mute line-through">{brl(CURRENT_LOT.price)}</span>
                  <span className="font-mono text-5xl font-bold tracking-tight sm:text-6xl">{brl(discounted)}</span>
                </div>
                <p className="mt-1 text-sm text-mute">
                  Você economiza <b className="text-pink">{brl(CURRENT_LOT.price - discounted)}</b> com o cupom{" "}
                  <span className="font-mono font-bold text-ink">{COUPON}</span>
                </p>
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 block rounded-full bg-pink py-4 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_0_#9c1d5a] transition hover:-translate-y-0.5 hover:bg-pink-2 active:translate-y-1 active:shadow-none"
                >
                  quero participar →
                </a>
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {LOTS.map((l) => (
                  <div
                    key={l.label}
                    className={`rounded-xl border p-2.5 ${
                      l.status === "atual" ? "border-pink bg-pink/10" : "border-paper/10"
                    } ${l.status === "esgotado" ? "opacity-50" : ""}`}
                  >
                    <p className="text-[10px] uppercase text-paper/60">{l.label}</p>
                    <p className={`font-bold ${l.status === "esgotado" ? "line-through" : ""}`}>{brl(l.price)}</p>
                    <p className="text-[10px] text-paper/50">
                      {l.status === "esgotado" ? "esgotado" : l.status === "atual" ? "agora" : `${brl(withCoupon(l.price))} c/ cupom`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto max-w-3xl px-4 pt-24 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// faq"}</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map(([qq, a], i) => (
            <details key={qq} id={`faq-${i}`} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {qq}
                <span className="font-mono text-pink transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-mute">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-3xl px-4 pt-20 text-center sm:px-6">
        <p className="text-3xl font-bold tracking-tight sm:text-4xl">
          Feito pra quem já chegou longe.
          <br />
          <span className="text-pink">E não considera isso o suficiente.</span>
        </p>
        <div className="mt-8 text-left">
          <CouponTicket />
        </div>
      </section>

      <footer className="mx-auto mt-20 max-w-7xl px-4 pb-6 font-mono text-xs text-mute sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <span>
            Página de divulgação feita por um palestrante. Evento oficial e ingressos em{" "}
            <a href={OFFICIAL_URL} target="_blank" rel="noopener" className="underline hover:text-ink">
              codecon.dev/select
            </a>
            .
          </span>
          <span>
            <Logo className="text-base text-ink" /> experience 26 · keep getting better
          </span>
        </div>
      </footer>

      {/* ============ STICKY BAR ============ */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-paper/10 bg-ink/95 text-paper backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-xs sm:text-sm">
            <span className="hidden sm:inline">14/11 · SP · </span>
            <span className="font-mono font-bold text-pink">{COUPON}</span> = 20% off ·{" "}
            <span className="text-paper/60 line-through">{brl(CURRENT_LOT.price)}</span>{" "}
            <b>{brl(discounted)}</b>
          </p>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener"
            className="shrink-0 rounded-full bg-pink px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-pink-2"
          >
            comprar →
          </a>
        </div>
      </div>
    </main>
  );
}
