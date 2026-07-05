import React, { createContext, useContext, useState } from "react";
import { getSavedAdminUser, isAdminTokenExpired, type AdminUser } from "./authSession";

export type { AdminUser } from "./authSession";

interface AuthContextType {
    user: AdminUser | null;
    login: (credentialResponse: AdminUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const isAuthenticated = !!user && !isAdminTokenExpired(user);

    return (
        <AuthContext.Provider value={{ user: isAuthenticated ? user : null, login, logout, isAuthenticated }}>
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
