import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
    const { status, checkAuth } = useAuth();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    if (status === "loading") return <div>Carregando...</div>;
    if (status === "unauthenticated") return <Navigate to="/login" />;

    return <Outlet />;
}

export default ProtectedRoute;