import { createFileRoute } from "@tanstack/react-router";
import { useCasino, formatMoney, type GameKey } from "@/store/casino";
import { Shield, Activity, Users, Sliders, TrendingUp, Ban, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — VirtuaBet" }] }),
  component: Admin,
});

const GAMES: { key: GameKey; label: string }[] = [
  { key: "blackjack", label: "Blackjack" },
  { key: "cockfight", label: "Cockfight" },
  { key: "roulette", label: "Roulette" },
  { key: "higher-lower", label: "Higher/Lower" },
  { key: "wheel", label: "Spin the Wheel" },
];

const FAKE_EVENTS = [
  (u: string) => ({ msg: `won $500 on Roulette`, user: u }),
  (u: string) => ({ msg: `busted on Blackjack (-$200)`, user: u }),
  (u: string) => ({ msg: `hit 10x on Spin the Wheel (+$2,000)`, user: u }),
  (u: string) => ({ msg: `streak x6 on Higher/Lower`, user: u }),
  (u: string) => ({ msg: `backed Rusty for $300 — LOST`, user: u }),
  (u: string) => ({ msg: `cashed out $1,200 from Blackjack`, user: u }),
];
const FAKE_NAMES = ["Alpha", "NeonShark", "RouletteKing", "Pedro", "HighRoller", "LuckyDuck", "Vega", "Kai", "Sable"];

function Admin() {
  const { isAdmin, wagered, netHouse, gamePlays, rtp, setRtp, users, banUser, editUserBalance, logs } = useCasino();
  const [live, setLive] = useState<{ id: number; user: string; msg: string; t: number }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const i = setInterval(() => {
      const u = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      const ev = FAKE_EVENTS[Math.floor(Math.random() * FAKE_EVENTS.length)](u);
      setLive((l) => [{ id: Date.now() + Math.random(), user: ev.user, msg: ev.msg, t: Date.now() }, ...l].slice(0, 30));
    }, 1400);
    return () => clearInterval(i);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 text-center card-elev">
        <Shield className="w-12 h-12 mx-auto text-loss" />
        <h1 className="text-2xl font-bold mt-4">Restricted</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Toggle the admin shield in the top bar to access the operator console.
        </p>
      </div>
    );
  }

  const mostPlayed = (Object.entries(gamePlays) as [GameKey, number][]).sort((a, b) => b[1] - a[1])[0];
  const totalPlays = Object.values(gamePlays).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Operator Console</h1>
          <p className="text-sm text-muted-foreground">Manage the house. Adjust reality.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Wagered" value={formatMoney(wagered)} icon={TrendingUp} tint="text-neon" />
        <Kpi label="House P/L" value={formatMoney(netHouse)} icon={Activity} tint={netHouse >= 0 ? "text-win" : "text-loss"} />
        <Kpi label="Most Played" value={mostPlayed?.[1] ? mostPlayed[0] : "—"} icon={Sliders} tint="text-primary" />
        <Kpi label="Total Rounds" value={String(totalPlays)} icon={Users} tint="text-gold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-elev p-6">
          <h2 className="font-bold flex items-center gap-2 mb-1"><Sliders className="w-4 h-4 text-primary" /> RTP Rigging</h2>
          <p className="text-xs text-muted-foreground mb-5">0 = House Always Wins · 0.5 = Fair · 1 = Player Feast</p>
          <div className="space-y-5">
            {GAMES.map((g) => (
              <div key={g.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{g.label}</span>
                  <span className="font-mono text-xs text-neon">{rtp[g.key].toFixed(2)} · {modeLabel(rtp[g.key])}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={rtp[g.key]}
                  onChange={(e) => setRtp(g.key, Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card-elev p-6">
          <h2 className="font-bold mb-3">Game Plays</h2>
          <div className="space-y-3">
            {GAMES.map((g) => {
              const pct = totalPlays ? (gamePlays[g.key] / totalPlays) * 100 : 0;
              return (
                <div key={g.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{g.label}</span>
                    <span className="font-mono text-muted-foreground">{gamePlays[g.key]} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-neon transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="font-bold mt-6 mb-2 text-sm">Recent Round Log</h3>
          <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1">
            {logs.length === 0 && <div className="text-muted-foreground">No rounds settled yet.</div>}
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between">
                <span>{l.user} · {l.game}</span>
                <span className={l.won ? "text-win" : "text-loss"}>
                  {l.won ? "+" : "-"}{formatMoney(Math.abs(l.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="card-elev p-6">
          <h2 className="font-bold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-primary" /> User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="text-left py-2">User</th><th className="text-right">Balance</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 text-right font-mono">{formatMoney(u.balance)}</td>
                    <td className="py-3 text-center">
                      <span className={"text-[10px] uppercase px-2 py-1 rounded " + (u.banned ? "bg-loss/20 text-loss" : "bg-win/20 text-win")}>
                        {u.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => {
                        const v = prompt(`New balance for ${u.name}`, String(u.balance));
                        if (v) editUserBalance(u.id, Number(v) || 0);
                      }}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => banUser(u.id)}>
                        <Ban className={"w-3 h-3 " + (u.banned ? "text-loss" : "")} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elev p-6">
          <h2 className="font-bold flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-neon" /> System Logs · Live</h2>
          <div className="h-72 overflow-y-auto text-xs font-mono space-y-1 bg-background/50 border border-border rounded-lg p-3">
            {live.length === 0 && <div className="text-muted-foreground">Listening…</div>}
            {live.map((l) => (
              <div key={l.id} className="flex gap-2">
                <span className="text-muted-foreground">[{new Date(l.t).toLocaleTimeString()}]</span>
                <span className="text-neon">{l.user}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function modeLabel(v: number) {
  if (v < 0.25) return "House Wins";
  if (v < 0.45) return "Tilted";
  if (v < 0.55) return "Fair";
  if (v < 0.8) return "Generous";
  return "Player Feast";
}

function Kpi({ label, value, icon: Icon, tint }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tint: string }) {
  return (
    <div className="card-elev p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${tint}`} />
      </div>
      <div className={`mt-2 font-mono text-xl font-bold ${tint}`}>{value}</div>
    </div>
  );
}
