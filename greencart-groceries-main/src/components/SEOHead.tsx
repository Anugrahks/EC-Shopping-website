import { useEffect } from "react";

type SEOHeadProps = {
  title: string;
  description: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
};

export function SEOHead({ title, description, image, jsonLd }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
      setMeta('meta[name="twitter:image"]', "content", image);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;

    let schema = document.getElementById("page-json-ld");
    if (jsonLd) {
      if (!schema) {
        schema = document.createElement("script");
        schema.id = "page-json-ld";
        schema.setAttribute("type", "application/ld+json");
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(jsonLd);
    } else {
      schema?.remove();
    }
  }, [title, description, image, jsonLd]);

  return null;
}

export function SiteStructuredData() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "EC SHOPPING",
      url: window.location.origin,
      description: "Fresh groceries and daily essentials delivered to your doorstep.",
    };
    let element = document.getElementById("organization-json-ld");
    if (!element) {
      element = document.createElement("script");
      element.id = "organization-json-ld";
      element.setAttribute("type", "application/ld+json");
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(schema);
  }, []);
  return null;
}