import { API_BASE_URL } from "./api";
import type { AdminUser } from "./authSession";

type AdminMeResponse = {
    success: true;
    admin: {
        email: string;
        name?: string | null;
        picture?: string | null;
    };
};

export async function validateAdminToken(token: string): Promise<Omit<AdminUser, "token">> {
    const response = await fetch(`${API_BASE_URL}/admin/me.php`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Acesso administrativo negado.");
    }

    const admin = (data as AdminMeResponse).admin;

    return {
        email: admin.email,
        name: admin.name ?? undefined,
        picture: admin.picture ?? undefined,
    };
}
