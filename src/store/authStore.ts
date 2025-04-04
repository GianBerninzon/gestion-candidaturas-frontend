import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>((set) => {
    // Intentar recuperar el token y usuario del localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user')

    return{
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,

        login: (user, token) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true });
        },

        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
        }    
    };
});

export default useAuthStore;