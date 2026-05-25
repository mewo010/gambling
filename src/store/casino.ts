import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameKey = "blackjack" | "cockfight" | "roulette" | "higher-lower" | "wheel";

export interface LogEntry {
  id: string;
  time: number;
  user: string;
  game: string;
  amount: number;
  won: boolean;
}

export interface FakeUser {
  id: string;
  name: string;
  balance: number;
  banned: boolean;
}

interface CasinoState {
  username: string;
  balance: number;
  isAdmin: boolean;
  // rtp: 0 = house always wins, 0.5 = fair, 1 = player feast
  rtp: Record<GameKey, number>;
  wagered: number;
  netHouse: number; // positive => house won
  gamePlays: Record<GameKey, number>;
  logs: LogEntry[];
  users: FakeUser[];

  setUsername: (n: string) => void;
  toggleAdmin: () => void;
  setRtp: (g: GameKey, v: number) => void;
  faucet: () => void;
  resetBalance: () => void;
  /** Apply a settled bet. amountWon is signed: positive = player won net, negative = lost. */
  settleBet: (game: GameKey, stake: number, amountWon: number) => void;
  addLog: (entry: Omit<LogEntry, "id" | "time">) => void;
  banUser: (id: string) => void;
  editUserBalance: (id: string, balance: number) => void;
  /** Returns true if the player should win this round given current RTP. */
  rollOutcome: (game: GameKey, fairProbability: number) => boolean;
}

const INITIAL_USERS: FakeUser[] = [
  { id: "u1", name: "Alpha", balance: 24500, banned: false },
  { id: "u2", name: "NeonShark", balance: 8120, banned: false },
  { id: "u3", name: "RouletteKing", balance: 56240, banned: false },
  { id: "u4", name: "Pedro", balance: 320, banned: false },
  { id: "u5", name: "HighRoller", balance: 142000, banned: false },
  { id: "u6", name: "LuckyDuck", balance: 4400, banned: true },
];

export const useCasino = create<CasinoState>()(
  persist(
    (set, get) => ({
      username: "Player",
      balance: 10000,
      isAdmin: false,
      rtp: {
        blackjack: 0.5,
        cockfight: 0.5,
        roulette: 0.5,
        "higher-lower": 0.5,
        wheel: 0.5,
      },
      wagered: 0,
      netHouse: 0,
      gamePlays: { blackjack: 0, cockfight: 0, roulette: 0, "higher-lower": 0, wheel: 0 },
      logs: [],
      users: INITIAL_USERS,

      setUsername: (n) => set({ username: n }),
      toggleAdmin: () => set({ isAdmin: !get().isAdmin }),
      setRtp: (g, v) => set({ rtp: { ...get().rtp, [g]: v } }),
      faucet: () => set({ balance: get().balance + 5000 }),
      resetBalance: () => set({ balance: 10000 }),

      settleBet: (game, stake, amountWon) => {
        const s = get();
        set({
          balance: Math.max(0, s.balance + amountWon),
          wagered: s.wagered + stake,
          netHouse: s.netHouse - amountWon,
          gamePlays: { ...s.gamePlays, [game]: s.gamePlays[game] + 1 },
        });
      },

      addLog: (entry) =>
        set({
          logs: [
            { ...entry, id: Math.random().toString(36).slice(2), time: Date.now() },
            ...get().logs,
          ].slice(0, 50),
        }),

      banUser: (id) =>
        set({ users: get().users.map((u) => (u.id === id ? { ...u, banned: !u.banned } : u)) }),
      editUserBalance: (id, balance) =>
        set({ users: get().users.map((u) => (u.id === id ? { ...u, balance } : u)) }),

      rollOutcome: (game, fairProbability) => {
        const r = get().rtp[game]; // 0..1
        // Map: r=0.5 => fairProbability; r<0.5 squashes win odds toward 0; r>0.5 toward 1
        const adjusted =
          r < 0.5
            ? fairProbability * (r / 0.5)
            : fairProbability + (1 - fairProbability) * ((r - 0.5) / 0.5);
        return Math.random() < adjusted;
      },
    }),
    {
      name: "virtuabet-state",
      partialize: (s) => ({
        username: s.username,
        balance: s.balance,
        isAdmin: s.isAdmin,
        rtp: s.rtp,
        wagered: s.wagered,
        netHouse: s.netHouse,
        gamePlays: s.gamePlays,
      }),
    },
  ),
);

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
