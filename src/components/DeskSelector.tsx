import { ANALYSIS_DESKS, type AnalystCode } from "@/lib/analysis-desks";
import altair from "@/assets/desk-altair.jpg";
import vega from "@/assets/desk-vega.jpg";
import sirius from "@/assets/desk-sirius.jpg";
import { cn } from "@/lib/utils";

const IMAGES: Record<AnalystCode, string> = { ALTAIR: altair, VEGA: vega, SIRIUS: sirius };

export function DeskSelector({ value, onChange }: { value: AnalystCode; onChange: (value: AnalystCode) => void }) {
  return (
    <div role="group" aria-label="Analiz seçimi" className="grid grid-cols-3 gap-3">
      {ANALYSIS_DESKS.map((code) => {
        const active = value === code;
        return (
          <button key={code} type="button" aria-pressed={active} aria-label={code} onClick={() => onChange(code)}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 transition-all",
              active ? "border-primary shadow-glow scale-[1.03]" : "border-border opacity-75 hover:opacity-100",
            )}>
            <img src={IMAGES[code]} alt={code} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center font-display text-[11px] tracking-[0.2em] text-foreground sm:text-xs">
              ✦ {code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
