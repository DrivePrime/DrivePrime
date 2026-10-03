import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, useAdminStatus } from "@/admin/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAdminStatus();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/admin";

  useEffect(() => {
    if (status === "admin") navigate(from, { replace: true });
  }, [status, from, navigate]);

  useEffect(() => {
    document.title = "Administration | Drive Prime";
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        setError(
          authError.message.toLowerCase().includes("invalid")
            ? "Email ou mot de passe incorrect."
            : "Connexion impossible pour le moment. Réessayez dans quelques instants.",
        );
        return;
      }
      if (!(await checkIsAdmin())) {
        await supabase.auth.signOut();
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }
      navigate(from, { replace: true });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-display">Accès administrateur</CardTitle>
          <p className="text-sm text-muted-foreground">Drive Prime</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="field-label">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="field-label">
                Mot de passe
              </label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
