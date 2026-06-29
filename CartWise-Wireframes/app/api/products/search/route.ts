import { bridgeJson } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return bridgeJson("searchProducts", {
    q: String(searchParams.get("q") || ""),
    limit: Number(searchParams.get("limit") || 12),
  });
}
