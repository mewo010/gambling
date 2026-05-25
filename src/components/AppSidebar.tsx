import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Gamepad2,
  Shield,
  Trophy,
  Spade,
  Bird,
  CircleDot,
  ArrowUpDown,
  Disc3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin", label: "Admin Panel", icon: Shield },
];

const games = [
  { to: "/games/blackjack", label: "Blackjack", icon: Spade },
  { to: "/games/cockfight", label: "Cockfight", icon: Bird },
  { to: "/games/roulette", label: "Roulette", icon: CircleDot },
  { to: "/games/higher-lower", label: "Higher / Lower", icon: ArrowUpDown },
  { to: "/games/wheel", label: "Spin the Wheel", icon: Disc3 },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-neon grid place-items-center glow-primary">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-lg tracking-tight text-gradient-neon">VirtuaBet</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Play Money</div>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} active={pathname === n.to} />
          ))}
        </div>
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Gamepad2 className="w-3 h-3" /> Games
          </div>
          <div className="space-y-1">
            {games.map((g) => (
              <NavItem key={g.to} {...g} active={pathname === g.to} />
            ))}
          </div>
        </div>
      </nav>
      <div className="p-4 text-[10px] text-muted-foreground border-t border-sidebar-border">
        Simulation only. No real money.
      </div>
    </aside>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-all",
        active
          ? "bg-gradient-to-r from-primary/25 to-transparent text-foreground border border-primary/40 glow-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
