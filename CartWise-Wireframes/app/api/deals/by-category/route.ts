import { bridgeJson } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return bridgeJson("dealsByCategory", {
    perCategory: Number(searchParams.get("perCategory") || 10),
    categories: Number(searchParams.get("categories") || 6),
  });
}
