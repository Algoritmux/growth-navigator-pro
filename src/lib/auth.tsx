import React, { createContext, useContext, useState, useEffect } from "react";

export type AdminUser = {
    token: string;
    email: string;
    name?: string;
    picture?: string;
};

interface AuthContextType {
    user: AdminUser | null;
    login: (credentialResponse: AdminUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("admin_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser) as AdminUser);
        }
    }, []);

    const login = (userData: AdminUser) => {
        setUser(userData);
        localStorage.setItem("admin_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("admin_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
