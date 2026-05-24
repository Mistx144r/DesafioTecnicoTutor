import { useAuth } from "../contexts/AuthContext.tsx";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const { status } = useAuth();

    if (status === "loading") return <div>Carregando...</div>;
    if (status === "unauthenticated") return <Navigate to="/login" />;

    return <Outlet />;
}

export default ProtectedRoute;