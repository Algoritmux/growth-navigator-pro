import { Users, Mic, Rocket } from "lucide-react";

export type Service = {
    slug: string;
    title: string;
    description: string;
    features: string[];
    icon: any;
    ctaLabel: string;
};

export const SERVICES: Service[] = [
    {
        slug: "mentoria-executiva",
        title: "Mentoria Executiva",
        description:
            "Acompanhamento estratégico contínuo para líderes que precisam de clareza, direção e accountability para escalar resultados.",
        features: [
            "Sessões individuais",
            "Plano estratégico personalizado",
            "Acompanhamento de KPIs",
            "Acesso direto ao mentor",
        ],
        icon: Users,
        ctaLabel: "Saber mais",
    },
    {
        slug: "palestras-e-treinamentos",
        title: "Palestras e Treinamentos",
        description:
            "Apresentações de alto impacto para eventos corporativos, convenções e equipes.",
        features: [
            "Conteúdo customizado",
            "Formatos presencial e online",
            "Material de apoio exclusivo",
            "Workshops práticos",
        ],
        icon: Mic,
        ctaLabel: "Saber mais",
    },
    {
        slug: "consultoria-gtm",
        title: "Consultoria de GTM (Go-To-Market)",
        description:
            "Estratégia e execução de Go-To-Market para empresas que querem lançar, reposicionar ou escalar produtos.",
        features: [
            "Diagnóstico completo de mercado",
            "Estratégia de aquisição, canais e pricing",
            "Alinhamento entre marketing, vendas e produto",
            "Plano de execução orientado por dados",
        ],
        icon: Rocket,
        ctaLabel: "Saber mais",
    },
];
