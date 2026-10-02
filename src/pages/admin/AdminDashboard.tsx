import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { getStatus, daysFromToday, formatDate } from "@/admin/utils";

interface Reservation {
  id: string; prenom: string; nom: string; telephone: string;
  voiture: string; depart: string; retour: string;
}

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    supabase.from("reservations").select("*").then(({ data }) => {
      if (data) setReservations(data as Reservation[]);
    });
  }, []);

  const enCours = reservations.filter(r => getStatus(r.depart, r.retour) === "En cours");
  const aVenir = reservations.filter(r => getStatus(r.depart, r.retour) === "À venir");
  const terminees = reservations.filter(r => getStatus(r.depart, r.retour) === "Terminée");

  const alertes = reservations
    .map(r => {
      const dDep = daysFromToday(r.depart);
      const dRet = daysFromToday(r.retour);
      let type: "départ" | "retour" | null = null;
      let days = 0;
      if (dDep >= 0 && dDep < 2) { type = "départ"; days = dDep; }
      else if (dRet >= 0 && dRet < 2) { type = "retour"; days = dRet; }
      return type ? { ...r, type, days } : null;
    })
    .filter(Boolean) as (Reservation & { type: "départ" | "retour"; days: number })[];

  const stats = [
    { label: "En cours", value: enCours.length, icon: Clock, color: "text-blue-400" },
    { label: "À venir", value: aVenir.length, icon: CalendarClock, color: "text-primary" },
    { label: "Terminées", value: terminees.length, icon: CheckCircle2, color: "text-green-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de l'activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-bold mt-1">{s.value}</div>
              </div>
              <s.icon className={`w-10 h-10 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Alertes du jour
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Réservations dont le départ ou le retour est dans moins de 2 jours
          </p>
        </CardHeader>
        <CardContent>
          {alertes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune alerte pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {alertes.map(a => {
                const urgent = a.days === 0;
                return (
                  <div
                    key={a.id + a.type}
                    className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${
                      urgent ? "border-destructive/50 bg-destructive/10" : "border-orange-400/40 bg-orange-400/10"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{a.prenom} {a.nom} — {a.voiture}</div>
                      <div className="text-sm text-muted-foreground">
                        {a.type === "départ" ? "Départ" : "Retour"} le {formatDate(a.type === "départ" ? a.depart : a.retour)}
                        {" · "}{a.telephone}
                      </div>
                    </div>
                    <Badge variant={urgent ? "destructive" : "default"}>
                      {a.days === 0 ? "Aujourd'hui" : a.days === 1 ? "Demain" : `${a.days} j`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
