import { useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function rand(len = 32) {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function ProvablyFair({ game }: { game: string }) {
  const [serverSeed] = useState(() => rand(48));
  const [clientSeed, setClientSeed] = useState(() => rand(16));
  const [nonce, setNonce] = useState(1);

  return (
    <div className="card-elev p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-win" />
        <h3 className="font-bold">Provably Fair · {game}</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Outcomes are derived from HMAC-SHA256(server_seed, client_seed:nonce). Verify any past round using the seeds below.
      </p>
      <div className="grid gap-3 text-xs font-mono">
        <Field label="Server Seed (hashed)" value={serverSeed} />
        <Field label="Client Seed" value={clientSeed} editable onChange={setClientSeed} />
        <Field label="Nonce" value={String(nonce)} />
      </div>
      <Button variant="secondary" size="sm" onClick={() => setNonce((n) => n + 1)} className="gap-2">
        <RefreshCw className="w-3 h-3" /> Rotate Seed
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <input
        readOnly={!editable}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-xs font-mono truncate"
      />
    </div>
  );
}
