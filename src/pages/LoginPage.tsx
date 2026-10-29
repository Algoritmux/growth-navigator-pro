import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { validateAdminToken } from "@/lib/adminApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const PLACEHOLDER_GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com";

// Ignore placeholder values from .env to avoid invalid_client at runtime.
const RESOLVED_GOOGLE_CLIENT_ID =
    GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== PLACEHOLDER_GOOGLE_CLIENT_ID
        ? GOOGLE_CLIENT_ID
        : "934848081124-584769e5ibh5jgrjptmaka4tpa9uvq1k.apps.googleusercontent.com";

/**
 * O script do Google Sign-In só é carregado aqui, e não em todo o site
 * (antes o provedor envolvia o app inteiro em main.tsx).
 */
const LoginPage = () => (
    <GoogleOAuthProvider clientId={RESOLVED_GOOGLE_CLIENT_ID}>
        <LoginContent />
    </GoogleOAuthProvider>
);

const LoginContent = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        const credential = credentialResponse.credential;
        if (!credential) {
            toast.error("Falha no login", {
                description: "Credencial invÃ¡lida retornada pelo Google."
            });
            return;
        }

        try {
            const admin = await validateAdminToken(credential);

            login({
                token: credential,
                email: admin.email,
                name: admin.name,
                picture: admin.picture
            });

            toast.success("Bem-vindo!", {
                description: `Login realizado como ${admin.name || admin.email}`
            });
            navigate("/admin");
        } catch (error) {
            toast.error("Acesso Negado", {
                description: error instanceof Error ? error.message : "Nao foi possivel validar sua permissao administrativa."
            });
            return;
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-[0.05]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="mb-8 flex justify-center">
                    <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Voltar para o site
                    </Link>
                </div>

                <div className="bg-white border border-border p-12 rounded-[40px] shadow-soft text-center">
                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/10">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-4">Acesso Administrativo</h1>
                    <p className="text-muted-foreground mb-10">
                        Entre com sua conta Google para gerenciar os conteúdos do site.
                    </p>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => console.log("Login Failed")}
                            theme="filled_blue"
                            shape="pill"
                            size="large"
                        />
                    </div>
                </div>

                <p className="text-center mt-8 text-muted-foreground/40 text-xs">
                    Somente contas autorizadas possuem acesso às funções de edição.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
