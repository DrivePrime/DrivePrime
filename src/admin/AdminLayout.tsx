import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Car, Calendar, LogOut } from "lucide-react";
import { signOutAdmin } from "./AdminAuth";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/reservations", label: "Réservations", icon: ClipboardList },
  { to: "/admin/flotte", label: "Flotte", icon: Car },
  { to: "/admin/calendrier", label: "Calendrier", icon: Calendar },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = async () => {
    await signOutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="font-display text-xl font-semibold text-primary">Drive Prime</div>
          <div className="text-xs text-muted-foreground mt-1">Espace administrateur</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
