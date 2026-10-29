import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type Place } from "@/lib/geo";

export function PlaceSearch({ value, onChange }: { value: Place | null; onChange: (p: Place) => void }) {
  const [q, setQ] = useState(value?.name ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchPlaces(q).then(setResults).catch(() => setResults([])), 300);
    return () => clearTimeout(t);
  }, [q, open]);

  return (
    <div className="relative">
      <Input
        value={q}
        placeholder="Şehir yazın, örn. İzmir"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        aria-label="Doğum yeri"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-glow">
          {results.map((r) => (
            <li key={`${r.latitude},${r.longitude}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => { onChange(r); setQ(r.name); setOpen(false); }}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
