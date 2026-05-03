/**
 * main.tsx — Demo Mode Entry Point
 *
 * Uses the mock tRPC client from lib/trpc.ts — no server needed.
 * The trpc.Provider is a no-op in demo mode.
 *
 * TO SWITCH TO PRODUCTION:
 *   Replace the trpc import in lib/trpc.ts with the real createTRPCReact version,
 *   then restore this file to use httpBatchStreamLink.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { trpc } from "./lib/trpc";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
