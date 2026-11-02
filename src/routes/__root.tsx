import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useReferralCapture } from "@/hooks/useReferralCapture";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Bu yıldız haritada yok</h2>
        <p className="mt-2 text-sm text-muted-foreground">Aradığınız sayfa bulunamadı.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Sayfa yüklenemedi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bir şeyler ters gitti. Yeniden deneyin.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Tekrar dene
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
      { title: "Astrosifre" },
      { name: "description", content: "Ücretsiz astroloji hesaplamaları ve kişisel raporlar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/yukselen", label: "Yükselen" },
  { to: "/dogum-haritasi", label: "Doğum Haritası" },
  { to: "/horary", label: "Horary" },
  { to: "/ruh-esim", label: "Ruh Eşim" },
  { to: "/raporlar", label: "Raporlar" },
] as const;

function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <Link to="/" className="shrink-0 font-display text-xl font-bold text-gold">✦ Astrosifre</Link>
        <nav aria-label="Ana menü" className="flex w-full items-center gap-1 overflow-x-auto text-sm md:w-auto md:flex-wrap">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="shrink-0 rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
          {user ? (
             <Link to="/haritalarim" className="hidden rounded-md border border-primary/40 px-3 py-1.5 text-primary md:inline-flex">Haritalarım</Link>
          ) : (
            <Link to="/auth" className="hidden rounded-md border border-primary/40 px-3 py-1.5 text-primary md:inline-flex">Giriş</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  useReferralCapture();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mobile-page min-h-screen bg-sky">
        <Header />
        <main>
          <Outlet />
        </main>
        <footer className="mt-24 border-t border-border py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Astrosifre · Hesaplamalar eğlence ve kişisel keşif amaçlıdır.
        </footer>
        <MobileNavigation />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
