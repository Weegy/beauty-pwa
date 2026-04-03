import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "API Key fehlt." }, { status: 400 });
    }

    const systemMessage = {
      role: "system" as const,
      content:
        "Du bist ein freundlicher K-Beauty und Skincare Berater. Du hilfst bei Fragen zu koreanischer Hautpflege, Routine-Aufbau, Produktempfehlungen und Inhaltsstoffen. Antworte kurz und hilfreich auf Deutsch. Wenn du dir unsicher bist, sage es ehrlich.",
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages.slice(-10)],
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        res.status === 401
          ? "Ungültiger API Key."
          : err?.error?.message || "OpenAI Fehler.";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler." },
      { status: 500 },
    );
  }
}
