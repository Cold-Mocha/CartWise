import {Fragment} from 'react';
import {ShoppingBasket} from 'lucide-react';
import {PLAN_STATUS_LABELS, SNAPSHOT_FECHA, TRANSPARENCY_SNAPSHOT} from '../../domain/constants';
import type {
  BasketItem,
  ConfirmedPurchase,
  Health,
  PantryItem,
  SavedList,
  SavedPlan,
  SearchItem,
  View,
} from '../../domain/types';
import {useDashboardMetrics} from '../../hooks/useDashboardMetrics';
import {money, plural} from '../../lib/format';
import {EmptyState, MetricCard, PanelHeader} from '../../components/ui';
import {SearchResultCard} from '../products/SearchResultCard';
import {BudgetCard} from './BudgetCard';
import {CategorySpendingChart} from './CategorySpendingChart';
import {MonthlySpendingChart} from './MonthlySpendingChart';

export function Dashboard({
  health,
  healthError,
  basket,
  topDeals,
  dealsError,
  history,
  confirmed,
  savedLists,
  pantry,
  budget,
  onBudgetChange,
  onNavigate,
  onAdd,
  onCompare,
  comparing,
}: {
  health: Health | null;
  healthError: boolean;
  basket: BasketItem[];
  topDeals: SearchItem[];
  dealsError: boolean;
  history: SavedPlan[];
  confirmed: ConfirmedPurchase[];
  savedLists: SavedList[];
  pantry: PantryItem[];
  budget: number;
  onBudgetChange: (value: number) => void;
  onNavigate: (view: View) => void;
  onAdd: (item: SearchItem) => void;
  onCompare: () => void;
  comparing: boolean;
}) {
  const {
    monthConfirmed,
    gastoMes,
    ahorroConfirmado,
    ahorroEstimado,
    presupuestoRestante,
    pendingPlan,
    basketUnits,
    recentPurchases,
    alertas,
  } = useDashboardMetrics({basket, history, confirmed, budget});

  const metricNum = (value?: number) =>
    healthError ? '—' : value?.toLocaleString('es-CL') ?? '...';

  return (
    <div className="cw-stack">
      <header className="cw-welcome">
        <div>
          <h1>Tu mes en Cartwise 👋</h1>
          <p>Revisa tu gasto en comida, tus compras y dónde conviene comprar.</p>
        </div>
        <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>
          <ShoppingBasket size={18} aria-hidden="true" />
          Armar compra
        </button>
      </header>

      <section className="cw-metrics" aria-label="Resumen mensual">
        <MetricCard label="Gasto registrado del mes" value={money(gastoMes)} />
        <MetricCard
          label="Presupuesto restante"
          value={presupuestoRestante == null ? 'Sin presupuesto' : money(presupuestoRestante)}
        />
        <MetricCard label="Ahorro estimado" value={money(ahorroEstimado)} />
        <MetricCard label="Ahorro confirmado" value={money(ahorroConfirmado)} />
        <MetricCard label="Compras del mes" value={String(monthConfirmed.length)} />
        <MetricCard label="Último snapshot" value={SNAPSHOT_FECHA} />
      </section>

      <BudgetCard budget={budget} gastoMes={gastoMes} onBudgetChange={onBudgetChange} />

      <section className="cw-grid-2" aria-label="Estadísticas del mes">
        <MonthlySpendingChart purchases={monthConfirmed} budget={budget} />
        <CategorySpendingChart purchases={monthConfirmed} />
      </section>

      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Compra pendiente" subtitle="Lo que estás preparando ahora" />
          {basket.length > 0 ? (
            <>
              <div className="cw-mini-list">
                {basket.slice(0, 5).map((item) => (
                  <div key={`${item.kind}-${item.id}`}>
                    <span>{item.nombre}</span>
                    <strong>x{item.quantity}</strong>
                  </div>
                ))}
              </div>
              <p className="cw-muted">{plural(basket.length, 'producto')} · {plural(basketUnits, 'unidad', 'unidades')}</p>
              <div className="cw-panel-actions">
                <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('plan')}>Continuar</button>
                <button type="button" className="cw-primary-btn" onClick={onCompare} disabled={comparing}>
                  {comparing ? 'Comparando…' : 'Comparar supermercados'}
                </button>
              </div>
            </>
          ) : (
            <>
              <EmptyState text="No tienes una compra pendiente. Crea una compra nueva o repite una lista guardada." />
              <div className="cw-panel-actions">
                <button type="button" className="cw-primary-btn" onClick={() => onNavigate('plan')}>Crear compra</button>
              </div>
            </>
          )}
        </div>

        <div className="cw-panel">
          <PanelHeader title="Plan pendiente" subtitle="Recomendación aún no confirmada" />
          {pendingPlan ? (
            <>
              <p className="cw-plan-rec">Recomendación: <strong>{pendingPlan.store}</strong></p>
              <p className="cw-muted">Ahorro estimado: {money(pendingPlan.savings)} · {pendingPlan.date}</p>
              <div className="cw-panel-actions">
                <button type="button" className="cw-ghost-btn" onClick={() => onNavigate('history')}>Ver en historial</button>
              </div>
            </>
          ) : (
            <EmptyState text="No tienes planes pendientes. Compara una compra para generar uno." />
          )}
        </div>
      </section>

      <div className="cw-panel">
        <div className="cw-panel-headrow">
          <PanelHeader title="Historial reciente" subtitle="Tus últimas compras y planes" />
          <button type="button" className="cw-link-btn" onClick={() => onNavigate('history')}>Ver historial</button>
        </div>
        {recentPurchases.length ? (
          <div className="cw-mini-list">
            {recentPurchases.map((c) => (
              <div key={c.id}>
                <span>{c.store} · {new Date(c.purchaseDate).toLocaleDateString('es-CL')}</span>
                <strong>{money(c.realTotal)}</strong>
              </div>
            ))}
          </div>
        ) : history.length ? (
          <div className="cw-mini-list">
            {history.slice(0, 4).map((p) => (
              <div key={p.id}>
                <span>{p.store} · {p.date} · {PLAN_STATUS_LABELS[p.status ?? 'pending']}</span>
                <strong>{money(p.total)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Aún no registras compras. Cuando confirmes una compra aparecerá aquí." />
        )}
      </div>

      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Diferencias destacadas" subtitle="Mayor brecha de precio entre tiendas (no son ofertas)" />
          {dealsError ? (
            <EmptyState text="No pudimos cargar las diferencias por ahora. Inténtalo de nuevo." />
          ) : topDeals.length ? (
            <div className="cw-result-list compact" role="list">
              {topDeals.slice(0, 5).map((item) => (
                <Fragment key={item.id}>
                  <SearchResultCard item={item} onAdd={onAdd} compact />
                </Fragment>
              ))}
            </div>
          ) : (
            <EmptyState text="Sin diferencias destacadas para mostrar todavía." />
          )}
        </div>
        <div className="cw-panel">
          <PanelHeader title="Ofertas temporales" subtitle="Promociones marcadas en los datos" />
          <EmptyState text="El snapshot actual no incluye marcas de oferta promocional. Mostramos solo diferencias de precio entre tiendas." />
          <p className="cw-disclaimer-text">Oferta detectada en el último snapshot. Disponibilidad sujeta a cambios.</p>
        </div>
      </section>

      <section className="cw-grid-2">
        <div className="cw-panel">
          <PanelHeader title="Listas guardadas" subtitle="Compras frecuentes para repetir" />
          {savedLists.length ? (
            <div className="cw-mini-list">
              {savedLists.slice(0, 4).map((list) => (
                <div key={list.id}>
                  <span>{list.name}</span>
                  <strong>{plural(list.items.length, 'producto')}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Aún no tienes listas guardadas. Guarda una compra frecuente para repetirla rápido." />
          )}
        </div>
        <div className="cw-panel">
          <PanelHeader title="Almacén del hogar" subtitle="Productos que ya tienes en casa" />
          {pantry.length ? (
            <p className="cw-muted">{plural(pantry.length, 'producto')} registrado{pantry.length === 1 ? '' : 's'} en tu almacén.</p>
          ) : (
            <EmptyState text="Tu almacén está vacío. Agrega productos que ya tienes para evitar recomprarlos." />
          )}
        </div>
      </section>

      {alertas.length > 0 && (
        <div className="cw-panel">
          <PanelHeader title="Alertas" subtitle="Recordatorios según tu actividad" />
          <ul className="cw-alert-list" role="list">
            {alertas.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="cw-panel">
        <PanelHeader title="Estado de los datos" subtitle="Transparencia del snapshot" />
        <section className="cw-metrics">
          <MetricCard label="Supermercados cubiertos" value={metricNum(health?.counts.stores)} />
          <MetricCard label="Productos comparables" value={metricNum(health?.counts.products)} />
          <MetricCard label="Coincidencias por EAN" value={metricNum(health?.counts.exactComparable)} />
          <MetricCard label="Comparables genéricos" value={metricNum(health?.counts.genericComparable)} />
        </section>
        <p className="cw-disclaimer-text">{TRANSPARENCY_SNAPSHOT}</p>
      </div>
    </div>
  );
}
