import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { decodeJwtPayload } from "@/lib/authSession";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        const credential = credentialResponse.credential;
        if (!credential) {
            toast.error("Falha no login", {
                description: "Credencial invÃ¡lida retornada pelo Google."
            });
            return;
        }

        const decoded = decodeJwtPayload(credential);
        const email = decoded?.email;

        if (!email || email.toLowerCase() !== "guilherme.pubmkt@gmail.com" || decoded?.email_verified === false || decoded?.email_verified === "false") {
            toast.error("Acesso Negado", {
                description: "Este e-mail não possui permissão para acessar a área administrativa."
            });
            return;
        }

        login({
            token: credential,
            email: email,
            name: decoded?.name,
            picture: decoded?.picture
        });

        toast.success("Bem-vindo!", {
            description: `Login realizado como ${decoded?.name}`
        });
        navigate("/admin");
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
