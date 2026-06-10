import { z } from "zod";
import { retrieveCoachContext, streamCoachReply } from "@/lib/openai/coach";

const schema = z.object({
  message: z.string().min(1).max(2000),
  topicId: z.string().optional(),
  pathname: z.string().max(200).optional(),
  role: z.enum(["org_admin", "manager", "viewer"]).nullable().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(12)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const topics = retrieveCoachContext(body);
    const stream = await streamCoachReply(body, topics);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[coach]", error);
    return Response.json({ error: "Coach request failed" }, { status: 500 });
  }
}
