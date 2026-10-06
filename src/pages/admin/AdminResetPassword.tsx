import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/*
  Admin password recovery. Reached from the Supabase "Reset password" email (the app forwards
  the link here, see main.tsx). The Supabase client reads the recovery data from the URL by
  itself (detectSessionInUrl) and opens a short-lived recovery session; the new password is
  then set with the official supabase.auth.updateUser().
  Nothing secret is read, shown, logged or stored by this page: no token, no password.
*/

type Step = "checking" | "ready" | "saving" | "done" | "invalid";

const MIN_LENGTH = 8;
const WAIT_MS = 5000; // how long to wait for the recovery session before calling the link invalid

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("status") === "invalid"
      ? "invalid"
      : "checking",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const recovered = useRef(false);

  useEffect(() => {
    document.title = "Nouveau mot de passe | Drive Prime";
    let robots = document.head.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
  }, []);

  // Wait for the recovery session opened from the link
  useEffect(() => {
    if (step !== "checking") return;
    let active = true;
    const ready = () => {
      if (!active || recovered.current) return;
      recovered.current = true;
      setStep("ready");
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) ready();
    });
    // The link may already have been processed before this listener was attached
    // (Supabase may already have opened the session before this listener was attached:
    // the ?flow=recovery marker, set when the link was forwarded, says the session comes from it)
    const fromLink =
      new URLSearchParams(window.location.search).get("flow") === "recovery";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && fromLink) ready();
    });
    const timer = window.setTimeout(() => {
      if (active && !recovered.current) setStep("invalid");
    }, WAIT_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [step]);

  // Never leave recovery data in the address bar
  useEffect(() => {
    if ((step === "ready" || step === "invalid") && window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [step]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) {
      setError(
        `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`,
      );
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setStep("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      const msg = updateError.message.toLowerCase();
      setError(
        msg.includes("different") || msg.includes("same")
          ? "Choisissez un mot de passe différent de l'ancien."
          : msg.includes("session") ||
              msg.includes("jwt") ||
              msg.includes("expired")
            ? "Le lien de récupération a expiré. Demandez un nouveau lien."
            : msg.includes("weak") || msg.includes("password should")
              ? "Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié."
              : "Le mot de passe n'a pas pu être modifié. Réessayez dans quelques instants.",
      );
      setStep("ready");
      return;
    }
    // End the recovery context: the admin signs in again with the new password
    setPassword("");
    setConfirm("");
    await supabase.auth.signOut();
    setStep("done");
    window.setTimeout(() => navigate("/admin", { replace: true }), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            {step === "done" ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : step === "invalid" ? (
              <TriangleAlert className="w-6 h-6 text-primary" />
            ) : (
              <KeyRound className="w-6 h-6 text-primary" />
            )}
          </div>
          <CardTitle className="font-display">
            {step === "done"
              ? "Mot de passe modifié"
              : step === "invalid"
                ? "Lien invalide ou expiré"
                : "Nouveau mot de passe"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Drive Prime · Administration
          </p>
        </CardHeader>
        <CardContent>
          {step === "checking" && (
            <p role="status" className="text-sm text-muted-foreground">
              Vérification du lien…
            </p>
          )}

          {step === "invalid" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ce lien de récupération n'est plus valable (il a expiré ou a
                déjà été utilisé). Demandez un nouveau lien depuis la page de
                connexion.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/login">Retour à la connexion</Link>
              </Button>
            </div>
          )}

          {step === "done" && (
            <div role="status" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Votre mot de passe a été mis à jour. Vous allez être redirigé
                vers la connexion administrateur.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin" replace>
                  Se connecter
                </Link>
              </Button>
            </div>
          )}

          {(step === "ready" || step === "saving") && (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="new-password" className="field-label">
                  Nouveau mot de passe
                </label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  aria-describedby="password-rule"
                />
                <p
                  id="password-rule"
                  className="mt-1.5 text-xs text-muted-foreground"
                >
                  Au moins {MIN_LENGTH} caractères.
                </p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="field-label">
                  Confirmer le nouveau mot de passe
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={step === "saving"}
              >
                {step === "saving"
                  ? "Modification…"
                  : "Modifier le mot de passe"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
