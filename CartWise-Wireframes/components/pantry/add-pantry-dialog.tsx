"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS_DESTACADAS } from "@/lib/constants";
import type { PantryItemDraft } from "@/types/cartwise";

// Agregar producto manual a la despensa (plan §13.10). Sin vencimientos ni
// escaneo: nombre, categoría, cantidad y notas opcionales.
export function AddPantryDialog({ onAdd }: { onAdd: (draft: PantryItemDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      productName: name,
      category: category || null,
      quantity: Math.max(1, quantity),
      notes: notes.trim() || undefined,
    });
    setName("");
    setCategory("");
    setQuantity(1);
    setNotes("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Agregar producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar a la despensa</DialogTitle>
          <DialogDescription>Registra algo que ya tienes en casa.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pantry-name">Producto</Label>
            <Input
              id="pantry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arroz grado 1"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DESTACADAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pantry-qty">Cantidad</Label>
              <Input
                id="pantry-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pantry-notes">Notas (opcional)</Label>
            <Input
              id="pantry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Marca preferida, formato…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>
            <Plus /> Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
