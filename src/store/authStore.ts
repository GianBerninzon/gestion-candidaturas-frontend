import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const useAuthStore = create<AuthState>((set, get) => {
    // Intentar recuperar el token y usuario del localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user')

    return{
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,

        login: (user, token) => {
            // Asegurarse de que el token tiene el formato correcto para el backend
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            //guardar en localstorage
            localStorage.setItem('token', formattedToken);
            localStorage.setItem('user', JSON.stringify(user));

            //actualizar el estado
            set({ user, token: formattedToken, isAuthenticated: true });

            console.log('🔑 Login exitoso', { username: user.username, role: user.role});
        },

        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
            console.log('👋 Logout completado');
        },
        
        //Meotodo util para verificar roles
        hasRole: (role: string) => {
            const { user } = get();
            if(!user) return false;

            // Comprobar si el usuario tiene el rol especificado
            // Esto es util para verificar permisos en el frontend
            return user.role === role;
        }
    };
});

export default useAuthStore;