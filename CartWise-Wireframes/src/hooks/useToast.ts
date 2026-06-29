import {useEffect, useState} from 'react';

export function useToast(timeoutMs = 2600) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), timeoutMs);
    return () => clearTimeout(timer);
  }, [toast, timeoutMs]);

  return {
    toast,
    showToast: setToast,
    clearToast: () => setToast(null),
  };
}
