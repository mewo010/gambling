import { createFileRoute } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { BetPanel } from "@/components/BetPanel";
import { Button } from "@/components/ui/button";
import { useCasino } from "@/store/casino";
import { ArrowUpDown, ChevronUp, ChevronDown, Flame } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/games/higher-lower")({
  head: () => ({ meta: [{ title: "Higher or Lower — VirtuaBet" }] }),
  component: HigherLower,
});

function HigherLower() {
  const { balance, settleBet, addLog, username, rollOutcome } = useCasino();
  const [bet, setBet] = useState(100);
  const [current, setCurrent] = useState(() => 1 + Math.floor(Math.random() * 100));
  const [streak, setStreak] = useState(0);
  const [stake, setStake] = useState(0);
  const [active, setActive] = useState(false);
  const [flash, setFlash] = useState<"win" | "loss" | null>(null);
  const [msg, setMsg] = useState("");

  const multiplier = Math.pow(1.6, streak);

  const start = () => {
    if (bet > balance) return;
    settleBet("higher-lower", 0, -bet);
    setStake(bet);
    setStreak(0);
    setActive(true);
    setCurrent(1 + Math.floor(Math.random() * 100));
    setMsg("");
    setFlash(null);
  };

  const guess = (dir: "higher" | "lower") => {
    if (!active) return;
    // Fair probability of correct guess based on current value
    const fair = dir === "higher" ? (100 - current) / 99 : (current - 1) / 99;
    const won = rollOutcome("higher-lower", Math.max(0.05, Math.min(0.95, fair)));
    let next: number;
    if (won) {
      next = dir === "higher"
        ? current + 1 + Math.floor(Math.random() * Math.max(1, 100 - current))
        : current - 1 - Math.floor(Math.random() * Math.max(1, current - 1));
      next = Math.max(1, Math.min(100, next));
    } else {
      next = dir === "higher"
        ? Math.max(1, current - 1 - Math.floor(Math.random() * Math.max(1, current - 1)))
        : Math.min(100, current + 1 + Math.floor(Math.random() * Math.max(1, 100 - current)));
    }
    setCurrent(next);
    if (won) {
      setStreak((s) => s + 1);
      setFlash("win");
      setMsg("Correct! Cash out or push further.");
    } else {
      const lost = stake;
      settleBet("higher-lower", lost, 0);
      addLog({ user: username, game: "Higher/Lower", amount: -lost, won: false });
      setFlash("loss");
      setMsg(`Wrong! Lost $${lost.toLocaleString()}.`);
      setActive(false);
      setStreak(0);
    }
    setTimeout(() => setFlash(null), 800);
  };

  const cashOut = () => {
    if (!active) return;
    const payout = Math.round(stake * (multiplier || 1));
    settleBet("higher-lower", stake, payout);
    addLog({ user: username, game: "Higher/Lower", amount: payout - stake, won: true });
    setMsg(`Cashed out $${payout.toLocaleString()}!`);
    setFlash("win");
    setActive(false);
    setStreak(0);
    setTimeout(() => setFlash(null), 800);
  };

  return (
    <GameLayout
      title="Higher or Lower"
      subtitle="Beat the number, stack the streak"
      game="Higher/Lower"
      icon={<ArrowUpDown className="w-5 h-5 text-neon" />}
      flash={flash}
      side={
        <BetPanel bet={bet} setBet={setBet} max={balance} disabled={active}>
          {!active ? (
            <Button onClick={start} disabled={bet > balance} className="w-full glow-primary h-11">Start Round</Button>
          ) : (
            <Button onClick={cashOut} variant="secondary" className="w-full h-11">
              Cash Out · ${Math.round(stake * multiplier).toLocaleString()}
            </Button>
          )}
          {msg && (
            <div className={"text-center p-3 rounded-lg font-bold " + (flash === "win" ? "bg-win/20 text-win" : flash === "loss" ? "bg-loss/20 text-loss" : "bg-muted")}>
              {msg}
            </div>
          )}
        </BetPanel>
      }
    >
      <div className="flex flex-col items-center justify-center gap-8 min-h-[360px]">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Current</div>
          <div className="font-mono text-8xl md:text-9xl font-black text-gradient-neon">{current}</div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-gold" />
            <span>Streak <span className="font-mono font-bold text-gold">x{streak}</span></span>
            <span className="text-muted-foreground">· payout</span>
            <span className="font-mono font-bold text-neon">{multiplier.toFixed(2)}x</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Button
            disabled={!active}
            onClick={() => guess("higher")}
            className="h-20 bg-win/20 hover:bg-win/30 text-win border border-win/40 flex-col gap-1"
          >
            <ChevronUp className="w-6 h-6" /> Higher
          </Button>
          <Button
            disabled={!active}
            onClick={() => guess("lower")}
            className="h-20 bg-loss/20 hover:bg-loss/30 text-loss border border-loss/40 flex-col gap-1"
          >
            <ChevronDown className="w-6 h-6" /> Lower
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
