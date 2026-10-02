import { useEffect } from "react";
import { SITE_URL } from "@/config/business";

interface SeoOptions {
  title: string;
  description: string;
  /** Path starting with "/" */
  path: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  jsonLd?: object;
  /** Keep error pages out of search results */
  noindex?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Keeps title, description, canonical and Open Graph tags in sync with the current route. */
export function useSeo({ title, description, path, image, imageWidth = 1200, imageHeight = 630, jsonLd, noindex = false }: SeoOptions) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex" : "index, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    const img = image ?? "/og-image.jpg";
    const abs = img.startsWith("http") ? img : `${SITE_URL}${img}`;
    setMeta("property", "og:image", abs);
    setMeta("property", "og:image:width", String(image ? imageWidth : 1200));
    setMeta("property", "og:image:height", String(image ? imageHeight : 630));
    setMeta("name", "twitter:image", abs);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script: HTMLScriptElement | null = null;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.route = "true";
      script.textContent = ld;
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, path, image, imageWidth, imageHeight, ld, noindex]);
}
