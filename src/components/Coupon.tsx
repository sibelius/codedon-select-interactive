"use client";

import { useEffect, useState } from "react";
import { CHECKOUT_URL, COUPON } from "@/lib/event";

const COLORS = ["#e73288", "#ff5aa8", "#050707", "#f0efee", "#2f80ed", "#f2c94c"];

export function burstConfetti(count = 80) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = COLORS[i % COLORS.length];
    el.style.borderRadius = Math.random() > 0.5 ? "2px" : "50%";
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * 300}px`);
    el.style.setProperty("--rot", `${Math.random() * 1080}deg`);
    el.style.setProperty("--dur", `${1.6 + Math.random() * 1.6}s`);
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }
}

export function useCopyCoupon() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
    } catch {
      // clipboard blocked: the code is visible anyway
    }
    setCopied(true);
    burstConfetti();
  };
  return { copied, copy };
}

export function CouponTicket({ dark = false }: { dark?: boolean }) {
  const { copied, copy } = useCopyCoupon();
  return (
    <div
      className={`relative flex flex-col sm:flex-row items-stretch rounded-2xl border-2 border-dashed ${
        dark ? "border-pink/70 bg-ink-2 text-paper" : "border-ink bg-white text-ink"
      }`}
    >
      <div className="flex-1 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-pink">cupom de palestrante</p>
        <button
          onClick={copy}
          className="group mt-1 flex items-center gap-3 text-left"
          aria-label={`Copiar cupom ${COUPON}`}
        >
          <span className="font-mono text-3xl font-bold tracking-wider sm:text-4xl">{COUPON}</span>
          <span
            className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase transition ${
              copied ? "bg-pink text-white" : dark ? "bg-paper/10 group-hover:bg-paper/20" : "bg-ink/5 group-hover:bg-ink/10"
            }`}
          >
            {copied ? "copiado ✓" : "copiar"}
          </span>
        </button>
        <p className={`mt-2 text-sm ${dark ? "text-paper/60" : "text-mute"}`}>
          20% de desconto em qualquer lote. O link abaixo já aplica o cupom automaticamente.
        </p>
      </div>
      <div
        className={`relative flex items-center justify-center border-t-2 border-dashed p-5 sm:border-l-2 sm:border-t-0 ${
          dark ? "border-pink/70" : "border-ink"
        }`}
      >
        <span
          className={`absolute -top-3 left-1/2 hidden h-6 w-6 -translate-x-1/2 rounded-full sm:block ${
            dark ? "bg-ink" : "bg-paper"
          }`}
        />
        <span
          className={`absolute -bottom-3 left-1/2 hidden h-6 w-6 -translate-x-1/2 rounded-full sm:block ${
            dark ? "bg-ink" : "bg-paper"
          }`}
        />
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener"
          className="whitespace-nowrap rounded-full bg-pink px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_0_#9c1d5a] transition hover:-translate-y-0.5 hover:bg-pink-2 active:translate-y-1 active:shadow-none"
        >
          usar cupom →
        </a>
      </div>
    </div>
  );
}
