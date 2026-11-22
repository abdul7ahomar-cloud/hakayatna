const MODEL = "gemini-flash-lite-latest";
const ALLOWED_ORIGINS = new Set([
  "https://abdul7ahomar-cloud.github.io",
]);

function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://abdul7ahomar-cloud.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
    if (!env.GEMINI_API_KEY) return json({ error: "Server is not configured" }, 503, origin);

    let input;
    try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
    const mode = input.mode === "reading" ? "reading" : "chat";
    const text = String(mode === "reading" ? input.prompt : input.text || "").trim();
    if (!text || text.length > 6000) return json({ error: "Invalid message" }, 400, origin);

    const prompt = mode === "chat"
      ? `أنت بوني، صديق أيوشة اللطيف. الشخص الذي يتحدث معك اسمه أيوشة. تحدث معها باللهجة المصرية بشكل طبيعي، ونادها أيوشة أو آية عند الحاجة فقط ومن غير تكرار مزعج. كن حنونًا وخفيفًا ورد باختصار ودفء على رسالتها التالية: ${text}`
      : text;
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: mode === "reading"
          ? { temperature: 0.8, responseMimeType: "application/json" }
          : { maxOutputTokens: 180, temperature: 0.8 },
      }),
    });
    if (!upstream.ok) return json({ error: "Gemini request failed" }, 502, origin);
    const data = await upstream.json();
    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!answer) return json({ error: "Empty Gemini response" }, 502, origin);
    return json({ text: answer }, 200, origin);
  },
};
