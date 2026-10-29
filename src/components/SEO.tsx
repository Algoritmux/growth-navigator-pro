import { useEffect } from "react";

export const SITE_URL = "https://guilhermecorreia.com.br";
const SITE_NAME = "Guilherme Correia";
const DEFAULT_TITLE = "Guilherme Correia | Growth, IA e Crescimento Previsível";
const DEFAULT_DESCRIPTION =
    "Estratégias práticas sobre growth, marketing, vendas, dados e inteligência artificial para construir crescimento previsível.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
    title?: string;
    description?: string;
    jsonLd?: object | object[];
    /** Caminho canônico, ex.: "/blog/meu-post". Padrão: a URL atual, sem query string. */
    path?: string;
    /** Imagem para Open Graph (URL absoluta ou caminho começando com "/"). */
    image?: string;
    type?: "website" | "article";
    noindex?: boolean;
}

export function canonicalUrl(path: string): string {
    const clean = `/${path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`;
    return clean === "/" ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

export function absoluteImageUrl(image?: string): string {
    const value = image?.trim() || "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return `${SITE_URL}${value}`;
    return DEFAULT_IMAGE;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.setAttribute("content", content);
}

function removeMeta(attribute: "name" | "property", key: string) {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function setCanonical(url: string) {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
    }
    link.setAttribute("href", url);
}

const SEO = ({ title, description, jsonLd, path, image, type = "website", noindex = false }: SEOProps) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

    useEffect(() => {
        const url = canonicalUrl(path ?? window.location.pathname);
        const imageUrl = absoluteImageUrl(image);

        document.title = fullTitle;
        setCanonical(url);
        setMeta("name", "description", finalDescription);
        setMeta("property", "og:title", fullTitle);
        setMeta("property", "og:description", finalDescription);
        setMeta("property", "og:url", url);
        setMeta("property", "og:type", type);
        setMeta("property", "og:image", imageUrl);
        setMeta("name", "twitter:title", fullTitle);
        setMeta("name", "twitter:description", finalDescription);
        setMeta("name", "twitter:image", imageUrl);

        if (noindex) {
            setMeta("name", "robots", "noindex, follow");
        } else {
            removeMeta("name", "robots");
        }

        // Mesmo id do JSON-LD injetado pelo backend/seo/render.php.
        const scriptId = "seo-json-ld";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (jsonLdText) {
            if (!script) {
                script = document.createElement("script");
                script.id = scriptId;
                script.type = "application/ld+json";
                document.head.appendChild(script);
            }
            script.text = jsonLdText;
        } else if (script) {
            script.remove();
        }
    }, [fullTitle, finalDescription, jsonLdText, path, image, type, noindex]);

    return null;
};

export default SEO;
