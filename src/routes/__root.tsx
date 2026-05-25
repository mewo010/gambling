import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-neon">404</h1>
        <p className="mt-4 text-muted-foreground">This table doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex h-10 px-5 rounded-lg bg-primary text-primary-foreground items-center">
          Go home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something broke at the table</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex h-10 px-5 rounded-lg bg-primary text-primary-foreground items-center"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tuff gambling site" },
      { name: "description", content: "Premium virtual casino with 100% play money. Blackjack, Roulette, Cockfight, Higher/Lower and Spin the Wheel." },
      { property: "og:title", content: "Tuff gambling site" },
      { name: "twitter:title", content: "Tuff gambling site" },
      { property: "og:description", content: "Premium virtual casino with 100% play money. Blackjack, Roulette, Cockfight, Higher/Lower and Spin the Wheel." },
      { name: "twitter:description", content: "Premium virtual casino with 100% play money. Blackjack, Roulette, Cockfight, Higher/Lower and Spin the Wheel." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/73b6f1a9-7d31-48b5-b95f-e52505b83b2e/id-preview-2c74cab6--ff39196a-8058-4e52-8642-b9fdc43896d9.lovable.app-1779729512321.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/73b6f1a9-7d31-48b5-b95f-e52505b83b2e/id-preview-2c74cab6--ff39196a-8058-4e52-8642-b9fdc43896d9.lovable.app-1779729512321.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
