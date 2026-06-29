import {useState, type FormEvent} from 'react';
import type {ConfirmPurchaseData, ConfirmedPurchaseItem, SavedPlan} from '../../domain/types';
import {money} from '../../lib/format';
import {Modal} from '../../components/ui';

export function ConfirmPurchaseModal({
  plan,
  onClose,
  onConfirm,
}: {
  plan: SavedPlan;
  onClose: () => void;
  onConfirm: (plan: SavedPlan, data: ConfirmPurchaseData) => void;
}) {
  const baseItems = plan.lines ?? [];
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(baseItems.map((l) => [`${l.kind}-${l.id}`, true])),
  );
  const [realTotal, setRealTotal] = useState(String(plan.total || ''));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [addToPantry, setAddToPantry] = useState(true);

  const toggle = (key: string) => setChecked((c) => ({...c, [key]: !c[key]}));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const items: ConfirmedPurchaseItem[] = baseItems
      .filter((l) => checked[`${l.kind}-${l.id}`])
      .map((l) => ({
        productName: l.nombre,
        quantity: l.quantity,
        category: l.categoria ?? null,
        paidPrice: l.precio_min ?? null,
      }));
    onConfirm(plan, {
      realTotal: Math.max(0, Math.round(Number(realTotal) || 0)),
      purchaseDate: new Date(date).toISOString(),
      items,
      addToPantry,
    });
  };

  return (
    <Modal title="Confirmar compra" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <p className="cw-muted">Plan recomendado en <strong>{plan.store}</strong> · total estimado {money(plan.total)}.</p>

        <div className="cw-modal-grid">
          <label htmlFor="cw-confirm-total">Total real pagado (CLP)
            <input id="cw-confirm-total" type="number" min={0} step={100} value={realTotal} onChange={(e) => setRealTotal(e.target.value)} required />
          </label>
          <label htmlFor="cw-confirm-date">Fecha de compra
            <input id="cw-confirm-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>

        {baseItems.length > 0 ? (
          <fieldset className="cw-confirm-items">
            <legend>Productos comprados</legend>
            {baseItems.map((l) => {
              const key = `${l.kind}-${l.id}`;
              return (
                <label key={key} className="cw-check-row">
                  <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                  <span>{l.nombre}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <p className="cw-muted">Este plan no guardó líneas de productos; se registrará solo el total.</p>
        )}

        <label className="cw-check-row">
          <input type="checkbox" checked={addToPantry} onChange={(e) => setAddToPantry(e.target.checked)} />
          <span>Enviar estos productos al almacén del hogar</span>
        </label>

        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Confirmar compra</button>
        </div>
      </form>
    </Modal>
  );
}
