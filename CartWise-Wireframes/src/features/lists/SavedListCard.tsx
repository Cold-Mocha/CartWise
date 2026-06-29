import {useState} from 'react';
import {RotateCcw, Trash2} from 'lucide-react';
import type {SavedList} from '../../domain/types';
import {plural} from '../../lib/format';

export function SavedListCard({
  list,
  onRepeat,
  onCompare,
  onRename,
  onDelete,
}: {
  list: SavedList;
  onRepeat: (list: SavedList) => void;
  onCompare: (list: SavedList) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const units = list.items.reduce((sum, item) => sum + item.quantity, 0);
  const saveName = () => {
    onRename(list.id, name);
    setEditing(false);
  };
  return (
    <article className="cw-panel cw-list-card">
      <div className="cw-panel-headrow">
        {editing ? (
          <input
            className="cw-inline-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre de la lista"
            autoFocus
          />
        ) : (
          <h3 className="cw-list-name">{list.name}</h3>
        )}
        {editing ? (
          <button type="button" className="cw-link-btn" onClick={saveName}>Guardar</button>
        ) : (
          <button type="button" className="cw-link-btn" onClick={() => { setName(list.name); setEditing(true); }}>Editar</button>
        )}
      </div>
      <p className="cw-muted">
        {plural(list.items.length, 'producto')} · {plural(units, 'unidad', 'unidades')}
        {list.lastUsedAt ? ` · usada ${new Date(list.lastUsedAt).toLocaleDateString('es-CL')}` : ''}
      </p>
      <div className="cw-mini-list">
        {list.items.slice(0, 4).map((item) => (
          <div key={`${item.kind}-${item.id}`}>
            <span>{item.nombre}</span>
            <strong>x{item.quantity}</strong>
          </div>
        ))}
        {list.items.length > 4 && <p className="cw-muted">+{list.items.length - 4} más</p>}
      </div>
      <div className="cw-panel-actions">
        <button type="button" className="cw-primary-btn" onClick={() => onCompare(list)}>Comparar ahora</button>
        <button type="button" className="cw-ghost-btn" onClick={() => onRepeat(list)}>
          <RotateCcw size={16} aria-hidden="true" /> Repetir
        </button>
        <button type="button" className="cw-icon-btn danger" onClick={() => onDelete(list.id)} aria-label={`Eliminar lista ${list.name}`} title="Eliminar">
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
