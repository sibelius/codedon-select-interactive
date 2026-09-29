"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAQ,
  FORMATS,
  ROOMS,
  normalize,
  sessionHaystack,
  sessions,
  speakers,
} from "@/lib/event";

export const PALETTE_EVENT = "select:palette";

export type PaletteAction =
  | { kind: "session"; id: string }
  | { kind: "speaker"; id: string }
  | { kind: "filter-type"; value: string }
  | { kind: "filter-room"; value: string }
  | { kind: "copy-coupon" }
  | { kind: "buy" }
  | { kind: "surprise" }
  | { kind: "agenda" }
  | { kind: "scroll"; target: string }
  | { kind: "faq"; index: number };

type Item = {
  key: string;
  group: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  hay: string;
  action: PaletteAction;
};

const ACTIONS: Item[] = [
  { key: "a-coupon", group: "Ações", icon: "🎟️", title: "Copiar cupom PALESTRANTE20", subtitle: "20% de desconto", hay: "cupom desconto copiar palestrante20 coupon", action: { kind: "copy-coupon" } },
  { key: "a-buy", group: "Ações", icon: "💳", title: "Comprar ingresso com 20% off", subtitle: "abre o checkout com o cupom aplicado", hay: "comprar ingresso checkout preco lote pagar buy ticket", action: { kind: "buy" } },
  { key: "a-surprise", group: "Ações", icon: "🎲", title: "Me surpreenda", subtitle: "abre uma sessão aleatória", hay: "aleatorio random surpresa dado", action: { kind: "surprise" } },
  { key: "a-agenda", group: "Ações", icon: "★", title: "Ver minha jornada", subtitle: "sessões marcadas e conflitos", hay: "agenda jornada favoritos minha", action: { kind: "agenda" } },
  { key: "a-prog", group: "Ir para", icon: "🗓️", title: "Programação", hay: "programacao grade horario schedule", action: { kind: "scroll", target: "programacao" } },
  { key: "a-speakers", group: "Ir para", icon: "👥", title: "Palestrantes", hay: "palestrantes quem vai speakers", action: { kind: "scroll", target: "palestrantes" } },
  { key: "a-price", group: "Ir para", icon: "💰", title: "Ingresso e lotes", hay: "ingresso preco lote valor quanto custa", action: { kind: "scroll", target: "ingresso" } },
];

const ITEMS: Item[] = [
  ...ACTIONS,
  ...sessions
    .filter((s) => s.type !== "Intervalo")
    .map<Item>((s) => ({
      key: `s-${s.id}`,
      group: "Sessões",
      icon: FORMATS[s.type]?.emoji ?? "•",
      title: s.title,
      subtitle: `${s.start}–${s.end} · ${s.room}${s.speakers.length ? " · " + s.speakers.map((p) => p.name).join(", ") : ""}`,
      hay: sessionHaystack(s),
      action: { kind: "session", id: s.id },
    })),
  ...speakers.map<Item>((p) => ({
    key: `p-${p.id}`,
    group: "Palestrantes",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src={p.img} alt="" className="h-7 w-7 rounded-full object-cover" />,
    title: p.name,
    subtitle: [p.role, p.company].filter(Boolean).join(" @ "),
    hay: normalize(`${p.name} ${p.role} ${p.company}`),
    action: { kind: "speaker", id: p.id },
  })),
  ...Object.entries(FORMATS)
    .filter(([t]) => sessions.some((s) => s.type === t) && t !== "Intervalo")
    .map<Item>(([t, f]) => ({
      key: `f-${t}`,
      group: "Formatos",
      icon: f.emoji,
      title: `Filtrar: ${t}`,
      subtitle: f.blurb,
      hay: normalize(`${t} formato ${f.blurb}`),
      action: { kind: "filter-type", value: t },
    })),
  ...ROOMS.map<Item>((r) => ({
    key: `r-${r}`,
    group: "Salas",
    icon: "📍",
    title: `Filtrar sala: ${r}`,
    hay: normalize(`${r} sala room`),
    action: { kind: "filter-room", value: r },
  })),
  ...FAQ.map<Item>(([q, a], i) => ({
    key: `q-${i}`,
    group: "FAQ",
    icon: "💬",
    title: q,
    subtitle: a,
    hay: normalize(`${q} ${a}`),
    action: { kind: "faq", index: i },
  })),
];

const GROUP_ORDER = ["Ações", "Sessões", "Palestrantes", "Formatos", "Salas", "FAQ", "Ir para"];

function score(item: Item, terms: string[]) {
  let total = 0;
  const title = normalize(item.title);
  for (const t of terms) {
    if (!item.hay.includes(t) && !title.includes(t)) return -1;
    total += title.startsWith(t) ? 5 : title.includes(t) ? 3 : 1;
  }
  return total;
}

export function CommandPalette({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (a: PaletteAction) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [seed, setSeed] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQ("");
      setActive(0);
      setSeed(Math.floor(Math.random() * 1000));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      const pool = ITEMS.filter((i) => i.group === "Sessões");
      const picks = [0, 1, 2, 3].map((k) => ({ ...pool[(seed + k * 7) % pool.length], group: "Sugestões" }));
      return [...ACTIONS.slice(0, 4), ...picks];
    }
    const scored = ITEMS.map((i) => ({ i, s: score(i, terms) })).filter((x) => x.s >= 0);
    scored.sort(
      (a, b) => GROUP_ORDER.indexOf(a.i.group) - GROUP_ORDER.indexOf(b.i.group) || b.s - a.s,
    );
    return scored.map((x) => x.i).slice(0, 40);
  }, [q, seed]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (item: Item) => {
    onClose();
    onAction(item.action);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl border-2 border-ink bg-white p-0 text-ink shadow-[8px_8px_0_#e73288]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <span className="font-mono text-pink">⌘</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder="Busque sessões, palestrantes, empresas, formatos, dúvidas…"
          className="w-full bg-transparent text-base outline-none placeholder:text-mute/70"
          aria-label="Buscar em tudo"
        />
        <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mute">esc</kbd>
      </div>
      <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
        {results.length === 0 && (
          <p className="p-6 text-center font-mono text-sm text-mute">
            Nada com &quot;{q}&quot;. Tenta &quot;IA&quot;, &quot;Nubank&quot; ou &quot;cupom&quot;.
          </p>
        )}
        {results.map((item, idx) => {
          const header = item.group !== results[idx - 1]?.group ? item.group : null;
          return (
            <div key={item.key}>
              {header && (
                <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-mute">{header}</p>
              )}
              <button
                data-idx={idx}
                onMouseMove={() => setActive(idx)}
                onClick={() => run(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${
                  idx === active ? "bg-ink text-paper" : ""
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center text-lg">{item.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.title}</span>
                  {item.subtitle && (
                    <span className={`block truncate text-xs ${idx === active ? "text-paper/60" : "text-mute"}`}>
                      {item.subtitle}
                    </span>
                  )}
                </span>
                {idx === active && <span className="font-mono text-xs text-pink">↵</span>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10px] text-mute">
        <span>↑↓ navegar · ↵ abrir · esc fechar</span>
        <span>
          {ITEMS.length} itens indexados
        </span>
      </div>
    </dialog>
  );
}

export function PaletteButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}
      className={`flex items-center gap-2 rounded-full border border-paper/20 px-3 py-1.5 font-mono text-xs text-paper/70 hover:border-paper hover:text-paper ${className}`}
      aria-label="Buscar em tudo"
    >
      <span>🔍</span>
      <span className="hidden sm:inline">buscar</span>
      <kbd className="hidden rounded bg-paper/10 px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
    </button>
  );
}
