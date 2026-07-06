"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEMO_CREDENTIALS, STORAGE_KEYS } from "@/lib/constants";
import { loadJson, removeKey, saveJson } from "@/lib/storage";

// Sesión demo (no es autenticación real): valida credenciales fijas y guarda
// una bandera en localStorage. Devuelve false si las credenciales no calzan.

type SessionState = {
  hydrated: boolean;
  isAuthenticated: boolean;
  loginDemo: (usuario: string, password: string) => boolean;
  logout: () => void;
};

const SessionContext = React.createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    setIsAuthenticated(loadJson<string>(STORAGE_KEYS.auth, "") === "true");
    setHydrated(true);
  }, []);

  const loginDemo = (usuario: string, password: string) => {
    const valido =
      usuario.trim().toLowerCase() === DEMO_CREDENTIALS.usuario.toLowerCase() &&
      password === DEMO_CREDENTIALS.password;
    if (!valido) return false;
    saveJson(STORAGE_KEYS.auth, "true");
    setIsAuthenticated(true);
    router.push("/dashboard");
    return true;
  };

  // Cerrar sesión reinicia la cuenta demo: borra todos los datos guardados
  // (historial, compras, carrito, despensa, listas, comparación). Solo se
  // conserva la marca del tour de onboarding para no repetirlo en cada login.
  const logout = () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      if (key !== STORAGE_KEYS.onboarding) removeKey(key);
    }
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <SessionContext.Provider value={{ hydrated, isAuthenticated, loginDemo, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
