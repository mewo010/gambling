import { createFileRoute, Link } from "@tanstack/react-router";
import { useCasino, formatMoney } from "@/store/casino";
import { Spade, Bird, CircleDot, ArrowUpDown, Disc3, TrendingUp, Flame, Coins } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VirtuaBet — Dashboard" },
      { name: "description", content: "Your virtual casino home base." },
    ],
  }),
  component: Index,
});

const games = [
  { to: "/games/blackjack", title: "Blackjack", desc: "Beat the dealer to 21", icon: Spade, tint: "from-primary/30 to-neon/10" },
  { to: "/games/roulette", title: "Roulette", desc: "Red, black or the lucky number", icon: CircleDot, tint: "from-loss/30 to-primary/10" },
  { to: "/games/cockfight", title: "Cockfight Arena", desc: "Pick your champion", icon: Bird, tint: "from-gold/30 to-loss/10" },
  { to: "/games/higher-lower", title: "Higher or Lower", desc: "Stack the streak", icon: ArrowUpDown, tint: "from-neon/30 to-primary/10" },
  { to: "/games/wheel", title: "Spin the Wheel", desc: "Chase the 50x jackpot", icon: Disc3, tint: "from-primary/30 to-gold/10" },
];

function Index() {
  const { balance, wagered, netHouse, username } = useCasino();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-neon/10 p-6 md:p-10 glow-primary">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-neon/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-neon mb-2">Welcome back, {username}</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Play hard. <span className="text-gradient-neon">Lose nothing.</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            100% virtual currency. Every game, every spin, every bluff — pure simulation.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
            <Stat label="Balance" value={formatMoney(balance)} icon={Coins} accent="gold" />
            <Stat label="Wagered" value={formatMoney(wagered)} icon={TrendingUp} accent="neon" />
            <Stat label="House Edge" value={formatMoney(netHouse)} icon={Flame} accent={netHouse >= 0 ? "loss" : "win"} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Games</h2>
          <span className="text-xs text-muted-foreground">5 available</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className="group card-elev p-5 hover:border-primary/60 hover:-translate-y-0.5 transition-all relative overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${g.tint} transition-opacity`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="w-11 h-11 rounded-lg bg-muted/60 grid place-items-center border border-border group-hover:border-primary/40 group-hover:bg-primary/20 transition-all">
                    <g.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-lg">{g.title}</h3>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-neon">Play →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "gold" | "neon" | "win" | "loss";
}) {
  const map = { gold: "text-gold", neon: "text-neon", win: "text-win", loss: "text-loss" };
  return (
    <div className="rounded-xl bg-background/60 border border-border p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className={`w-3 h-3 ${map[accent]}`} /> {label}
      </div>
      <div className={`mt-1 font-mono text-xl font-bold ${map[accent]}`}>{value}</div>
    </div>
  );
}
