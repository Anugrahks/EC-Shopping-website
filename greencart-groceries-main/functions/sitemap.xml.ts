import { categories, products } from "./api/data";

const slugify = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const onRequestGet = ({ request }: { request: Request }) => {
  const origin = new URL(request.url).origin;
  const staticPaths = ["/", "/products", "/about"];
  const categoryPaths = categories.map((category) => `/category/${slugify(category.name)}`);
  const productPaths = products.map((product) => `/product/${slugify(product.category)}/${slugify(product.name)}`);
  const urls = [...staticPaths, ...categoryPaths, ...productPaths]
    .map((path) => `<url><loc>${origin}${path}</loc></url>`)
    .join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
};