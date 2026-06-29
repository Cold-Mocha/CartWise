import {useState, type FormEvent} from 'react';
import type {PantryItemDraft} from '../../domain/types';
import {Modal} from '../../components/ui';

export function AddPantryItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: PantryItemDraft) => void;
}) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onAdd({
      productName,
      category: category.trim() || null,
      quantity: Math.max(1, Math.round(Number(quantity) || 1)),
    });
    onClose();
  };
  return (
    <Modal title="Agregar al almacén" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <label htmlFor="cw-pantry-name">Producto</label>
        <input id="cw-pantry-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Arroz 1 kg" autoFocus required />
        <label htmlFor="cw-pantry-cat">Categoría (opcional)</label>
        <input id="cw-pantry-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Abarrotes" />
        <label htmlFor="cw-pantry-qty">Cantidad</label>
        <input id="cw-pantry-qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Agregar</button>
        </div>
      </form>
    </Modal>
  );
}
