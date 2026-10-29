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

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!date || !place || (!timeOptional && !time)) return setErr("Lütfen tüm alanları doldurun ve listeden bir şehir seçin.");
        setErr("");
        onSubmit({ name: name || undefined, date, time: time || (timeOptional ? "" : "12:00"), place });
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
        <Label htmlFor="bf-time">Doğum saati {timeOptional && <span className="text-muted-foreground">(bilmiyorsanız boş bırakın)</span>}</Label>
        <Input id="bf-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
