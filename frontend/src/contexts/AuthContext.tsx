    import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
    id: number;
    nome: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextData {
    user: AuthUser | null;
    status: AuthStatus;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | null>(null);

async function fetchMe(): Promise<AuthUser> {
    const response = await fetch("/api/auth/me", {
        method: "POST",
        credentials: "include",
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.erro);
    return data.dados;
}

async function logoutRequest(): Promise<void> {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}

export async function apiFetch(url: string, options?: RequestInit) {
    const response = await fetch(url, { credentials: 'include', ...options })
    const data = await response.json()

    if (!data.ok && response.status === 401) {
        window.dispatchEvent(new Event('unauthorized'))
    }

    return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const me = await fetchMe()
            setUser(me)
            setStatus('authenticated')
            if (window.location.pathname === '/login') {
                navigate('/dashboard')
            }
        } catch {
            setUser(null)
            setStatus('unauthenticated') // ← precisa chegar aqui

            if (window.location.pathname !== '/login') {
                navigate('/login')
            }
        }
    }

    useEffect(() => {
        checkAuth()
        const handler = () => {
            setUser(null)
            setStatus('unauthenticated')
            navigate('/login')
        }
        window.addEventListener('unauthorized', handler)
        return () => window.removeEventListener('unauthorized', handler)
    }, [])

    const logout = async () => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
            setStatus("unauthenticated");
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, status, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
    return context;
}