"use client";

import * as React from "react";
import { loadJson, saveJson } from "@/lib/storage";

// Estado persistido en localStorage con hidratación diferida: el primer render
// usa el fallback (idéntico en servidor y cliente, evita mismatch de
// hidratación) y tras montar se lee lo guardado. No escribe antes de hidratar
// para no pisar lo persistido.
export function usePersistentState<T>(key: string, fallback: T) {
  const fallbackRef = React.useRef(fallback);
  const [value, setValue] = React.useState<T>(fallback);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setValue(loadJson<T>(key, fallbackRef.current));
    setHydrated(true);
  }, [key]);

  React.useEffect(() => {
    if (hydrated) saveJson(key, value);
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
