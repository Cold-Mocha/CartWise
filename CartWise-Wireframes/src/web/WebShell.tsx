import {type ReactNode, useEffect, useRef} from 'react';
import {
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  Search,
  ShoppingBasket,
} from 'lucide-react';
import type {View} from '../domain/types';
import {Toast} from '../components/ui';

const navItems: {id: View; label: string; icon: ReactNode}[] = [
  {id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={18} aria-hidden="true" />},
  {id: 'prices', label: 'Productos', icon: <Search size={18} aria-hidden="true" />},
  {id: 'plan', label: 'Comparar', icon: <ShoppingBasket size={18} aria-hidden="true" />},
  {id: 'lists', label: 'Listas', icon: <ListChecks size={18} aria-hidden="true" />},
  {id: 'history', label: 'Historial', icon: <History size={18} aria-hidden="true" />},
  {id: 'pantry', label: 'Almacén', icon: <Package size={18} aria-hidden="true" />},
];

export function WebShell({
  view,
  onNavigate,
  onLogout,
  basketCount,
  toast,
  children,
}: {
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  basketCount: number;
  toast: string | null;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heading = contentRef.current?.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      (heading as HTMLElement).focus();
    }
  }, [view]);

  const renderNavButton = (item: {id: View; label: string; icon: ReactNode}, withLabelTag: boolean) => (
    <button
      key={item.id}
      type="button"
      className={view === item.id ? 'active' : ''}
      onClick={() => onNavigate(item.id)}
      aria-current={view === item.id ? 'page' : undefined}
    >
      {item.icon}
      {withLabelTag ? <span>{item.label}</span> : item.label}
      {item.id === 'plan' && basketCount > 0 && (
        <span className="cw-nav-count" aria-label={`${basketCount} unidades en tu compra pendiente`}>
          {basketCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="cw-app">
      <a className="cw-skip" href="#cw-main">Saltar al contenido</a>
      <aside className="cw-sidebar">
        <div className="cw-brand cw-sidebar-brand">
          <div className="cw-logo">C</div>
          <div>
            <strong>Cartwise</strong>
            <span>Precios de supermercados</span>
          </div>
        </div>
        <nav className="cw-nav" aria-label="Principal">
          {navItems.map((item) => renderNavButton(item, false))}
        </nav>
      </aside>
      <div className="cw-main">
        <header className="cw-topbar">
          <div className="cw-topbar-actions">
            <button type="button" className="cw-ghost-btn" onClick={onLogout}>
              <LogOut size={16} aria-hidden="true" />
              Salir
            </button>
          </div>
        </header>
        <main className="cw-content" id="cw-main" ref={contentRef} tabIndex={-1}>{children}</main>
      </div>
      <nav className="cw-mobile-nav" aria-label="Principal (móvil)">
        {navItems.map((item) => renderNavButton(item, true))}
      </nav>
      <Toast message={toast} />
    </div>
  );
}
