import { NextResponse } from "next/server";
import { runBridge, type BridgePayload } from "./bridge";

// Envoltorio común: ejecuta una operación del bridge y normaliza errores a JSON
// con status 500, igual que la API Express original.
export async function bridgeJson(operation: string, payload: BridgePayload = {}) {
  try {
    const data = await runBridge(operation, payload);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "api_error", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
