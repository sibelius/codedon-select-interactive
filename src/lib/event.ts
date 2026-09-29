import data from "@/data/event.json";

export type Speaker = {
  id: string;
  name: string;
  role: string;
  company: string;
  img: string;
  sessions: string[];
};

export type Session = {
  id: string;
  type: string;
  room: string;
  title: string;
  start: string;
  end: string;
  speakers: { id: string; name: string }[];
  description: string;
};

export const speakers = data.speakers as Speaker[];
export const sessions = data.sessions as Session[];

export const speakerById = new Map(speakers.map((s) => [s.id, s]));
export const sessionById = new Map(sessions.map((s) => [s.id, s]));

export const ROOMS = ["Auditório", "Arquibancada", "Capela", "Lab", "Studio"] as const;

export const COUPON = "PALESTRANTE20";
export const DISCOUNT = 0.2;
export const CHECKOUT_URL = `https://app.codecon.dev/eventos/select-experience-26?c=${COUPON}`;
export const OFFICIAL_URL = "https://codecon.dev/select";

// Event starts 14/11/2026 09:00 in São Paulo (UTC-3)
export const EVENT_START = new Date("2026-11-14T09:00:00-03:00");

export const LOTS = [
  { label: "1º lote", price: 899, status: "esgotado" },
  { label: "2º lote", price: 1190, status: "esgotado" },
  { label: "Lote atual", price: 1290, status: "atual", until: new Date("2026-09-30T23:59:59-03:00") },
  { label: "Próximo lote", price: 1490, status: "proximo" },
] as const;

export const CURRENT_LOT = LOTS[2];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const withCoupon = (n: number) => Math.round(n * (1 - DISCOUNT) * 100) / 100;

export const FORMATS: Record<string, { emoji: string; blurb: string; color: string }> = {
  Fishbowl: {
    emoji: "🐟",
    blurb: "Cadeiras no centro, uma sempre vazia. Quem tem algo a dizer senta e entra na conversa.",
    color: "#2f80ed",
  },
  Mentoria: {
    emoji: "🧭",
    blurb: "Grupo pequeno, suas dúvidas reais, conversa direta com quem já passou por isso.",
    color: "#27ae60",
  },
  Roundtable: {
    emoji: "🪑",
    blurb: "Mesa redonda sobre decisões e trade-offs, com espaço pra plateia discordar.",
    color: "#f2994a",
  },
  Palestra: {
    emoji: "🎤",
    blurb: "As poucas talks do dia, escolhidas a dedo pra abrir provocações.",
    color: "#e73288",
  },
  AMA: {
    emoji: "❓",
    blurb: "Ask Me Anything: pergunte o que quiser, sem roteiro e sem slides.",
    color: "#9b51e0",
  },
  Workshop: {
    emoji: "🛠️",
    blurb: "Mão na massa: sai da sala com algo aplicável na segunda-feira.",
    color: "#eb5757",
  },
  "Architectural Kata": {
    emoji: "🥋",
    blurb: "Times modelam uma arquitetura pra um problema real e defendem suas escolhas.",
    color: "#00a3a3",
  },
  "Lições aprendidas": {
    emoji: "📓",
    blurb: "Bastidores sem filtro: o que deu certo, o que deu errado e o que ninguém conta.",
    color: "#c9a227",
  },
  Abertura: { emoji: "🚪", blurb: "Boas-vindas e como o dia funciona.", color: "#050707" },
  Intervalo: { emoji: "☕", blurb: "Incluso no ingresso. Onde metade do networking acontece.", color: "#6b7078" },
};

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const overlaps = (a: Session, b: Session) =>
  toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function sessionHaystack(s: Session) {
  const sp = s.speakers
    .map((p) => {
      const full = speakerById.get(p.id);
      return full ? `${full.name} ${full.role} ${full.company}` : p.name;
    })
    .join(" ");
  return normalize(`${s.title} ${s.description} ${s.type} ${s.room} ${sp}`);
}

export const FAQ: [string, string][] = [
  ["Quando e onde?", "14 de novembro de 2026, das 9h às 19h (+ happy hour até 20h), no State Innovation Center, São Paulo, SP."],
  ["Pra quem é?", "Devs sênior e acima, staff engineers, tech leads, engineering managers e CTOs. A curadoria de participantes é parte do produto."],
  ["O que é talkless?", "Sem palco central e sem plateia calada. Fishbowls, mentorias, roundtables, workshops e AMAs em 5 salas simultâneas, onde a troca é obrigatória."],
  ["O que está incluso?", "Acesso a todas as sessões, almoço, coffee break e happy hour."],
  ["Como uso o cupom?", `Clique em qualquer botão desta página: o link já leva ao checkout com o cupom ${COUPON} aplicado. Ou digite ${COUPON} manualmente no checkout.`],
  ["Tem gravação?", "O que acontece ali fica com quem estava presente. É exatamente por isso que funciona."],
];
