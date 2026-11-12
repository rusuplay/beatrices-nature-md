// Numără comenzile trimise din site (pentru „Cele mai vândute”).
// Are nevoie de un KV namespace legat de proiect, cu numele de variabilă SALES.
export async function onRequestPost({ request, env }) {
  if (!env.SALES) return new Response("KV neconfigurat", { status: 503 });
  const ip = request.headers.get("CF-Connecting-IP") || "x";
  if (await env.SALES.get("rl:" + ip)) return new Response("prea des", { status: 429 });
  let b;
  try { b = await request.json(); } catch (e) { return new Response("cerere invalidă", { status: 400 }); }
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 30);
  const raw = await env.SALES.get("counts");
  const c = raw ? JSON.parse(raw) : {};
  let any = false;
  for (const it of items) {
    const id = String(parseInt(it && it.id, 10));
    if (!/^\d{1,4}$/.test(id)) continue;
    const q = Math.min(20, Math.max(1, parseInt(it.q, 10) || 1));
    c[id] = (c[id] || 0) + q;
    any = true;
  }
  if (!any) return new Response("nimic de numărat", { status: 400 });
  c._orders = (c._orders || 0) + 1;
  await env.SALES.put("counts", JSON.stringify(c));
  await env.SALES.put("rl:" + ip, "1", { expirationTtl: 60 });
  return new Response("ok");
}
