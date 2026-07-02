import React, { createContext, useContext, useState } from "react";

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

function getSavedAdminUser(): AdminUser | null {
    if (typeof window === "undefined") return null;

    try {
        const savedUser = localStorage.getItem("admin_user");
        return savedUser ? (JSON.parse(savedUser) as AdminUser) : null;
    } catch (error) {
        console.error("Failed to parse admin_user from localStorage", error);
        localStorage.removeItem("admin_user");
        return null;
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(() => getSavedAdminUser());

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
