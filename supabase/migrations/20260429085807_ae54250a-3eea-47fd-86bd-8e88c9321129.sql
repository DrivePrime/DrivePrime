
CREATE TABLE public.vehicules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL UNIQUE,
  statut_manuel text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  telephone text NOT NULL,
  voiture text NOT NULL,
  depart date NOT NULL,
  retour date NOT NULL,
  nb_jours integer NOT NULL,
  prix_total numeric NOT NULL DEFAULT 0,
  avance numeric NOT NULL DEFAULT 0,
  ville text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Admin section uses a shared hardcoded password (no Supabase auth users).
-- Therefore policies allow public access to anon role. The /admin route is gated client-side.
CREATE POLICY "public read vehicules" ON public.vehicules FOR SELECT USING (true);
CREATE POLICY "public write vehicules" ON public.vehicules FOR INSERT WITH CHECK (true);
CREATE POLICY "public update vehicules" ON public.vehicules FOR UPDATE USING (true);
CREATE POLICY "public delete vehicules" ON public.vehicules FOR DELETE USING (true);

CREATE POLICY "public read reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "public write reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "public update reservations" ON public.reservations FOR UPDATE USING (true);
CREATE POLICY "public delete reservations" ON public.reservations FOR DELETE USING (true);

INSERT INTO public.vehicules (nom) VALUES
  ('Golf 8'),
  ('Golf 8.5 R-Line'),
  ('Clio 5 Auto'),
  ('Clio 5 Manuel'),
  ('Range Rover'),
  ('Porsche')
ON CONFLICT (nom) DO NOTHING;
