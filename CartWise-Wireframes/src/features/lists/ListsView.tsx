import {Fragment} from 'react';
import {Plus} from 'lucide-react';
import {SNAPSHOT_FECHA} from '../../domain/constants';
import type {SavedList, View} from '../../domain/types';
import {EmptyState, Hero} from '../../components/ui';
import {SavedListCard} from './SavedListCard';

export function ListsView({
  lists,
  onRepeat,
  onCompare,
  onRename,
  onDelete,
  onNavigate,
}: {
  lists: SavedList[];
  onRepeat: (list: SavedList) => void;
  onCompare: (list: SavedList) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="cw-stack">
      <Hero
        title="Listas guardadas"
        subtitle="Compras frecuentes que puedes repetir y volver a comparar."
        action={
          <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>
            <Plus size={18} aria-hidden="true" /> Nueva compra
          </button>
        }
      />
      <p className="cw-compare-note">
        Al repetir una lista se compara de nuevo con los precios del último snapshot ({SNAPSHOT_FECHA});
        una lista no guarda una recomendación fija.
      </p>
      {lists.length ? (
        <div className="cw-cards-grid">
          {lists.map((list) => (
            <Fragment key={list.id}>
              <SavedListCard
                list={list}
                onRepeat={onRepeat}
                onCompare={onCompare}
                onRename={onRename}
                onDelete={onDelete}
              />
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="cw-panel">
          <EmptyState text="Aún no tienes listas guardadas. Arma una compra y usa “Guardar como lista”." />
          <div className="cw-panel-actions">
            <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>Crear compra</button>
          </div>
        </div>
      )}
    </div>
  );
}
