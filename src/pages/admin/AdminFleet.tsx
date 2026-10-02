import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Wrench, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getStatus } from "@/admin/utils";

interface Vehicule { id: string; nom: string; statut_manuel: string | null; }
interface Reservation { id: string; voiture: string; depart: string; retour: string; }

export default function AdminFleet() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [newName, setNewName] = useState("");

  const load = async () => {
    const [{ data: v }, { data: r }] = await Promise.all([
      supabase.from("vehicules").select("*").order("nom"),
      supabase.from("reservations").select("id,voiture,depart,retour"),
    ]);
    if (v) setVehicules(v as Vehicule[]);
    if (r) setReservations(r as Reservation[]);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("vehicules").insert({ nom: newName.trim() });
    if (error) { toast.error(error.message); return; }
    setNewName("");
    toast.success("Véhicule ajouté");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce véhicule ?")) return;
    const { error } = await supabase.from("vehicules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Véhicule supprimé");
    load();
  };

  const toggleMaintenance = async (v: Vehicule) => {
    const next = v.statut_manuel === "maintenance" ? null : "maintenance";
    const { error } = await supabase.from("vehicules").update({ statut_manuel: next }).eq("id", v.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const getVehicleInfo = (v: Vehicule) => {
    if (v.statut_manuel === "maintenance") {
      return { status: "Maintenance", icon: "🔧", variant: "outline" as const, next: null };
    }
    const active = reservations
      .filter(r => r.voiture === v.nom && getStatus(r.depart, r.retour) === "En cours")
      .sort((a, b) => a.retour.localeCompare(b.retour))[0];
    if (active) {
      return { status: "En location", icon: "🔴", variant: "destructive" as const, next: `Disponible le ${formatDate(active.retour)}` };
    }
    const upcoming = reservations
      .filter(r => r.voiture === v.nom && getStatus(r.depart, r.retour) === "À venir")
      .sort((a, b) => a.depart.localeCompare(b.depart))[0];
    return {
      status: "Disponible",
      icon: "✅",
      variant: "default" as const,
      next: upcoming ? `Prochaine loc. : ${formatDate(upcoming.depart)}` : "Aucune réservation à venir",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Flotte</h1>
        <p className="text-muted-foreground mt-1">{vehicules.length} véhicule(s)</p>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-2">
          <Input placeholder="Nom du nouveau véhicule" value={newName} onChange={e => setNewName(e.target.value)} />
          <Button onClick={add}><Plus className="w-4 h-4" /> Ajouter</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicules.map(v => {
                const info = getVehicleInfo(v);
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.nom}</TableCell>
                    <TableCell><Badge variant={info.variant}>{info.icon} {info.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{info.next}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => toggleMaintenance(v)}>
                        {v.statut_manuel === "maintenance"
                          ? <><RotateCcw className="w-4 h-4" /> Remettre en service</>
                          : <><Wrench className="w-4 h-4" /> Maintenance</>}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(v.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
