import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/leadsApi";

const LeadMagnetSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await subscribeToNewsletter({
        name,
        email,
        source: "home-lead-magnet",
      });

      toast.success("Inscrição realizada!", {
        description: "Obrigado! Em breve você receberá os insights.",
      });

      setName("");
      setEmail("");
    } catch (error) {
      toast.error("Não foi possível salvar sua inscrição.", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-6">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5 sm:mb-4">
            Insights semanais sobre crescimento previsível
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-9 sm:mb-10">
            Receba artigos estratégicos sobre marketing, vendas e dados — direto
            da prática, sem teoria genérica.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-lg flex-col gap-5 mx-auto sm:flex-row sm:gap-3"
          >
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block box-border w-full h-[52px] min-h-[52px] px-5 py-3 text-base leading-normal rounded-xl border border-[#e4d8ea] bg-white text-[#1f0b2e] placeholder:text-[#7b668c] placeholder:text-base focus:outline-none focus:ring-2 focus:ring-[#8b1ccf]/30 sm:h-10 sm:min-h-10 sm:flex-1 sm:px-4 sm:py-2 sm:text-sm sm:placeholder:text-sm"
            />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block box-border w-full h-[52px] min-h-[52px] px-5 py-3 text-base leading-normal rounded-xl border border-[#e4d8ea] bg-white text-[#1f0b2e] placeholder:text-[#7b668c] placeholder:text-base focus:outline-none focus:ring-2 focus:ring-[#8b1ccf]/30 sm:h-10 sm:min-h-10 sm:flex-1 sm:px-4 sm:py-2 sm:text-sm sm:placeholder:text-sm"
            />
            <Button
              type="submit"
              variant="hero"
              className="h-[54px] w-full px-6 text-sm sm:h-12 sm:w-auto sm:text-xs"
              disabled={loading}
            >
              {loading ? "ENVIANDO..." : "ENVIAR"}{" "}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
          <p className="text-sm sm:text-xs text-muted-foreground mt-5 sm:mt-4">
            Sem spam. Cancele quando quiser.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadMagnetSection;
