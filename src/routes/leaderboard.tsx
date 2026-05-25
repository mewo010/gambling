import { createFileRoute } from "@tanstack/react-router";
import { useCasino, formatMoney } from "@/store/casino";
import { Trophy, Crown, Medal } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — VirtuaBet" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { users, username, balance } = useCasino();
  const all = [...users, { id: "me", name: username, balance, banned: false }]
    .sort((a, b) => b.balance - a.balance);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-gold" />
        <h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {all.slice(0, 3).map((u, i) => (
          <div
            key={u.id}
            className={
              "card-elev p-6 text-center relative overflow-hidden " +
              (i === 0 ? "border-gold/60 glow-primary" : "")
            }
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-neon/20 blur-2xl" />
            <div className="relative">
              {i === 0 ? <Crown className="w-8 h-8 text-gold mx-auto" /> : <Medal className="w-7 h-7 text-muted-foreground mx-auto" />}
              <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">#{i + 1}</div>
              <div className="font-bold text-xl mt-1">{u.name}</div>
              <div className="font-mono font-bold text-2xl mt-2 text-win">{formatMoney(u.balance)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-elev overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3">Rank</th>
              <th className="text-left px-5 py-3">Player</th>
              <th className="text-right px-5 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {all.map((u, i) => (
              <tr key={u.id} className={"border-t border-border " + (u.name === username ? "bg-primary/10" : "")}>
                <td className="px-5 py-3 font-mono">#{i + 1}</td>
                <td className="px-5 py-3 font-medium">
                  {u.name} {u.name === username && <span className="text-xs text-neon ml-2">YOU</span>}
                </td>
                <td className="px-5 py-3 text-right font-mono">{formatMoney(u.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
