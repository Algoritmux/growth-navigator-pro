import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import algoritmuxLogo from "@/assets/LogoAlgoritmuxCeo.png";
import bluenoteLogo from "@/assets/logoBluenoteCeo.png";
import metadevendasLogo from "@/assets/logoMetaCeo.png";

const companies = [
    {
        name: "Algoritmux",
        logo: algoritmuxLogo,
        valueProp: "Growth Marketing",
        support:
            "Estruturação de setup digital, tráfego de performance e automações para transformar marketing em um motor previsível de geração de demanda.",
        link: "https://algoritmux.com",
        gradient: "from-[#000000] to-[#1A1A1A]",
    },
    {
        name: "BlueNote",
        logo: bluenoteLogo,
        valueProp: "Treinamentos e Capacitações",
        support: "Empresa especializada em treinamentos e capacitações em gestão, marketing e vendas, credenciada pelo SEBRAE-SP.",
        link: "https://bluenote.com.br",
        gradient: "from-[#050505] to-[#202020]",
    },
    {
        name: "Meta de Vendas",
        logo: metadevendasLogo,
        valueProp: "Inteligência Comercial",
        support:
            "Implantamos processos, tecnologia e gestão comercial para transformar vendas em uma operação previsível e escalável.",
        link: "https://metadevendas.com.br",
        gradient: "from-[#0A0A0A] to-[#252525]",
    },
];

const CompaniesSection = () => {
    const [isBlueNoteDialogOpen, setIsBlueNoteDialogOpen] = useState(false);

    const openBlueNoteDialog = () => setIsBlueNoteDialogOpen(true);

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
                        Três frentes complementares que aplicam uma metodologia validada para estruturar, acelerar e escalar
                        sua operação.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {companies.map((company, i) => (
                        <motion.div
                            key={company.name}
                            className={`flex flex-col items-center p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br ${company.gradient} hover:shadow-glow hover:border-brand-purple/20 transition-all duration-500 group ${company.name === "BlueNote" ? "cursor-pointer" : ""}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            onClick={company.name === "BlueNote" ? openBlueNoteDialog : undefined}
                            onKeyDown={(event) => {
                                if (company.name !== "BlueNote") return;
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openBlueNoteDialog();
                                }
                            }}
                            role={company.name === "BlueNote" ? "button" : undefined}
                            tabIndex={company.name === "BlueNote" ? 0 : undefined}
                        >
                            <div className="h-16 flex items-center justify-center mb-10">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="max-h-12 w-auto object-contain brightness-125 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                            </div>

                            <div className="text-center mb-10 flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-white mb-3">{company.valueProp}</h3>
                                {company.support ? (
                                    <p className="text-sm text-primary-foreground/50 leading-relaxed font-light">{company.support}</p>
                                ) : null}
                            </div>

                            {company.name === "BlueNote" ? (
                                <Button
                                    type="button"
                                    variant="default"
                                    className="w-full h-12 rounded-xl font-bold tracking-wide uppercase text-[10px] text-white bg-[#8A10AF] hover:bg-[#8A10AF]/90 border border-white/10 shadow-lg shadow-black/20"
                                    onClick={openBlueNoteDialog}
                                >
                                    SAIBA MAIS
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    className="w-full h-12 rounded-xl font-bold tracking-wide uppercase text-[10px] text-white bg-[#8A10AF] hover:bg-[#8A10AF]/90 border border-white/10 shadow-lg shadow-black/20"
                                    asChild
                                >
                                    <a href={company.link} target="_blank" rel="noopener noreferrer">
                                        SAIBA MAIS
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            <Dialog open={isBlueNoteDialogOpen} onOpenChange={setIsBlueNoteDialogOpen}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-white/10 bg-background p-6 shadow-2xl sm:p-8">
                    <DialogHeader className="text-center sm:text-center">
                        <DialogTitle className="text-2xl font-bold text-foreground">Site em manutenção</DialogTitle>
                        <DialogDescription className="pt-2 text-base leading-relaxed text-muted-foreground">
                            O site da BlueNote está passando por ajustes no momento. Em breve ele estará disponível novamente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2 sm:justify-center">
                        <Button
                            type="button"
                            className="h-12 w-full rounded-xl bg-[#8A10AF] font-bold text-white hover:bg-[#8A10AF]/90 sm:w-auto sm:px-8"
                            onClick={() => setIsBlueNoteDialogOpen(false)}
                        >
                            Entendi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default CompaniesSection;
