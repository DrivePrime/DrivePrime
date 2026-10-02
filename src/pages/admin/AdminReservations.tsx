import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { daysBetween, formatDate, getStatus } from "@/admin/utils";

interface Reservation {
  id: string; prenom: string; nom: string; telephone: string;
  voiture: string; depart: string; retour: string;
  nb_jours: number; prix_total: number; avance: number; ville: string | null;
}

interface Vehicule { id: string; nom: string; }

const empty = {
  prenom: "", nom: "", telephone: "", voiture: "",
  depart: "", retour: "", ville: "", prix_total: 0, avance: 0,
};

export default function AdminReservations() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });

  const load = async () => {
    const [{ data: r }, { data: v }] = await Promise.all([
      supabase.from("reservations").select("*").order("depart", { ascending: false }),
      supabase.from("vehicules").select("*").order("nom"),
    ]);
    if (r) setItems(r as Reservation[]);
    if (v) setVehicules(v as Vehicule[]);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setOpen(true); };
  const openEdit = (r: Reservation) => {
    setForm({
      prenom: r.prenom, nom: r.nom, telephone: r.telephone, voiture: r.voiture,
      depart: r.depart, retour: r.retour, ville: r.ville ?? "",
      prix_total: r.prix_total, avance: r.avance,
    });
    setEditId(r.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.prenom || !form.nom || !form.telephone || !form.voiture || !form.depart || !form.retour) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    const nb_jours = daysBetween(form.depart, form.retour);
    const payload = { ...form, nb_jours, ville: form.ville || null };
    const { error } = editId
      ? await supabase.from("reservations").update(payload).eq("id", editId)
      : await supabase.from("reservations").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Réservation modifiée" : "Réservation créée");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation supprimée");
    load();
  };

  const filtered = items.filter(r => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${r.prenom} ${r.nom} ${r.voiture}`.toLowerCase().includes(q);
  });

  const statusVariant = (s: string) =>
    s === "En cours" ? "default" : s === "À venir" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Réservations</h1>
          <p className="text-muted-foreground mt-1">{items.length} réservation(s) au total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4" /> Nouvelle réservation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Modifier la réservation" : "Nouvelle réservation"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <Input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
              <Input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              <Input placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
              <Select value={form.voiture} onValueChange={v => setForm({ ...form, voiture: v })}>
                <SelectTrigger><SelectValue placeholder="Voiture" /></SelectTrigger>
                <SelectContent>
                  {vehicules.map(v => <SelectItem key={v.id} value={v.nom}>{v.nom}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label className="text-xs text-muted-foreground">Date de départ</label>
                <Input type="date" value={form.depart} onChange={e => setForm({ ...form, depart: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Date de retour</label>
                <Input type="date" value={form.retour} onChange={e => setForm({ ...form, retour: e.target.value })} />
              </div>
              <Input placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />
              <Input type="number" placeholder="Prix total (€)" value={form.prix_total} onChange={e => setForm({ ...form, prix_total: Number(e.target.value) })} />
              <Input type="number" placeholder="Avance (€)" value={form.avance} onChange={e => setForm({ ...form, avance: Number(e.target.value) })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>{editId ? "Enregistrer" : "Créer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher par nom ou voiture..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Voiture</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>Retour</TableHead>
                <TableHead>Jours</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Aucune réservation</TableCell></TableRow>
              ) : filtered.map(r => {
                const status = getStatus(r.depart, r.retour);
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.prenom}</TableCell>
                    <TableCell>{r.nom}</TableCell>
                    <TableCell>{r.voiture}</TableCell>
                    <TableCell>{formatDate(r.depart)}</TableCell>
                    <TableCell>{formatDate(r.retour)}</TableCell>
                    <TableCell>{r.nb_jours}</TableCell>
                    <TableCell>{r.telephone}</TableCell>
                    <TableCell><Badge variant={statusVariant(status)}>{status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
