import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const LeadMagnetSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: connect to email service
    alert("Obrigado! Em breve você receberá os insights.");
    setName("");
    setEmail("");
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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Insights semanais sobre crescimento previsível
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Receba artigos estratégicos sobre marketing, vendas e dados — direto da prática, sem teoria genérica.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 h-12 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" variant="hero" className="h-12 px-6">
              Receber <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Sem spam. Cancele quando quiser.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadMagnetSection;
