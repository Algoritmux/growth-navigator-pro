import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, MessageSquare, Star, Users, Mic, Rocket, Calendar, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/servicesStore";
import SEO from "@/components/SEO";

const testimonials = [
    {
        name: "Ricardo Mendes",
        role: "CEO na TechScale",
        text: "A mentoria do Guilherme mudou o jogo. Em 6 meses, estruturamos processos de GTM que finalmente nos deram previsibilidade.",
        avatar: "RM"
    },
    {
        name: "Ana Silveira",
        role: "Diretora Comercial",
        text: "A palestra sobre IA aplicada a vendas foi o ponto alto da nossa convenção anual. Conteúdo extremamente prático e direto.",
        avatar: "AS"
    },
    {
        name: "Marcos Oliveira",
        role: "Head de Growth",
        text: "O diagnóstico de GTM foi cirúrgico. Identificamos gargalos que não víamos há anos na nossa operação.",
        avatar: "MO"
    }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Serviços de Growth e IA"
                description="Mentoria Executiva, Palestras e Consultoria de GTM para escala de negócios."
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "itemListElement": SERVICES.map((s, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "item": {
                            "@type": "Service",
                            "name": s.title,
                            "description": s.description
                        }
                    }))
                }}
            />
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-hero">
                    <div className="absolute inset-0 dot-pattern opacity-20" />
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />

                    <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                                Do Diagnóstico à Execução
                            </span>
                            <h1 className="text-4xl sm:text-6xl font-bold text-primary-foreground mt-4 mb-6">
                                Soluções de Crescimento para o seu Negócio
                            </h1>
                            <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto mb-10">
                                Diferentes formatos para diferentes momentos de maturidade. Escolha como quer transformar sua operação comercial hoje.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Services Detailed Sections */}
                {SERVICES.map((service, index) => {
                    const isEven = index % 2 === 0;
                    const Icon = service.icon;

                    return (
                        <section
                            key={service.slug}
                            className={`py-24 ${isEven ? 'bg-background' : 'bg-secondary/30'}`}
                        >
                            <div className="container mx-auto px-4 lg:px-8">
                                <div className={`flex flex-col lg:flex-row items-center gap-12 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                                    {/* Text Content */}
                                    <motion.div
                                        className="flex-1"
                                        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="flex iems-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-xs font-mono text-accent uppercase tracking-widest self-center">
                                                {service.title.split(' ')[0]}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                                            {service.title}
                                        </h2>

                                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                            {service.description}
                                        </p>

                                        <ul className="space-y-4 mb-10">
                                            {service.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 bg-accent/10 rounded-full p-0.5">
                                                        <Check className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <span className="text-foreground/80 font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex flex-wrap gap-4">
                                            <Button variant="accent" size="lg" className="rounded-xl px-8 text-white hover:text-white" asChild>
                                                <a href="https://wa.me/5512992474969" target="_blank" rel="noreferrer">
                                                    Consultar disponibilidade
                                                </a>
                                            </Button>
                                        </div>
                                    </motion.div>

                                    {/* Image Placeholder */}
                                    <motion.div
                                        className="flex-1 w-full"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl bg-muted group">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                                <p className="text-white/60 text-sm font-medium">Foto do Evento / Serviço: {service.title}</p>
                                            </div>
                                            {/* Imagem de exemplo ou fallback */}
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />

                                            {/* Float badge */}
                                            <div className="absolute bottom-6 right-6 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-xs font-bold text-foreground z-30 shadow-lg">
                                                Resultados Reais
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* Social Proof / Testimonials */}
                <section className="py-24 bg-foreground relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />

                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-background mb-4">
                                O que dizem sobre o trabalho
                            </h2>
                            <p className="text-background/50 text-lg">
                                Prova social de quem já passou pelo processo de transformação.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <motion.div
                                    key={i}
                                    className="p-8 rounded-3xl bg-background/5 border border-background/10 backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                >
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                        ))}
                                    </div>
                                    <p className="text-background/80 text-lg italic mb-8 leading-relaxed">
                                        "{t.text}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-background uppercase tracking-wider text-sm">{t.name}</div>
                                            <div className="text-xs text-background/40">{t.role}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
                        <div className="max-w-4xl mx-auto p-12 rounded-[40px] bg-hero border border-primary-foreground/10 text-primary-foreground relative overflow-hidden">
                            <div className="absolute inset-0 dot-pattern opacity-10" />

                            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                                Vamos acelerar sua operação comercial?
                            </h2>
                            <p className="text-primary-foreground/60 text-lg mb-10 max-w-2xl mx-auto">
                                Agende uma conversa diagnóstica para entendermos qual o melhor caminho para o seu momento atual.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="accent" size="lg" className="rounded-xl px-10 py-7 text-lg group text-white hover:text-white" asChild>
                                    <a href="https://wa.me/5512992474969" target="_blank" rel="noreferrer">
                                        <MessageCircle className="mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
                                        Chamar no WhatsApp
                                    </a>
                                </Button>
                                <Button variant="hero-outline" size="lg" className="rounded-xl px-10 py-7 text-lg group" asChild>
                                    <a href="#">
                                        <Calendar className="mr-2 w-5 h-5 opacity-50 group-hover:opacity-100" />
                                        Ver agenda / Calendly
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}