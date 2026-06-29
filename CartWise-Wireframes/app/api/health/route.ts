import { bridgeJson } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  return bridgeJson("health");
}
