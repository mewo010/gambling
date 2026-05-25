import { createFileRoute } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { BetPanel } from "@/components/BetPanel";
import { Button } from "@/components/ui/button";
import { useCasino } from "@/store/casino";
import { Spade } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/games/blackjack")({
  head: () => ({ meta: [{ title: "Blackjack — VirtuaBet" }] }),
  component: Blackjack,
});

type Card = { r: string; s: string; v: number };
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = [
  { r: "A", v: 11 }, { r: "2", v: 2 }, { r: "3", v: 3 }, { r: "4", v: 4 }, { r: "5", v: 5 },
  { r: "6", v: 6 }, { r: "7", v: 7 }, { r: "8", v: 8 }, { r: "9", v: 9 }, { r: "10", v: 10 },
  { r: "J", v: 10 }, { r: "Q", v: 10 }, { r: "K", v: 10 },
];
const draw = (): Card => {
  const r = RANKS[Math.floor(Math.random() * RANKS.length)];
  const s = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { r: r.r, s, v: r.v };
};
const total = (c: Card[]) => {
  let sum = c.reduce((a, b) => a + b.v, 0);
  let aces = c.filter((x) => x.r === "A").length;
  while (sum > 21 && aces > 0) { sum -= 10; aces--; }
  return sum;
};

type Phase = "idle" | "player" | "dealer" | "done";

function Blackjack() {
  const { balance, settleBet, addLog, username, rollOutcome } = useCasino();
  const [bet, setBet] = useState(100);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stake, setStake] = useState(0);
  const [result, setResult] = useState<string>("");
  const [flash, setFlash] = useState<"win" | "loss" | null>(null);

  const deal = () => {
    if (bet > balance) return;
    setStake(bet);
    settleBet("blackjack", 0, -bet); // hold the stake
    const p = [draw(), draw()];
    const d = [draw(), draw()];
    setPlayer(p);
    setDealer(d);
    setPhase("player");
    setResult("");
    setFlash(null);
  };

  const finalize = (p: Card[], d: Card[], multiplier = 2) => {
    const pt = total(p);
    const dt = total(d);
    let outcome: "win" | "loss" | "push";
    if (pt > 21) outcome = "loss";
    else if (dt > 21 || pt > dt) outcome = "win";
    else if (pt === dt) outcome = "push";
    else outcome = "loss";

    // RTP-tilted re-roll for borderline cases
    const want = rollOutcome("blackjack", 0.46);
    if (!want && outcome === "win" && Math.random() < 0.4) outcome = "loss";
    if (want && outcome === "loss" && Math.random() < 0.4) outcome = "win";

    const won = outcome === "win" ? stake * multiplier : outcome === "push" ? stake : 0;
    settleBet("blackjack", stake, won);
    setPhase("done");
    setFlash(outcome === "win" ? "win" : outcome === "loss" ? "loss" : null);
    setResult(
      outcome === "win"
        ? `You win +$${(won - stake).toLocaleString()}!`
        : outcome === "push"
        ? "Push — stake returned."
        : `Bust. -$${stake.toLocaleString()}`,
    );
    addLog({ user: username, game: "Blackjack", amount: won - stake, won: outcome === "win" });
    setTimeout(() => setFlash(null), 800);
  };

  const hit = () => {
    const p = [...player, draw()];
    setPlayer(p);
    if (total(p) >= 21) {
      setPhase("dealer");
      dealerPlay(p, dealer);
    }
  };

  const stand = () => {
    setPhase("dealer");
    dealerPlay(player, dealer);
  };

  const doubleDown = () => {
    if (bet > balance) return;
    settleBet("blackjack", 0, -stake);
    const newStake = stake * 2;
    setStake(newStake);
    const p = [...player, draw()];
    setPlayer(p);
    setPhase("dealer");
    setTimeout(() => dealerPlay(p, dealer, newStake), 400);
  };

  const dealerPlay = (p: Card[], d: Card[], st = stake) => {
    let dd = [...d];
    const step = () => {
      if (total(dd) < 17) {
        dd = [...dd, draw()];
        setDealer(dd);
        setTimeout(step, 450);
      } else {
        // use updated stake
        setStake(st);
        finalize(p, dd);
      }
    };
    step();
  };

  return (
    <GameLayout
      title="Blackjack"
      subtitle="Dealer stands on 17"
      game="Blackjack"
      icon={<Spade className="w-5 h-5 text-primary" />}
      flash={flash}
      side={
        <BetPanel bet={bet} setBet={setBet} max={balance} disabled={phase === "player" || phase === "dealer"}>
          <div className="grid grid-cols-2 gap-2">
            {phase === "idle" || phase === "done" ? (
              <Button onClick={deal} className="col-span-2 glow-primary h-11" disabled={bet > balance}>
                Deal
              </Button>
            ) : (
              <>
                <Button onClick={hit} variant="secondary" disabled={phase !== "player"}>Hit</Button>
                <Button onClick={stand} variant="secondary" disabled={phase !== "player"}>Stand</Button>
                <Button
                  onClick={doubleDown}
                  className="col-span-2"
                  disabled={phase !== "player" || player.length > 2 || stake > balance}
                >
                  Double Down
                </Button>
              </>
            )}
          </div>
          {result && (
            <div
              className={
                "text-center font-bold p-3 rounded-lg " +
                (flash === "win" ? "bg-win/20 text-win" : flash === "loss" ? "bg-loss/20 text-loss" : "bg-muted")
              }
            >
              {result}
            </div>
          )}
        </BetPanel>
      }
    >
      <div className="space-y-10">
        <Hand label="Dealer" cards={dealer} hidden={phase === "player"} />
        <div className="border-t border-dashed border-border" />
        <Hand label={`You (${username})`} cards={player} />
      </div>
    </GameLayout>
  );
}

function Hand({ label, cards, hidden }: { label: string; cards: Card[]; hidden?: boolean }) {
  const visible = hidden && cards.length > 1 ? [cards[0]] : cards;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono font-bold text-lg">
          {hidden && cards.length > 1 ? "?" : cards.length ? total(cards) : "—"}
        </span>
      </div>
      <div className="flex gap-3 flex-wrap min-h-[120px]">
        {visible.map((c, i) => (
          <CardView key={i} card={c} />
        ))}
        {hidden && cards.length > 1 && <CardView back />}
      </div>
    </div>
  );
}

function CardView({ card, back }: { card?: Card; back?: boolean }) {
  if (back || !card) {
    return (
      <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-primary/40 to-neon/30 border border-primary/40 animate-flip" />
    );
  }
  const red = card.s === "♥" || card.s === "♦";
  return (
    <div className="w-20 h-28 rounded-lg bg-white text-slate-900 border border-slate-200 p-2 flex flex-col justify-between font-mono shadow-xl animate-flip">
      <div className={"text-lg font-bold " + (red ? "text-rose-600" : "text-slate-900")}>{card.r}</div>
      <div className={"text-3xl text-right " + (red ? "text-rose-600" : "text-slate-900")}>{card.s}</div>
    </div>
  );
}
