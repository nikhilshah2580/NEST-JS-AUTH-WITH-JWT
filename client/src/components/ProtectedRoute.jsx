import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { status } = useAuth();
  if (status === "loading") {
    return <p className="py-16 text-center text-sm text-[#737a70]">Loading your profile…</p>;
  }
  return status === "authenticated" ? <Outlet /> : <Navigate to="/signin" replace />;
}
