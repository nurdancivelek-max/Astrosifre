import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceSearch } from "@/components/PlaceSearch";
import type { Place } from "@/lib/geo";

export interface BirthData { name?: string; date: string; time: string; place: Place }

export function BirthForm({
  onSubmit, initial, submitLabel = "Hesapla", askName = false, timeOptional = false,
}: {
  onSubmit: (d: BirthData) => void;
  initial?: Partial<BirthData>;
  submitLabel?: string;
  askName?: boolean;
  timeOptional?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [place, setPlace] = useState<Place | null>(initial?.place ?? null);
  const [err, setErr] = useState("");
  const [unknown, setUnknown] = useState(false);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!date || !place || (!timeOptional && !unknown && !time)) return setErr("Lütfen tarih, şehir ve saati girin ya da “saatimi bilmiyorum” kutusunu işaretleyin.");
        setErr("");
        onSubmit({ name: name || undefined, date, time: unknown ? (timeOptional ? "" : "12:00") : time || (timeOptional ? "" : "12:00"), place });
      }}
    >
      {askName && (
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="bf-name">İsim</Label>
          <Input id="bf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kimin haritası?" />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="bf-date">Doğum tarihi</Label>
        <Input id="bf-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bf-time">Doğum saati</Label>
        <Input id="bf-time" type="time" value={unknown ? "12:00" : time} disabled={unknown} onChange={(e) => setTime(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} className="h-4 w-4 accent-primary" />
          Doğum saatimi bilmiyorum (12:00 alınır)
        </label>
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label>Doğum yeri</Label>
        <PlaceSearch value={place} onChange={setPlace} />
      </div>
      {err && <p className="text-sm text-destructive sm:col-span-2">{err}</p>}
      <Button type="submit" className="sm:col-span-2 bg-gold text-primary-foreground shadow-glow">{submitLabel}</Button>
    </form>
  );
}
