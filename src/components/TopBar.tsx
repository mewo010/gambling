import { useCasino, formatMoney } from "@/store/casino";
import { Button } from "@/components/ui/button";
import { Coins, Droplet, RotateCcw, ShieldCheck, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function TopBar() {
  const { balance, faucet, resetBalance, username, setUsername, isAdmin, toggleAdmin } = useCasino();
  const [editing, setEditing] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="md:hidden flex items-center gap-2">
          <Link to="/" className="font-bold text-gradient-neon text-lg">VirtuaBet</Link>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg bg-card border border-border">
            {editing ? (
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
                className="bg-transparent outline-none text-sm w-28"
              />
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm font-medium">
                {username}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-gradient-to-r from-primary/20 to-neon/20 border border-primary/40 glow-primary">
            <Coins className="w-4 h-4 text-gold" />
            <span className="font-mono font-bold tabular-nums">{formatMoney(balance)}</span>
          </div>
          <Button size="sm" variant="secondary" onClick={faucet} className="gap-1">
            <Droplet className="w-4 h-4 text-neon" />
            <span className="hidden sm:inline">Faucet +$5,000</span>
          </Button>
          <Button size="icon" variant="ghost" onClick={resetBalance} title="Reset to $10,000">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={isAdmin ? "default" : "ghost"}
            onClick={toggleAdmin}
            title="Toggle Admin"
            className={isAdmin ? "glow-primary" : ""}
          >
            <ShieldCheck className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
