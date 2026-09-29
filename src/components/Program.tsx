"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHECKOUT_URL,
  COUPON,
  FORMATS,
  ROOMS,
  type Session,
  type Speaker,
  normalize,
  overlaps,
  sessionById,
  sessionHaystack,
  sessions,
  speakerById,
  speakers,
} from "@/lib/event";
import { burstConfetti } from "./Coupon";
import { CommandPalette, PALETTE_EVENT, type PaletteAction } from "./CommandPalette";

const STORAGE_KEY = "select26-agenda";
const QUICK = ["IA", "carreira", "arquitetura", "liderança", "produto", "qualidade", "staff", "Pix"];
const TYPES = Array.from(new Set(sessions.filter((s) => s.type !== "Intervalo").map((s) => s.type)));

const haystacks = new Map(sessions.map((s) => [s.id, sessionHaystack(s)]));
const speakerHay = new Map(
  speakers.map((p) => [
    p.id,
    normalize(`${p.name} ${p.role} ${p.company} ${p.sessions.map((id) => sessionById.get(id)?.title ?? "").join(" ")}`),
  ]),
);

function matches(hay: string, q: string) {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  return terms.every((t) => hay.includes(t));
}

function Highlight({ text, q }: { text: string; q: string }) {
  const terms = normalize(q).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return <>{text}</>;
  const norm = normalize(text);
  const marks: [number, number][] = [];
  for (const t of terms) {
    let i = norm.indexOf(t);
    while (i !== -1) {
      marks.push([i, i + t.length]);
      i = norm.indexOf(t, i + t.length);
    }
  }
  if (!marks.length) return <>{text}</>;
  marks.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  marks.forEach(([a, b], k) => {
    if (a < pos) return;
    out.push(text.slice(pos, a));
    out.push(
      <mark key={k} className="rounded bg-pink/20 px-0.5 text-inherit">
        {text.slice(a, b)}
      </mark>,
    );
    pos = b;
  });
  out.push(text.slice(pos));
  return <>{out}</>;
}

function Avatar({ id, size = 40, ring = "ring-paper" }: { id: string; size?: number; ring?: string }) {
  const sp = speakerById.get(id);
  if (!sp) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sp.img}
      alt={sp.name}
      width={size}
      height={size}
      loading="lazy"
      className={`rounded-full object-cover ring-2 ${ring} bg-paper-2`}
      style={{ width: size, height: size }}
    />
  );
}

function TypeTag({ type }: { type: string }) {
  const f = FORMATS[type];
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider"
      style={{ color: f?.color ?? "#e73288" }}
    >
      <span aria-hidden>{f?.emoji}</span>
      {type}
    </span>
  );
}

