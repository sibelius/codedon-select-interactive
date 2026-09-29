"use client";

import { useEffect, useState } from "react";
import { sessions } from "@/lib/event";

const pool = sessions.filter((s) => s.speakers.length);

export function Terminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    let cancelled = false;
    let order = [...pool].sort(() => Math.random() - 0.5);
    let idx = 0;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      while (!cancelled) {
        if (idx >= order.length) {
          order = [...pool].sort(() => Math.random() - 0.5);
          idx = 0;
        }
        const s = order[idx++];
        const line = `${s.start} [${s.room.toLowerCase()}] ${s.title}`;
        for (let i = 1; i <= line.length && !cancelled; i++) {
          setTyping(line.slice(0, i));
          await sleep(18 + Math.random() * 30);
        }
        await sleep(1400);
        if (cancelled) return;
        setLines((l) => [...l.slice(-3), `${line}  ← ${s.speakers.map((p) => p.name.split(" ")[0]).join(", ")}`]);
        setTyping("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-paper/10 bg-black/60 font-mono text-[12px] shadow-2xl sm:text-[13px]">
      <div className="flex items-center gap-1.5 border-b border-paper/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-paper/40">~/select-26 — tail -f programacao.log</span>
      </div>
      <div className="h-44 space-y-1.5 p-4 leading-relaxed">
        {lines.map((l, i) => (
          <p key={`${i}-${l}`} className="truncate text-paper/45">
            <span className="text-[#28c840]">✓</span> {l}
          </p>
        ))}
        <p className="text-paper">
          <span className="text-pink">❯</span> {typing}
          <span className="caret">▍</span>
        </p>
      </div>
    </div>
  );
}
