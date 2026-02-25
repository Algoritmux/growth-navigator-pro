import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Helper simple to decode JWT on client side
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: any) => {
        const decoded = decodeJwt(credentialResponse.credential);
        const email = decoded?.email;

        if (!email || email.toLowerCase() !== "guilherme.pubmkt@gmail.com") {
            toast.error("Acesso Negado", {
                description: "Este e-mail não possui permissão para acessar a área administrativa."
            });
            return;
        }

        login({
            token: credentialResponse.credential,
            email: email,
            name: decoded?.name,
            picture: decoded?.picture
        });

        toast.success("Bem-vindo!", {
            description: `Login realizado como ${decoded?.name}`
        });
        navigate("/admin/blog");
    };

    return (
        <div className="min-h-screen bg-hero flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="mb-8 flex justify-center">
                    <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar para o site
                    </Link>
                </div>

                <div className="bg-background/10 backdrop-blur-xl border border-white/10 p-12 rounded-[40px] shadow-2xl text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-accent/20">
                        <ShieldCheck className="w-8 h-8 text-accent" />
                    </div>

                    <h1 className="text-3xl font-bold text-primary-foreground mb-4">Acesso Administrativo</h1>
                    <p className="text-primary-foreground/60 mb-10">
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

                <p className="text-center mt-8 text-primary-foreground/30 text-xs">
                    Somente contas autorizadas possuem acesso às funções de edição.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
