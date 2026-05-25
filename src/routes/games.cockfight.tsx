import { createFileRoute } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { BetPanel } from "@/components/BetPanel";
import { Button } from "@/components/ui/button";
import { useCasino } from "@/store/casino";
import { Bird } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/games/cockfight")({
  head: () => ({ meta: [{ title: "Cockfight Arena — VirtuaBet" }] }),
  component: Cockfight,
});

const ROOSTERS = [
  { id: "red", name: "Rusty the Red", odds: 1.85, color: "from-loss to-gold" },
  { id: "blue", name: "Pedro the Plucked", odds: 2.10, color: "from-neon to-primary" },
];

function Cockfight() {
  const { balance, settleBet, addLog, username, rollOutcome } = useCasino();
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<"red" | "blue" | null>(null);
  const [progress, setProgress] = useState({ red: 50, blue: 50 });
  const [fighting, setFighting] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [flash, setFlash] = useState<"win" | "loss" | null>(null);

  const fight = () => {
    if (!pick || bet > balance) return;
    setFighting(true);
    setWinner(null);
    setFlash(null);
    const playerWins = rollOutcome("cockfight", 0.5);
    const winId = playerWins ? pick : pick === "red" ? "blue" : "red";

    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      setProgress(() => {
        // gravitate toward winner
        const target = winId === "red" ? 75 + Math.random() * 20 : 5 + Math.random() * 20;
        const red = Math.max(5, Math.min(95, target + (Math.random() - 0.5) * 30));
        return { red, blue: 100 - red };
      });
      if (t >= 14) {
        clearInterval(interval);
        setProgress({ red: winId === "red" ? 100 : 0, blue: winId === "blue" ? 100 : 0 });
        const champ = ROOSTERS.find((r) => r.id === winId)!;
        setWinner(champ.name);
        const odds = ROOSTERS.find((r) => r.id === pick)!.odds;
        const won = playerWins ? Math.round(bet * odds) : 0;
        settleBet("cockfight", bet, won - bet);
        setFlash(playerWins ? "win" : "loss");
        addLog({ user: username, game: "Cockfight", amount: won - bet, won: playerWins });
        setFighting(false);
        setTimeout(() => setFlash(null), 800);
      }
    }, 160);
  };

  return (
    <GameLayout
      title="Cockfight Arena"
      subtitle="Pick your champion. Watch the feathers fly."
      game="Cockfight"
      icon={<Bird className="w-5 h-5 text-gold" />}
      flash={flash}
      side={
        <BetPanel bet={bet} setBet={setBet} max={balance} disabled={fighting}>
          <Button
            onClick={fight}
            disabled={!pick || fighting || bet > balance}
            className="w-full glow-primary h-11"
          >
            {fighting ? "Fighting…" : pick ? `Bet on ${ROOSTERS.find((r) => r.id === pick)!.name}` : "Pick a Rooster"}
          </Button>
          {winner && (
            <div className={"text-center font-bold p-3 rounded-lg " + (flash === "win" ? "bg-win/20 text-win" : "bg-loss/20 text-loss")}>
              {winner} wins!
            </div>
          )}
        </BetPanel>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          {ROOSTERS.map((r) => (
            <button
              key={r.id}
              disabled={fighting}
              onClick={() => setPick(r.id as "red" | "blue")}
              className={
                "relative p-6 rounded-2xl border-2 transition-all text-left overflow-hidden " +
                (pick === r.id
                  ? "border-primary glow-primary scale-[1.02]"
                  : "border-border hover:border-primary/40")
              }
            >
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${r.color}`} />
              <div className="relative">
                <div className="text-6xl mb-2 animate-float">{r.id === "red" ? "🐓" : "🐔"}</div>
                <div className="font-bold text-lg">{r.name}</div>
                <div className="font-mono text-2xl text-neon mt-1">{r.odds.toFixed(2)}x</div>
              </div>
            </button>
          ))}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Battle</div>
          <div className="h-6 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-loss to-gold transition-all duration-200" style={{ width: `${progress.red}%` }} />
            <div className="h-full bg-gradient-to-r from-primary to-neon transition-all duration-200" style={{ width: `${progress.blue}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1 font-mono text-muted-foreground">
            <span>{Math.round(progress.red)}%</span>
            <span>{Math.round(progress.blue)}%</span>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
