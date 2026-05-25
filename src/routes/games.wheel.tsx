import { createFileRoute } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { BetPanel } from "@/components/BetPanel";
import { Button } from "@/components/ui/button";
import { useCasino } from "@/store/casino";
import { Disc3 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/games/wheel")({
  head: () => ({ meta: [{ title: "Spin the Wheel — VirtuaBet" }] }),
  component: Wheel,
});

interface Slice { mult: number; weight: number; color: string; label: string }
const SLICES: Slice[] = [
  { mult: 0,    weight: 28, color: "#1a1a1a",          label: "0x" },
  { mult: 0.5,  weight: 24, color: "var(--muted)",     label: "0.5x" },
  { mult: 1.2,  weight: 18, color: "var(--neon)",      label: "1.2x" },
  { mult: 2,    weight: 14, color: "var(--primary)",   label: "2x" },
  { mult: 5,    weight: 9,  color: "var(--loss)",      label: "5x" },
  { mult: 10,   weight: 5,  color: "var(--gold)",      label: "10x" },
  { mult: 50,   weight: 2,  color: "var(--win)",       label: "50x JACKPOT" },
];

function pickSlice(rng: number) {
  const total = SLICES.reduce((a, b) => a + b.weight, 0);
  let r = rng * total;
  for (let i = 0; i < SLICES.length; i++) {
    r -= SLICES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

function Wheel() {
  const { balance, settleBet, addLog, username, rollOutcome } = useCasino();
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Slice | null>(null);
  const [flash, setFlash] = useState<"win" | "loss" | null>(null);

  // Build conic gradient
  const totalWeight = SLICES.reduce((a, b) => a + b.weight, 0);
  let acc = 0;
  const conic = SLICES.map((s) => {
    const start = (acc / totalWeight) * 100;
    acc += s.weight;
    const end = (acc / totalWeight) * 100;
    return `${s.color} ${start}% ${end}%`;
  }).join(",");

  const spin = () => {
    if (bet > balance || spinning) return;
    setSpinning(true);
    setResult(null);
    setFlash(null);

    const win = rollOutcome("wheel", 0.46);
    // Pick slice — biased
    let idx: number;
    if (win) {
      const winning = SLICES.map((s, i) => ({ s, i })).filter((x) => x.s.mult >= 1);
      idx = winning[Math.floor(Math.random() * winning.length)].i;
    } else {
      const losing = SLICES.map((s, i) => ({ s, i })).filter((x) => x.s.mult < 1);
      idx = losing[Math.floor(Math.random() * losing.length)].i;
    }

    // Compute angle to midpoint of slice
    let start = 0;
    for (let k = 0; k < idx; k++) start += SLICES[k].weight;
    const mid = ((start + SLICES[idx].weight / 2) / totalWeight) * 360;
    const target = 360 * 6 + (360 - mid);
    setRotation((r) => r + target);

    setTimeout(() => {
      const s = SLICES[idx];
      setResult(s);
      const won = Math.round(bet * s.mult) - bet;
      settleBet("wheel", bet, Math.round(bet * s.mult) - bet);
      addLog({ user: username, game: "Spin the Wheel", amount: won, won: won > 0 });
      setFlash(won > 0 ? "win" : "loss");
      setSpinning(false);
      setTimeout(() => setFlash(null), 800);
    }, 4200);
    void pickSlice;
  };

  return (
    <GameLayout
      title="Spin the Wheel"
      subtitle="Hit the 50x jackpot"
      game="Spin the Wheel"
      icon={<Disc3 className="w-5 h-5 text-gold" />}
      flash={flash}
      side={
        <BetPanel bet={bet} setBet={setBet} max={balance} disabled={spinning}>
          <Button onClick={spin} disabled={spinning || bet > balance} className="w-full h-11 glow-primary">
            {spinning ? "Spinning…" : "Spin"}
          </Button>
          {result && (
            <div className={"text-center p-3 rounded-lg font-bold " + (flash === "win" ? "bg-win/20 text-win" : "bg-loss/20 text-loss")}>
              {result.label} · {result.mult >= 1 ? `+$${(bet * result.mult - bet).toLocaleString()}` : `-$${(bet - bet * result.mult).toLocaleString()}`}
            </div>
          )}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {SLICES.map((s) => (
              <div key={s.label} className="text-center">
                <div className="h-3 rounded-sm" style={{ background: s.color }} />
                <div className="text-[9px] mt-1 font-mono">{s.label.replace(" JACKPOT", "")}</div>
              </div>
            ))}
          </div>
        </BetPanel>
      }
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          <div className="absolute inset-0 rounded-full border-4 border-gold/40 glow-primary" />
          <div
            className="absolute inset-3 rounded-full transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${conic})`,
            }}
          />
          <div className="absolute inset-1/3 rounded-full bg-card border-2 border-gold/50 grid place-items-center">
            <Disc3 className="w-10 h-10 text-gold" />
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold drop-shadow-[0_0_8px_var(--gold)]" />
        </div>
      </div>
    </GameLayout>
  );
}
