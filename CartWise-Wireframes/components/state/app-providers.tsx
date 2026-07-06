"use client";

import { SessionProvider } from "./session-provider";
import { PendingPurchaseProvider } from "./pending-purchase-provider";
import { ComparisonProvider } from "./comparison-provider";
import { SavedListsProvider } from "./saved-lists-provider";
import { PurchaseHistoryProvider } from "./purchase-history-provider";
import { PantryProvider } from "./pantry-provider";

// Composición de los providers por feature. Son independientes entre sí (el
// orden de anidación no importa); los flujos que cruzan features viven en
// hooks/use-plan-workflows.ts y hooks/use-list-workflows.ts.
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PendingPurchaseProvider>
        <ComparisonProvider>
          <SavedListsProvider>
            <PurchaseHistoryProvider>
              <PantryProvider>{children}</PantryProvider>
            </PurchaseHistoryProvider>
          </SavedListsProvider>
        </ComparisonProvider>
      </PendingPurchaseProvider>
    </SessionProvider>
  );
}
