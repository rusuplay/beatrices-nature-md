// Returnează numărul de comenzi pe produs, pentru „Cele mai vândute”.
export async function onRequestGet({ env }) {
  if (!env.SALES) return new Response("{}", { status: 503, headers: { "content-type": "application/json" } });
  const raw = (await env.SALES.get("counts")) || "{}";
  return new Response(raw, { headers: { "content-type": "application/json", "cache-control": "public, max-age=300" } });
}
