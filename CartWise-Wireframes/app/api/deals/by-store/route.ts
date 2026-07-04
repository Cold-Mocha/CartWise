import { bridgeJson } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return bridgeJson("storeDeals", { perStore: Number(searchParams.get("perStore") || 12) });
}
