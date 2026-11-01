import { Link } from "@tanstack/react-router";
import { Compass, Heart, Home, ScrollText, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function MobileNavigation() {
  const { user } = useAuth();
  const items = [
    { to: "/", label: "Bugün", icon: Home },
    { to: "/yukselen", label: "Yükselen", icon: Compass },
    { to: "/ruh-esim", label: "Ruh Eşim", icon: Heart },
    { to: "/raporlar", label: "Raporlar", icon: ScrollText },
    { to: user ? "/haritalarim" : "/auth", label: "Hesabım", icon: UserRound },
  ] as const;
  return (
    <nav aria-label="Alt menü" className="mobile-navigation fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pt-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Button key={to} asChild variant="ghost" className="h-14 min-w-0 flex-col gap-1 px-0 text-muted-foreground">
            <Link to={to} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-foreground" }}>
              <Icon aria-hidden="true" className="size-5" /><span className="text-[10px] font-semibold">{label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}