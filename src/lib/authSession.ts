const ADMIN_STORAGE_KEY = "admin_user";

export type AdminUser = {
    token: string;
    email: string;
    name?: string;
    picture?: string;
};

export type DecodedJwt = {
    email?: string;
    email_verified?: boolean | string;
    exp?: number;
    name?: string;
    picture?: string;
};

export function decodeJwtPayload(token: string): DecodedJwt | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64).split("").map((char) => {
            return `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`;
        }).join(""));

        return JSON.parse(jsonPayload) as DecodedJwt;
    } catch {
        return null;
    }
}

export function isAdminTokenExpired(user: AdminUser | null): boolean {
    if (!user?.token) return true;

    const decoded = decodeJwtPayload(user.token);
    if (!decoded?.exp) return true;

    return decoded.exp * 1000 <= Date.now() + 30_000;
}

export function getSavedAdminUser(): AdminUser | null {
    if (typeof window === "undefined") return null;

    try {
        const savedUser = localStorage.getItem(ADMIN_STORAGE_KEY);
        const user = savedUser ? (JSON.parse(savedUser) as AdminUser) : null;

        if (isAdminTokenExpired(user)) {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            return null;
        }

        return user;
    } catch (error) {
        console.error("Failed to parse admin_user from localStorage", error);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        return null;
    }
}

export function getAdminAuthHeaders(): HeadersInit {
    const user = getSavedAdminUser();

    if (!user?.token) {
        throw new Error("Sessao administrativa expirada. Entre novamente.");
    }

    return {
        Authorization: `Bearer ${user.token}`,
    };
}
