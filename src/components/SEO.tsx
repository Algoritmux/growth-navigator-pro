import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    jsonLd?: object | object[];
}

const SEO = ({ title, description, jsonLd }: SEOProps) => {
    const fullTitle = title ? `${title} | Guilherme Correia` : "Guilherme Correia | Growth, IA e Crescimento Previsível";
    const defaultDesc = "Estratégias práticas sobre growth, marketing, vendas, dados e inteligência artificial para construir crescimento previsível.";

    useEffect(() => {
        document.title = fullTitle;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement("meta");
            metaDescription.setAttribute("name", "description");
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute("content", description || defaultDesc);

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
    }, [fullTitle, description, jsonLd]);

    return null;
};

export default SEO;
