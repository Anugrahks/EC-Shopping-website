export function optimizeUnsplashImage(source: string, width: number, height: number) {
  try {
    const url = new URL(source);
    if (url.hostname !== "images.unsplash.com") return source;
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    url.searchParams.set("q", "70");
    url.searchParams.set("fm", "webp");
    url.searchParams.set("auto", "format");
    return url.toString();
  } catch {
    return source;
  }
}
