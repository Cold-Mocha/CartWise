"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Guarda la compra pendiente actual como lista reutilizable (plan §13.5/§13.9).
export function SaveListDialog({
  onSave,
  disabled,
  trigger,
}: {
  onSave: (name: string) => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    onSave(name);
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" disabled={disabled}>
            <Bookmark /> Guardar como lista
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar como lista</DialogTitle>
          <DialogDescription>
            Dale un nombre para reutilizar esta compra más tarde y compararla cuando quieras.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="list-name">Nombre de la lista</Label>
          <Input
            id="list-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Compra de la semana"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={submit}>
            <Bookmark /> Guardar lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
