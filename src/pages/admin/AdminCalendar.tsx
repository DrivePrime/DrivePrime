import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Reservation {
  id: string; prenom: string; nom: string; voiture: string; depart: string; retour: string;
}

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const colorFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h} 65% 45%)`;
};

export default function AdminCalendar() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  useEffect(() => {
    supabase.from("reservations").select("*").then(({ data }) => {
      if (data) setItems(data as Reservation[]);
    });
  }, []);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const reservationsForDay = (day: Date) => {
    const t = day.getTime();
    return items.filter(r => {
      const dep = new Date(r.depart).setHours(0, 0, 0, 0);
      const ret = new Date(r.retour).setHours(0, 0, 0, 0);
      return t >= dep && t <= ret;
    });
  };

  const shift = (n: number) => {
    const d = new Date(cursor); d.setMonth(d.getMonth() + n); setCursor(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Calendrier</h1>
          <p className="text-muted-foreground mt-1">Vue mensuelle des locations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="font-display text-lg w-44 text-center">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</div>
          <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, idx) => {
              if (!day) return <div key={idx} className="min-h-[110px] rounded-md bg-muted/20" />;
              const reservs = reservationsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={idx} className={`min-h-[110px] rounded-md border p-1.5 ${isToday ? "border-primary bg-primary/5" : "border-border bg-card/40"}`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.getDate()}</div>
                  <div className="space-y-1">
                    {reservs.slice(0, 3).map(r => (
                      <div
                        key={r.id}
                        className="text-[10px] px-1.5 py-0.5 rounded text-white truncate"
                        style={{ backgroundColor: colorFor(r.voiture) }}
                        title={`${r.prenom} ${r.nom} — ${r.voiture}`}
                      >
                        {r.voiture} · {r.prenom}
                      </div>
                    ))}
                    {reservs.length > 3 && <div className="text-[10px] text-muted-foreground">+{reservs.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
