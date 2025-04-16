import useAuthStore from "@/store/authStore";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated} = useAuthStore();

    // Si no esta autenticado, redirigir a login
    if(!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si esta autenticado, renderizar los hijos (el componente protegido)
    return <>{children}</>;
};

export default ProtectedRoute;