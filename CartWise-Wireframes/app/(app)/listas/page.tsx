"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Repeat, Scale, Pencil, Trash2, Plus, Search } from "lucide-react";
import { useAppState } from "@/components/state/app-state";
import { SaveListDialog } from "@/components/purchase/save-list-dialog";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { plural, shortDate } from "@/lib/format";
import type { SavedList } from "@/types/cartwise";

export default function ListasPage() {
  const { savedLists, basket, saveCurrentAsList, repeatList, compareList, renameList, deleteList } =
    useAppState();
  const [renaming, setRenaming] = useState<SavedList | null>(null);
  const [newName, setNewName] = useState("");

  const openRename = (list: SavedList) => {
    setRenaming(list);
    setNewName(list.name);
  };
  const submitRename = () => {
    if (renaming) renameList(renaming.id, newName);
    setRenaming(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Reutilizables"
        title="Listas guardadas"
        description="Guarda compras frecuentes y vuelve a compararlas cuando quieras."
        action={
          basket.length > 0 ? (
            <SaveListDialog
              onSave={saveCurrentAsList}
              trigger={
                <Button>
                  <Plus /> Guardar compra actual
                </Button>
              }
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/productos">
                <Search /> Crear una compra
              </Link>
            </Button>
          )
        }
      />

      {savedLists.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No tienes listas guardadas"
          description="Arma una compra pendiente y guárdala como lista para repetirla más tarde."
          action={
            <Button asChild>
              <Link href="/compra-pendiente">Ir a mi compra pendiente</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedLists.map((list) => (
            <Card key={list.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-extrabold text-foreground">{list.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plural(list.items.length, "producto")} · creada {shortDate(list.createdAt)}
                    </p>
                  </div>
                  <Badge variant="muted">{list.items.length}</Badge>
                </div>

                {list.lastUsedAt && (
                  <p className="text-xs text-muted-foreground">Usada por última vez {shortDate(list.lastUsedAt)}</p>
                )}

                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {list.items.slice(0, 3).map((it) => (
                    <li key={`${it.kind}-${it.id}`} className="truncate">
                      · {it.nombre}
                    </li>
                  ))}
                  {list.items.length > 3 && <li>· y {list.items.length - 3} más…</li>}
                </ul>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  <Button size="sm" onClick={() => repeatList(list)}>
                    <Repeat /> Repetir
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => compareList(list)}>
                    <Scale /> Comparar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openRename(list)} aria-label="Renombrar lista">
                    <Pencil />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteList(list.id)}
                    aria-label="Eliminar lista"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={renaming !== null} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar lista</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename">Nuevo nombre</Label>
            <Input
              id="rename"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancelar
            </Button>
            <Button onClick={submitRename}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
