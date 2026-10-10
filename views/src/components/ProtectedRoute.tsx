import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6f3]">
        <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d9ded4] border-t-[#52654b]" />
          Checking your session…
        </div>
      </main>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
