import { Navigate, useLocation } from "react-router-dom";
import { useAdminStatus } from "./session";

/** Renders admin pages only for a signed-in Supabase user listed in public.admin_users. */
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
