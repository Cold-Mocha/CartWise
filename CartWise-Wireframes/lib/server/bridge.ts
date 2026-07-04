import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";

// Capa servidor: invoca el bridge Python (server/sqlite_bridge.py) que lee el
// mart SQLite generado por el Scrapper en modo solo-lectura. NO reimplementamos
// la lógica de comparación en JS: vive íntegra en el bridge (regla cobertura →
// precio incluida). Solo la exponemos vía route handlers de Next.

const PROJECT_ROOT = process.cwd();

function resolveDbPath(): string {
  if (process.env.CARTWISE_DB_PATH) {
    return path.resolve(/* turbopackIgnore: true */ PROJECT_ROOT, process.env.CARTWISE_DB_PATH);
  }
  return path.resolve(PROJECT_ROOT, "../Scrapper/datos/comparadores/comparador.sqlite");
}

function resolveBridgePath(): string {
  return path.resolve(PROJECT_ROOT, "server/sqlite_bridge.py");
}

const PYTHON_BIN = process.env.CARTWISE_PYTHON || "python3";

export type BridgePayload = Record<string, unknown>;

export function runBridge<T = unknown>(operation: string, payload: BridgePayload = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const dbPath = resolveDbPath();
    const bridgePath = resolveBridgePath();

    if (!fs.existsSync(dbPath)) {
      reject(new Error(`No se encontró el mart SQLite en ${dbPath}. Genera la base con el Scrapper o define CARTWISE_DB_PATH.`));
      return;
    }
    if (!fs.existsSync(bridgePath)) {
      reject(new Error(`No se encontró el bridge en ${bridgePath}.`));
      return;
    }

    const child = spawn(PYTHON_BIN, [bridgePath, dbPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`La consulta SQLite expiró para "${operation}".`));
    }, 15000);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `El bridge SQLite terminó con código ${code}.`));
        return;
      }
      try {
        resolve(JSON.parse(stdout || "{}") as T);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Respuesta inválida del bridge."));
      }
    });

    child.stdin.write(JSON.stringify({ operation, payload }));
    child.stdin.end();
  });
}
