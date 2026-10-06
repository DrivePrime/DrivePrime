import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CurrencyProvider } from "@/i18n/CurrencyContext";
import { BookingProvider } from "@/context/BookingContext";
import Index from "./pages/Index";
import VehicleDetail from "./pages/VehicleDetail";
import NotFound from "./pages/NotFound";

// Admin is a separate back-office: keep Supabase, charts and calendars out of the public bundle.
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminResetPassword = lazy(
  () => import("./pages/admin/AdminResetPassword"),
);
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const RequireAdmin = lazy(() =>
  import("./admin/AdminAuth").then((m) => ({ default: m.RequireAdmin })),
);
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminFleet = lazy(() => import("./pages/admin/AdminFleet"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));

/** Context providers shared by the browser app and the build-time prerender. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <BookingProvider>{children}</BookingProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

// Suspense lives here so the build-time render and the browser render share the exact same tree
// (a mismatch in Suspense boundaries breaks hydration).
export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/vehicule/:id" element={<VehicleDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="flotte" element={<AdminFleet />} />
          <Route path="calendrier" element={<AdminCalendar />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
