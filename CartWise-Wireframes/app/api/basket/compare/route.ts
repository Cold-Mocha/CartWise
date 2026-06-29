import { bridgeJson } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  return bridgeJson("compareBasket", { items });
}
