import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    jsonLd?: object | object[];
}

const SEO = ({ title, description, jsonLd }: SEOProps) => {
    const fullTitle = title ? `${title} | Guilherme Correia` : "Guilherme Correia | Growth & IA Estratégica";
    const defaultDesc = "Estrategista de Growth e IA. Ajudo empresas a escala através de frameworks de crescimento previsível e automações inteligentes.";

    useEffect(() => {
        // Atualizar Título
        document.title = fullTitle;

        // Atualizar Meta Descrição
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement("meta");
            metaDescription.setAttribute("name", "description");
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute("content", description || defaultDesc);

        // Gerenciar JSON-LD
        const scriptId = "seo-json-ld";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (jsonLd) {
            if (!script) {
                script = document.createElement("script");
                script.id = scriptId;
                script.type = "application/ld+json";
                document.head.appendChild(script);
            }
            script.text = JSON.stringify(jsonLd);
        } else if (script) {
            script.remove();
        }

        // Cleanup opcional se necessário ao desmontar, mas para SPAs geralmente queremos manter o estado
    }, [fullTitle, description, jsonLd]);

    return null;
};

export default SEO;
