import {useState, type FormEvent} from 'react';
import {plural} from '../../lib/format';
import {Modal} from '../../components/ui';

export function SaveListModal({count, onClose, onSave}: {count: number; onClose: () => void; onSave: (name: string) => void}) {
  const [name, setName] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(name);
  };
  return (
    <Modal title="Guardar como lista" onClose={onClose}>
      <form onSubmit={submit} className="cw-modal-form">
        <p className="cw-muted">Guarda los {plural(count, 'producto')} de tu compra pendiente como una lista reutilizable.</p>
        <label htmlFor="cw-list-name">Nombre de la lista</label>
        <input
          id="cw-list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Compra mensual, Desayuno semanal…"
          autoFocus
        />
        <div className="cw-modal-actions">
          <button type="button" className="cw-ghost-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cw-primary-btn">Guardar lista</button>
        </div>
      </form>
    </Modal>
  );
}
