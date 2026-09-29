"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({ target, compact = false }: { target: string; compact?: boolean }) {
  const date = new Date(target);
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setT(diff(date));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const cells: [string, number | undefined][] = [
    ["dias", t?.d],
    ["horas", t?.h],
    ["min", t?.m],
    ["seg", t?.s],
  ];

  if (compact) {
    if (!t) return <span className="font-mono">--</span>;
    return (
      <span className="font-mono tabular-nums">
        {t.d > 0 && `${t.d}d `}
        {String(t.h).padStart(2, "0")}h {String(t.m).padStart(2, "0")}m {String(t.s).padStart(2, "0")}s
      </span>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3" aria-live="off">
      {cells.map(([label, v]) => (
        <div
          key={label}
          className="flex min-w-16 flex-col items-center rounded-xl border border-paper/15 bg-paper/5 px-3 py-2 sm:min-w-20"
        >
          <span className="font-mono text-2xl font-bold tabular-nums sm:text-4xl">
            {v === undefined ? "--" : String(v).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">{label}</span>
        </div>
      ))}
    </div>
  );
}
