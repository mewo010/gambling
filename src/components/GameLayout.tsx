import { ProvablyFair } from "./ProvablyFair";

export function GameLayout({
  title,
  subtitle,
  icon,
  game,
  children,
  side,
  flash,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  game: string;
  children: React.ReactNode;
  side: React.ReactNode;
  flash?: "win" | "loss" | null;
}) {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/30 to-neon/20 grid place-items-center border border-primary/30">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div
          className={
            "card-elev p-5 md:p-8 min-h-[460px] relative overflow-hidden " +
            (flash === "win" ? "animate-flash-win" : flash === "loss" ? "animate-flash-loss" : "")
          }
        >
          {children}
        </div>
        <div className="space-y-6">
          {side}
          <ProvablyFair game={game} />
        </div>
      </div>
    </div>
  );
}
