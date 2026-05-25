import { Coins, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BetPanel({
  bet,
  setBet,
  max,
  disabled,
  children,
}: {
  bet: number;
  setBet: (n: number) => void;
  max: number;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const update = (n: number) => setBet(Math.max(1, Math.min(max, Math.floor(n))));
  return (
    <div className="card-elev p-5 space-y-4">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Bet Amount</label>
        <div className="mt-2 flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={() => update(bet / 2)} disabled={disabled}>
            <Minus className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg bg-muted/40 border border-border">
            <Coins className="w-4 h-4 text-gold" />
            <input
              type="number"
              value={bet}
              onChange={(e) => update(Number(e.target.value) || 0)}
              disabled={disabled}
              className="flex-1 bg-transparent outline-none font-mono font-bold text-lg"
            />
          </div>
          <Button size="icon" variant="secondary" onClick={() => update(bet * 2)} disabled={disabled}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          {[10, 100, 500, 1000].map((v) => (
            <Button
              key={v}
              size="sm"
              variant="ghost"
              onClick={() => update(v)}
              disabled={disabled}
              className="flex-1 text-xs"
            >
              ${v}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => update(max)} disabled={disabled} className="text-xs">
            MAX
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
