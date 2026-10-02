import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/*
  Admin access relies on Supabase Auth + Row Level Security.
  This client-side check only decides what to render; the real protection is the
  database policy (public.is_admin()), which rejects every non-admin request.
*/

export type AdminStatus = "loading" | "signed-out" | "not-admin" | "admin";

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export function useAdminStatus(): { status: AdminStatus; session: Session | null } {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AdminStatus>("loading");

  useEffect(() => {
    let active = true;

    const resolve = async (s: Session | null) => {
      if (!active) return;
      setSession(s);
      if (!s) {
        setStatus("signed-out");
        return;
      }
      const ok = await checkIsAdmin();
      if (active) setStatus(ok ? "admin" : "not-admin");
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer: calling Supabase inside the callback can deadlock the auth client.
      setTimeout(() => resolve(s), 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { status, session };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

export const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { status } = useAdminStatus();

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-sm text-muted-foreground">
        Vérification de la session…
      </div>
    );
  }
  if (status !== "admin") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};
