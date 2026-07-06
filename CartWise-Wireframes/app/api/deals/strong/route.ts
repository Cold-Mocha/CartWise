import path from "node:path";
import fs from "node:fs";
import { NextResponse } from "next/server";
import { runBridge } from "@/lib/server/bridge";
import type { SearchItem } from "@/types/cartwise";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const data = await runBridge<{ items: SearchItem[] }>("strongDeals", {
      limit: Number(searchParams.get("limit") || 400),
    });
    // Vitrina del catálogo: solo productos con foto real descargada por el
    // Scrapper. Los demás siguen en el mart y aparecen en la búsqueda; solo
    // quedan fuera de esta vitrina.
    const imagesDir = path.join(process.cwd(), "public", "images", "products");
    const items = data.items.filter(
      (item) => item.ean && fs.existsSync(path.join(imagesDir, `${item.ean}.jpg`)),
    );
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: "api_error", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
