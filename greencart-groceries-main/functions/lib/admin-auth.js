const encoder = new TextEncoder();

const base64UrlEncode = (bytes) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function createAdminToken(secret) {
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({ sub: "admin", exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 })));
  const input = `${header}.${payload}`;
  return `${input}.${base64UrlEncode(await sign(input, secret))}`;
}

export async function isAdminRequest(request, env = {}) {
  const secret = env.ADMIN_PASSWORD;
  const token = request.headers.get("Authorization")?.match(/^Bearer ([\w.-]+)$/)?.[1];
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const expected = await sign(`${parts[0]}.${parts[1]}`, secret);
    const actual = base64UrlDecode(parts[2]);
    let difference = actual.length ^ expected.length;
    for (let index = 0; index < Math.min(actual.length, expected.length); index += 1) difference |= actual[index] ^ expected[index];
    if (difference !== 0) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
    return payload.sub === "admin" && Number.isInteger(payload.exp) && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}