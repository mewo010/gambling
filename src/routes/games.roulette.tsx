import { createFileRoute } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { BetPanel } from "@/components/BetPanel";
import { Button } from "@/components/ui/button";
import { useCasino } from "@/store/casino";
import { CircleDot } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/games/roulette")({
  head: () => ({ meta: [{ title: "Roulette — VirtuaBet" }] }),
  component: Roulette,
});

// European order
const WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

type BetKind = "red" | "black" | "even" | "odd" | "low" | "high" | "number";
interface Wager { kind: BetKind; value?: number; amount: number }

function payout(kind: BetKind) {
  return kind === "number" ? 35 : 1; // straight 35:1, evens 1:1
}

function wins(kind: BetKind, value: number | undefined, n: number) {
  if (n === 0) return kind === "number" && value === 0;
  switch (kind) {
    case "red": return RED.has(n);
    case "black": return !RED.has(n);
    case "even": return n % 2 === 0;
    case "odd": return n % 2 === 1;
    case "low": return n >= 1 && n <= 18;
    case "high": return n >= 19 && n <= 36;
    case "number": return value === n;
  }
}

function Roulette() {
  const { balance, settleBet, addLog, username, rollOutcome } = useCasino();
  const [bet, setBet] = useState(100);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [flash, setFlash] = useState<"win" | "loss" | null>(null);
  const [rotation, setRotation] = useState(0);

  const totalStake = wagers.reduce((a, b) => a + b.amount, 0);

  const place = (kind: BetKind, value?: number) => {
    if (totalStake + bet > balance) return;
    setWagers((w) => [...w, { kind, value, amount: bet }]);
  };
  const clear = () => setWagers([]);

  const spin = () => {
    if (!wagers.length || spinning) return;
    setSpinning(true);
    setResult(null);
    setFlash(null);

    // Determine outcome
    const anyMainBet = wagers.find((w) => w.kind !== "number");
    const playerWins = rollOutcome("roulette", anyMainBet ? 0.48 : 0.027);
    let n: number;
    if (playerWins && anyMainBet) {
      // pick a number that satisfies at least one winning even-money bet
      const candidates = WHEEL.filter((x) => wagers.some((w) => wins(w.kind, w.value, x)));
      n = candidates[Math.floor(Math.random() * candidates.length)] ?? WHEEL[Math.floor(Math.random() * WHEEL.length)];
    } else if (playerWins) {
      const numberBet = wagers.find((w) => w.kind === "number")!;
      n = numberBet.value!;
    } else {
      const losing = WHEEL.filter((x) => !wagers.some((w) => wins(w.kind, w.value, x)));
      n = losing.length ? losing[Math.floor(Math.random() * losing.length)] : Math.floor(Math.random() * 37);
    }

    const idx = WHEEL.indexOf(n);
    const slice = 360 / WHEEL.length;
    const target = 360 * 6 + (360 - idx * slice);
    setRotation((r) => r + target);

    setTimeout(() => {
      setResult(n);
      let net = 0;
      for (const w of wagers) {
        net += wins(w.kind, w.value, n) ? w.amount * payout(w.kind) : -w.amount;
      }
      settleBet("roulette", totalStake, net);
      setFlash(net > 0 ? "win" : "loss");
      addLog({ user: username, game: "Roulette", amount: net, won: net > 0 });
      setSpinning(false);
      setWagers([]);
      setTimeout(() => setFlash(null), 800);
    }, 3200);
  };

  const numbers = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <GameLayout
      title="Roulette"
      subtitle="European single zero"
      game="Roulette"
      icon={<CircleDot className="w-5 h-5 text-loss" />}
      flash={flash}
      side={
        <BetPanel bet={bet} setBet={setBet} max={balance - totalStake} disabled={spinning}>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Wagers: {wagers.length}</span>
            <span className="font-mono">Total: ${totalStake}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={clear} variant="secondary" disabled={spinning || !wagers.length}>Clear</Button>
            <Button onClick={spin} disabled={spinning || !wagers.length} className="glow-primary">
              {spinning ? "Spinning…" : "Spin"}
            </Button>
          </div>
          {result !== null && (
            <div className={"text-center p-3 rounded-lg font-bold " + (flash === "win" ? "bg-win/20 text-win" : "bg-loss/20 text-loss")}>
              {result === 0 ? "ZERO" : result} · {result === 0 ? "green" : RED.has(result) ? "RED" : "BLACK"}
            </div>
          )}
        </BetPanel>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-56 h-56">
          <div className="absolute inset-0 rounded-full border-4 border-gold/40 glow-primary" />
          <div
            className="absolute inset-2 rounded-full transition-transform duration-[3000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${WHEEL.map((n, i) => {
                const c = n === 0 ? "var(--win)" : RED.has(n) ? "var(--loss)" : "#1a1a1a";
                const slice = 100 / WHEEL.length;
                return `${c} ${i * slice}% ${(i + 1) * slice}%`;
              }).join(",")})`,
            }}
          />
          <div className="absolute inset-1/3 rounded-full bg-card border border-border grid place-items-center">
            <span className="font-mono text-3xl font-bold">{result ?? "·"}</span>
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-gold" />
        </div>

        <div className="w-full">
          <div className="grid grid-cols-12 gap-1">
            <button
              onClick={() => place("number", 0)}
              className="col-span-12 h-10 rounded bg-win/30 hover:bg-win/50 border border-win/50 text-win font-bold transition"
            >0</button>
            {numbers.map((n) => (
              <button
                key={n}
                onClick={() => place("number", n)}
                className={
                  "h-10 rounded font-mono text-sm font-bold border transition hover:scale-105 " +
                  (RED.has(n)
                    ? "bg-loss/30 border-loss/50 text-loss hover:bg-loss/50"
                    : "bg-black/40 border-border text-foreground hover:bg-black/60")
                }
              >
                {n}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1 mt-2">
            <OddsBtn label="1-18" onClick={() => place("low")} />
            <OddsBtn label="EVEN" onClick={() => place("even")} />
            <OddsBtn label="RED" onClick={() => place("red")} tint="bg-loss/30 border-loss/50 text-loss" />
            <OddsBtn label="BLACK" onClick={() => place("black")} tint="bg-black/60 border-border" />
            <OddsBtn label="ODD" onClick={() => place("odd")} />
            <OddsBtn label="19-36" onClick={() => place("high")} />
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

function OddsBtn({ label, onClick, tint }: { label: string; onClick: () => void; tint?: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "h-10 rounded font-bold text-sm border transition hover:scale-105 " +
        (tint ?? "bg-muted/60 border-border hover:bg-muted")
      }
    >
      {label}
    </button>
  );
}
