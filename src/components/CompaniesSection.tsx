import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import algoritmuxLogo from "@/assets/LogoAlgoritmuxCeo.png";
import bluenoteLogo from "@/assets/logoBluenoteCeo.png";
import metadevendasLogo from "@/assets/logoMetaCeo.png";

const companies = [
    {
        name: "Algoritmux",
        logo: algoritmuxLogo,
        valueProp: "Tração escalável com dados e UX",
        support: "Agência focada em conversão e experiência de compra.",
        link: "https://algoritmux.com.br",
        gradient: "from-[#000000] to-[#1A1A1A]"
    },
    {
        name: "Blue Note",
        logo: bluenoteLogo,
        valueProp: "Vendas e Negociação sob demanda",
        support: "Treinamentos estratégicos para acelerar resultados e times.",
        link: "https://bluenote.com.br",
        gradient: "from-[#050505] to-[#202020]"
    },
    {
        name: "Meta de Vendas",
        logo: metadevendasLogo,
        valueProp: "Escalabilidade e Previsibilidade",
        support: "Estruturação de processos e tecnologia para vender mais.",
        link: "https://metadevendas.com.br",
        gradient: "from-[#0A0A0A] to-[#252525]"
    },
];

const CompaniesSection = () => {
    return (
        <section className="py-24 bg-secondary relative overflow-hidden border-t border-border">
            <div className="absolute inset-0 dot-pattern opacity-[0.03] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <motion.div
                    className="text-center max-w-4xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                        Conheça nossas empresas
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
                        O próximo nível do seu sucesso começa aqui
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Três frentes complementares que aplicam uma metodologia validada para estruturar, acelerar e escalar sua operação.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {companies.map((company, i) => (
                        <motion.div
                            key={company.name}
                            className={`flex flex-col items-center p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br ${company.gradient} hover:shadow-glow hover:border-brand-purple/20 transition-all duration-500 group`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <div className="h-16 flex items-center justify-center mb-10">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="max-h-12 w-auto object-contain brightness-125 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                            </div>

                            <div className="text-center mb-10 flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {company.valueProp}
                                </h3>
                                <p className="text-sm text-primary-foreground/50 leading-relaxed font-light">
                                    {company.support}
                                </p>
                            </div>

                            <Button
                                variant="default"
                                className="w-full h-12 rounded-xl font-bold tracking-wide uppercase text-[10px] text-white bg-[#8A10AF] hover:bg-[#8A10AF]/90 border border-white/10 shadow-lg shadow-black/20"
                                asChild
                            >
                                <a href={company.link} target="_blank" rel="noopener noreferrer">
                                    Quero conhecer
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompaniesSection;
