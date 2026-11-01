import { Button } from "@/components/ui/button";
import { ANALYSIS_DESKS, type AnalystCode } from "@/lib/analysis-desks";

export function DeskSelector({ value, onChange }: { value: AnalystCode; onChange: (value: AnalystCode) => void }) {
  return (
    <div role="group" aria-label="Analiz seçimi" className="grid grid-cols-3 gap-2">
      {ANALYSIS_DESKS.map((code) => (
        <Button key={code} type="button" variant={value === code ? "default" : "outline"}
          aria-pressed={value === code} onClick={() => onChange(code)} className="h-12 px-2 font-display text-xs sm:text-sm">
          {code}
        </Button>
      ))}
    </div>
  );
}