export default function Program() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [agenda, setAgenda] = useState<string[]>([]);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [openSpeaker, setOpenSpeaker] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // load agenda: shared link wins over local storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("agenda");
    let initial: string[] = [];
    if (shared) {
      initial = shared.split(",").filter((id) => sessionById.has(id));
    } else {
      try {
        initial = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]").filter((id: string) => sessionById.has(id));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgenda(initial);
    if (shared) setToast("Agenda compartilhada carregada ✨");
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash.startsWith("sessao/")) setOpenSession(hash.slice(7));
    if (hash.startsWith("palestrante/")) setOpenSpeaker(hash.slice(12));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agenda));
    } catch {}
  }, [agenda]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // keyboard: "/" or cmd+k focuses search, esc clears
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPalette((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    const onOpen = () => setPalette(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  const setHash = (h: string) => {
    history.replaceState(null, "", h ? `#${h}` : window.location.pathname + window.location.search);
  };

  const showSession = useCallback((id: string | null) => {
    setOpenSpeaker(null);
    setOpenSession(id);
    setHash(id ? `sessao/${id}` : "");
  }, []);
  const showSpeaker = useCallback((id: string | null) => {
    setOpenSession(null);
    setOpenSpeaker(id);
    setHash(id ? `palestrante/${id}` : "");
  }, []);

  const toggle = (id: string) => {
    setAgenda((a) => {
      if (a.includes(id)) return a.filter((x) => x !== id);
      const s = sessionById.get(id)!;
      const clash = a.map((x) => sessionById.get(x)!).find((o) => overlaps(o, s));
      setToast(clash ? `⚠️ Conflita com "${clash.title}"` : "Adicionado à sua jornada ★");
      if (a.length === 0) burstConfetti(30);
      return [...a, id];
    });
  };

  const filtered = useMemo(
    () =>
      sessions.filter((s) => {
        if (onlyMine && !agenda.includes(s.id)) return false;
        const isBreak = s.type === "Intervalo";
        if (type && s.type !== type) return false;
        if (room && s.room !== room && !isBreak) return false;
        if (q && !matches(haystacks.get(s.id)!, q)) return false;
        return true;
      }),
    [q, type, room, onlyMine, agenda],
  );
  const filteredSpeakers = useMemo(
    () => speakers.filter((p) => !q || matches(speakerHay.get(p.id)!, q)),
    [q],
  );

  const slots = useMemo(() => {
    const m = new Map<string, Session[]>();
    for (const s of filtered) m.set(s.start, [...(m.get(s.start) ?? []), s]);
    return Array.from(m.entries());
  }, [filtered]);

  const talkCount = filtered.filter((s) => s.type !== "Intervalo").length;
  const anyFilter = q || type || room || onlyMine;

  const surprise = () => {
    const pool = sessions.filter((s) => s.type !== "Intervalo" && s.speakers.length);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    showSession(pick.id);
  };

  const onPalette = (a: PaletteAction) => {
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    switch (a.kind) {
      case "session":
        return showSession(a.id);
      case "speaker":
        return showSpeaker(a.id);
      case "filter-type":
        setType(a.value);
        setRoom(null);
        return scrollTo("programacao");
      case "filter-room":
        setRoom(a.value);
        setType(null);
        return scrollTo("programacao");
      case "copy-coupon":
        navigator.clipboard?.writeText(COUPON).catch(() => {});
        burstConfetti();
        return setToast(`${COUPON} copiado! 🎉`);
      case "buy":
        return void window.open(CHECKOUT_URL, "_blank", "noopener");
      case "surprise":
        return surprise();
      case "agenda":
        return setDrawer(true);
      case "scroll":
        return scrollTo(a.target);
      case "faq": {
        const el = document.getElementById(`faq-${a.index}`) as HTMLDetailsElement | null;
        if (el) {
          el.open = true;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const mySessions = agenda
    .map((id) => sessionById.get(id)!)
    .sort((a, b) => a.start.localeCompare(b.start));
  const conflicts = new Set<string>();
  mySessions.forEach((a, i) =>
    mySessions.slice(i + 1).forEach((b) => {
      if (overlaps(a, b)) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }),
  );

  const shareAgenda = async () => {
    const url = `${window.location.origin}/?agenda=${agenda.join(",")}#programacao`;
    const text = `Minha jornada na Select Experience (14/11, SP):\n${mySessions
      .map((s) => `${s.start} · ${s.title}`)
      .join("\n")}\n\nMonte a sua: ${url}\nCupom 20% OFF: ${COUPON}`;
    try {
      if (navigator.share) await navigator.share({ title: "Minha jornada na Select", text, url });
      else {
        await navigator.clipboard.writeText(text);
        setToast("Agenda copiada! Cola no grupo 📋");
      }
    } catch {}
  };

  return (
    <>
      {/* ============ SEARCH + FILTERS ============ */}
      <section id="programacao" className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// programação"}</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Monte sua jornada.</h2>
            <p className="mt-3 max-w-xl text-mute">
              5 salas simultâneas, 1 dia. Busque por tema, pessoa ou empresa, marque com ★ o que não pode perder
              e a gente avisa se tiver conflito.
            </p>
          </div>
          <button
            onClick={surprise}
            className="group rounded-full border-2 border-ink px-5 py-2.5 font-mono text-sm font-bold uppercase transition hover:bg-ink hover:text-paper"
          >
            <span className="inline-block transition group-hover:rotate-[360deg] group-hover:duration-500">🎲</span>{" "}
            me surpreenda
          </button>
        </div>

        <div className="sticky top-16 z-30 -mx-4 mt-8 bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <label className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white px-4 py-3 shadow-[4px_4px_0_#050707] focus-within:shadow-[4px_4px_0_#e73288]">
            <span className="font-mono text-pink">&gt;</span>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              placeholder="grep: IA, arquitetura, Nubank, fishbowl, Waldemar…"
              className="w-full bg-transparent font-mono text-base outline-none placeholder:text-mute/70"
              aria-label="Buscar na programação"
            />
            {q ? (
              <button onClick={() => setQ("")} className="font-mono text-xs text-mute hover:text-ink">
                limpar
              </button>
            ) : (
              <button
                onClick={() => setPalette(true)}
                className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-mute hover:border-ink hover:text-ink sm:block"
              >
                ⌘K busca tudo
              </button>
            )}
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {QUICK.map((w) => (
              <button
                key={w}
                onClick={() => setQ(q === w ? "" : w)}
                className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs transition ${
                  q === w ? "bg-pink text-white" : "bg-ink/5 hover:bg-ink/10"
                }`}
              >
                #{w}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            <button
              onClick={() => setOnlyMine((v) => !v)}
              className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs transition ${
                onlyMine ? "bg-ink text-paper" : "bg-ink/5 hover:bg-ink/10"
              }`}
            >
              ★ só minha jornada ({agenda.length})
            </button>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(type === t ? null : t)}
                className={`shrink-0 rounded-lg border px-2.5 py-1 font-mono text-[11px] uppercase transition ${
                  type === t ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink"
                }`}
              >
                {FORMATS[t]?.emoji} {t}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {ROOMS.map((r) => (
              <button
                key={r}
                onClick={() => setRoom(room === r ? null : r)}
                className={`shrink-0 rounded-lg border px-2.5 py-1 font-mono text-[11px] uppercase transition ${
                  room === r ? "border-pink bg-pink text-white" : "border-line bg-white hover:border-pink"
                }`}
              >
                📍 {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-mute">
          <span>
            {talkCount} {talkCount === 1 ? "sessão" : "sessões"}
            {q && (
              <>
                {" "}
                · {filteredSpeakers.length} {filteredSpeakers.length === 1 ? "pessoa" : "pessoas"}
              </>
            )}
          </span>
          {anyFilter && (
            <button
              onClick={() => {
                setQ("");
                setType(null);
                setRoom(null);
                setOnlyMine(false);
              }}
              className="underline hover:text-ink"
            >
              resetar filtros
            </button>
          )}
        </div>

        {/* ============ SCHEDULE ============ */}
        <div className="mt-4">
          {!room && (
            <div className="sticky top-[13.5rem] z-10 hidden grid-cols-[80px_repeat(5,1fr)] gap-3 lg:grid">
              <span />
              {ROOMS.map((r) => (
                <span key={r} className="font-mono text-[11px] font-bold uppercase tracking-widest text-mute">
                  {r}
                </span>
              ))}
            </div>
          )}

          {slots.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center">
              <p className="font-mono text-sm">
                <span className="text-pink">$</span> grep &quot;{q}&quot; programacao.txt
              </p>
              <p className="mt-2 font-mono text-sm text-mute">0 resultados. Mas no fishbowl esse assunto sempre aparece 😉</p>
              {onlyMine && agenda.length === 0 && (
                <p className="mt-2 text-sm">Você ainda não marcou nenhuma sessão. Clica na ★ de uma delas!</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {slots.map(([start, list]) => {
              const isBreak = list.every((s) => s.type === "Intervalo");
              if (isBreak) {
                const s = list[0];
                return (
                  <div
                    key={start}
                    className="flex items-center gap-4 rounded-2xl bg-ink px-5 py-4 text-paper lg:grid lg:grid-cols-[80px_1fr]"
                  >
                    <span className="font-mono text-sm text-paper/60">{s.start}</span>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-lg font-bold">
                        {FORMATS.Intervalo.emoji} {s.title}
                      </span>
                      <span className="font-mono text-xs text-paper/50">
                        {s.start} ~ {s.end}
                      </span>
                      <span className="text-sm text-paper/70">{s.description}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={start} className="grid gap-3 lg:grid-cols-[80px_1fr]">
                  <div className="flex items-center gap-2 pt-1 lg:block">
                    <span className="font-mono text-lg font-bold">{start}</span>
                    <span className="h-px flex-1 bg-line lg:hidden" />
                  </div>
                  <div className={`grid gap-3 ${room ? "" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
                    {(room ? list : ROOMS.map((r) => list.find((s) => s.room === r))).map((s, i) =>
                      s ? (
                        <SessionCard
                          key={s.id}
                          s={s}
                          q={q}
                          starred={agenda.includes(s.id)}
                          conflict={conflicts.has(s.id)}
                          inGrid={!room}
                          onOpen={() => showSession(s.id)}
                          onStar={() => toggle(s.id)}
                        />
                      ) : (
                        <div key={i} className="hidden rounded-2xl border border-dashed border-line/40 lg:block" />
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SPEAKERS ============ */}
      <section id="palestrantes" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink">{"// quem vai"}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {speakers.length} pessoas que <span className="text-pink">já chegaram lá</span>.
          </h2>
          <p className="max-w-sm text-mute">
            Staff, Principal, CTOs e Heads de Nubank, Google, iFood, Mercado Livre, Oracle, QuintoAndar, PicPay e mais.
            {q && (
              <>
                {" "}
                Filtrando por <b className="text-ink">&quot;{q}&quot;</b>.
              </>
            )}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredSpeakers.map((p) => (
            <button
              key={p.id}
              onClick={() => showSpeaker(p.id)}
              className="group relative overflow-hidden rounded-2xl bg-ink text-left text-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="aspect-square w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-3 pt-10">
                <p className="font-mono text-sm font-bold uppercase leading-tight">
                  <Highlight text={p.name} q={q} />
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-paper/70">
                  {[p.role, p.company].filter(Boolean).join(" @ ")}
                </p>
              </div>
              {p.sessions.length > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-pink px-2 py-0.5 font-mono text-[10px] font-bold">
                  {p.sessions.length} {p.sessions.length === 1 ? "sessão" : "sessões"}
                </span>
              )}
            </button>
          ))}
        </div>
        {filteredSpeakers.length === 0 && (
          <p className="mt-6 font-mono text-sm text-mute">Ninguém com &quot;{q}&quot;… ainda.</p>
        )}
      </section>

      <CommandPalette open={palette} onClose={() => setPalette(false)} onAction={onPalette} />

      {/* ============ AGENDA FAB ============ */}
      <button
        onClick={() => setDrawer(true)}
        className={`fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-3 font-mono text-sm font-bold text-paper shadow-xl transition hover:scale-105 sm:bottom-24 ${
          agenda.length ? "" : "opacity-0 pointer-events-none translate-y-4"
        }`}
      >
        ★ minha jornada
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-pink px-1 text-xs">{agenda.length}</span>
        {conflicts.size > 0 && <span title="Conflitos">⚠️</span>}
      </button>

      {toast && (
        <div className="pop fixed bottom-36 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 font-mono text-sm text-paper shadow-xl sm:bottom-40">
          {toast}
        </div>
      )}

      {/* ============ AGENDA DRAWER ============ */}
      <Modal open={drawer} onClose={() => setDrawer(false)} side>
        <div className="flex h-full flex-col">
          <div className="border-b border-line p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-pink">14/11 · state innovation center</p>
            <h3 className="mt-1 text-2xl font-bold">Minha jornada</h3>
            <p className="text-sm text-mute">
              {mySessions.length} {mySessions.length === 1 ? "sessão" : "sessões"}
              {conflicts.size > 0 && <span className="text-pink"> · {conflicts.size} em conflito</span>}
            </p>
          </div>
          <ol className="flex-1 space-y-2 overflow-y-auto p-5">
            {mySessions.length === 0 && <p className="text-sm text-mute">Marque sessões com ★ pra montar seu dia.</p>}
            {mySessions.map((s) => (
              <li
                key={s.id}
                className={`rounded-xl border p-3 ${conflicts.has(s.id) ? "border-pink bg-pink/5" : "border-line bg-white"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => { setDrawer(false); showSession(s.id); }} className="text-left">
                    <p className="font-mono text-xs text-mute">
                      {s.start}–{s.end} · {s.room}
                    </p>
                    <p className="font-semibold leading-snug">{s.title}</p>
                    {conflicts.has(s.id) && <p className="font-mono text-[11px] text-pink">⚠️ horário conflitante</p>}
                  </button>
                  <button onClick={() => toggle(s.id)} className="text-mute hover:text-pink" aria-label="Remover">
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="space-y-2 border-t border-line p-5">
            {mySessions.length > 0 && (
              <button
                onClick={shareAgenda}
                className="w-full rounded-full border-2 border-ink py-2.5 font-mono text-sm font-bold uppercase hover:bg-ink hover:text-paper"
              >
                compartilhar jornada ↗
              </button>
            )}
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener"
              className="block w-full rounded-full bg-pink py-3 text-center font-mono text-sm font-bold uppercase text-white hover:bg-pink-2"
            >
              garantir vaga com 20% off →
            </a>
            <p className="text-center font-mono text-[11px] text-mute">cupom {COUPON} já aplicado no link</p>
          </div>
        </div>
      </Modal>

      {/* ============ SESSION MODAL ============ */}
      <Modal open={!!openSession} onClose={() => showSession(null)}>
        {openSession && sessionById.get(openSession) && (
          <SessionDetail
            s={sessionById.get(openSession)!}
            starred={agenda.includes(openSession)}
            onStar={() => toggle(openSession)}
            onSpeaker={showSpeaker}
            onSurprise={surprise}
          />
        )}
      </Modal>

      {/* ============ SPEAKER MODAL ============ */}
      <Modal open={!!openSpeaker} onClose={() => showSpeaker(null)}>
        {openSpeaker && speakerById.get(openSpeaker) && (
          <SpeakerDetail p={speakerById.get(openSpeaker)!} onSession={showSession} agenda={agenda} onStar={toggle} />
        )}
      </Modal>
    </>
  );
}

function SessionCard({
  s,
  q,
  starred,
  conflict,
  inGrid,
  onOpen,
  onStar,
}: {
  s: Session;
  q: string;
  inGrid: boolean;
  starred: boolean;
  conflict: boolean;
  onOpen: () => void;
  onStar: () => void;
}) {
  return (
    <article
      className={`group relative flex flex-col rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050707] ${
        starred ? (conflict ? "border-pink ring-2 ring-pink/30" : "border-ink ring-2 ring-ink/10") : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <TypeTag type={s.type} />
          <span className="font-mono text-[10px] uppercase text-mute">
            <span className={inGrid ? "lg:hidden" : ""}>📍 {s.room} · </span>
            {s.start}~{s.end}
          </span>
        </div>
        <button
          onClick={onStar}
          aria-label={starred ? "Remover da jornada" : "Adicionar à jornada"}
          aria-pressed={starred}
          className={`-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg transition hover:scale-125 ${
            starred ? "text-pink" : "text-line hover:text-pink"
          }`}
        >
          {starred ? "★" : "☆"}
        </button>
      </div>
      <button onClick={onOpen} className="mt-2 flex flex-1 flex-col text-left">
        <h3 className="text-[15px] font-bold leading-snug group-hover:text-pink">
          <Highlight text={s.title} q={q} />
        </h3>
        {s.speakers.length > 0 && (
          <div className="mt-auto flex items-center gap-2 pt-3">
            <div className="flex shrink-0 -space-x-2">
              {s.speakers.map((p) => (
                <Avatar key={p.id} id={p.id} size={28} ring="ring-white" />
              ))}
            </div>
            <p className="line-clamp-2 text-xs text-mute">
              <Highlight text={s.speakers.map((p) => p.name).join(", ")} q={q} />
            </p>
          </div>
        )}
        {conflict && <p className="mt-2 font-mono text-[10px] text-pink">⚠️ conflito na sua jornada</p>}
      </button>
    </article>
  );
}

function SessionDetail({
  s,
  starred,
  onStar,
  onSpeaker,
  onSurprise,
}: {
  s: Session;
  starred: boolean;
  onStar: () => void;
  onSpeaker: (id: string) => void;
  onSurprise: () => void;
}) {
  const f = FORMATS[s.type];
  const [shared, setShared] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/#sessao/${s.id}`;
    const text = `"${s.title}" na Select Experience, 14/11 em SP. Cupom ${COUPON} dá 20% off:`;
    try {
      if (navigator.share) await navigator.share({ title: s.title, text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
      }
    } catch {}
  };
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <TypeTag type={s.type} />
        <span className="font-mono text-xs text-mute">
          📍 {s.room} · {s.start} ~ {s.end}
        </span>
      </div>
      <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{s.title}</h3>
      {f && (
        <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-mute">
          <b className="text-ink">
            {f.emoji} {s.type}:
          </b>{" "}
          {f.blurb}
        </p>
      )}
      {s.description && (
        <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink/85">
          {s.description.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {s.speakers.length > 0 && (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {s.speakers.map((p) => {
            const sp = speakerById.get(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onSpeaker(p.id)}
                className="flex items-center gap-3 rounded-xl border border-line p-2 text-left hover:border-ink"
              >
                <Avatar id={p.id} size={48} ring="ring-white" />
                <div>
                  <p className="font-mono text-sm font-bold uppercase">{p.name}</p>
                  <p className="text-xs text-mute">{sp && [sp.role, sp.company].filter(Boolean).join(" @ ")}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-7 flex flex-wrap gap-2">
        <button
          onClick={onStar}
          className={`rounded-full px-5 py-2.5 font-mono text-sm font-bold uppercase transition ${
            starred ? "bg-ink text-paper" : "border-2 border-ink hover:bg-ink hover:text-paper"
          }`}
        >
          {starred ? "★ na minha jornada" : "☆ adicionar à jornada"}
        </button>
        <button onClick={share} className="rounded-full border-2 border-line px-4 py-2.5 font-mono text-sm hover:border-ink">
          {shared ? "link copiado ✓" : "compartilhar ↗"}
        </button>
        <button onClick={onSurprise} className="rounded-full border-2 border-line px-4 py-2.5 font-mono text-sm hover:border-ink">
          🎲 outra
        </button>
      </div>
      <a
        href={CHECKOUT_URL}
        target="_blank"
        rel="noopener"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-ink p-4 text-paper hover:bg-ink-2"
      >
        <span className="text-sm">
          Quer estar nessa sala? <b className="text-pink">20% off</b> com <span className="font-mono">{COUPON}</span>
        </span>
        <span className="font-mono text-sm font-bold">→</span>
      </a>
    </div>
  );
}

function SpeakerDetail({
  p,
  onSession,
  agenda,
  onStar,
}: {
  p: Speaker;
  onSession: (id: string) => void;
  agenda: string[];
  onStar: (id: string) => void;
}) {
  return (
    <div>
      <div className="grain relative flex items-end gap-4 bg-ink p-6 text-paper sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt={p.name} className="h-28 w-28 rounded-2xl object-cover sm:h-36 sm:w-36" />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-pink">presença confirmada</p>
          <h3 className="font-mono text-2xl font-bold uppercase sm:text-3xl">{p.name}</h3>
          <p className="text-paper/70">{[p.role, p.company].filter(Boolean).join(" @ ")}</p>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        {p.sessions.length ? (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">onde encontrar</p>
            <div className="mt-3 space-y-2">
              {p.sessions.map((id) => {
                const s = sessionById.get(id)!;
                const starred = agenda.includes(id);
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-ink">
                    <button onClick={() => onSession(id)} className="flex-1 text-left">
                      <TypeTag type={s.type} />
                      <p className="font-semibold leading-snug">{s.title}</p>
                      <p className="font-mono text-xs text-mute">
                        {s.start}~{s.end} · {s.room}
                      </p>
                    </button>
                    <button
                      onClick={() => onStar(id)}
                      className={`text-xl ${starred ? "text-pink" : "text-line hover:text-pink"}`}
                      aria-label="Adicionar à jornada"
                    >
                      {starred ? "★" : "☆"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-mute">Sessão sendo definida. Mas vai estar lá, circulando entre as salas. 👀</p>
        )}
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener"
          className="mt-6 block rounded-full bg-pink py-3 text-center font-mono text-sm font-bold uppercase text-white hover:bg-pink-2"
        >
          conversar com {p.name.split(" ")[0]} ao vivo · 20% off →
        </a>
      </div>
    </div>
  );
}

function Modal({
  open,
  onClose,
  side = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={
        side
          ? "fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-md bg-paper p-0 text-ink"
          : "m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white p-0 text-ink"
      }
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/80 font-mono text-paper hover:bg-pink"
        aria-label="Fechar"
      >
        ✕
      </button>
      {open && <div className="pop h-full">{children}</div>}
    </dialog>
  );
}
