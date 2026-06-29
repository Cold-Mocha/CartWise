import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { StatusBar, BottomNav, IcoCam, IcoList, IcoChart, IcoSearch, IcoCheck, IcoEdit, IcoLock, IcoBell, IcoPin, IcoWork, IcoRoute, IcoUser, IcoTrash, IcoChevron, IcoCart, IcoPlus } from '../WireframeComponents';

/* ════════════════════════════════════════
   SCREEN 8 — Home / Dashboard
════════════════════════════════════════ */
export const ScreenHome = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
    <StatusBar />
    
    {/* Header con Saludo */}
    <div style={{ padding: '24px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Hola de nuevo,</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)', letterSpacing: -0.5 }}>Daniela 👋</div>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 80px' }}>
      
      <div style={{ marginBottom: 24 }}>
        <div className="wf-card" style={{ padding: 20, background: 'linear-gradient(135deg, white 0%, var(--color-bg) 100%)', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PRESUPUESTO MENSUAL</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)' }}>$452.400 <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500 }}>/ $600k</span></div>
            </div>
            <div style={{ width: 56, height: 56, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ position: 'absolute', inset: 0, border: '6px solid var(--color-line)', borderRadius: '50%' }} />
               <div style={{ position: 'absolute', inset: 0, border: '6px solid var(--color-primary)', borderRadius: '50%', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 75%)', transform: 'rotate(45deg)' }} />
               <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--color-primary)' }}>75%</span>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>
             <IcoBell size={14} color="var(--color-secondary)" /> Te quedan 14 días y $147.600
          </div>
        </div>
      </div>

      <div className="wf-section-title" style={{ marginBottom: 12 }}>Acciones</div>
      
      <div onClick={() => onNavigate('generar_compra')} className="wf-card" style={{ 
        marginBottom: 16, 
        padding: 20, 
        background: 'var(--color-primary)', 
        borderColor: 'transparent',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoSearch size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Planificar Compra</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Optimiza tu canasta para hoy.</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoChevron size={18} color="white" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Mi Canasta', sub: 'Gestiona stock', icon: <IcoList size={24} />, route: 'canasta' },
          { label: 'Historial', sub: 'Gastos previos', icon: <IcoChart size={24} />, route: 'historial' },
          { label: 'Subir Boleta', sub: 'Valida ahorro', icon: <IcoCam size={24} />, route: 'receipt_upload' },
          { label: 'Precios Guardados', sub: 'Categorización', icon: <IcoCheck size={24} />, route: 'receipt_database' }
        ].map((item, i) => (
          <div key={i} onClick={() => onNavigate(item.route)} className="wf-card" style={{ padding: 18, background: 'white', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', border: '1px solid var(--color-line)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-ink)' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 8b — Home State (Con Alertas / Pendientes)
════════════════════════════════════════ */
export const ScreenHomeSimple = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
    <StatusBar />
    
    <div style={{ padding: '24px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Hola de nuevo,</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)', letterSpacing: -0.5 }}>Daniela 👋</div>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 80px' }}>
      
      {/* Alerta Sutil */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => onNavigate('pending_purchases')} 
        style={{ 
          marginTop: 0, 
          marginBottom: 20,
          padding: '12px 16px', 
          background: 'rgba(242,101,34,0.08)', 
          border: '1.5px solid var(--color-secondary)', 
          borderRadius: 16, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          cursor: 'pointer'
        }}
      >
        <div style={{ color: 'var(--color-secondary)' }}><IcoBell size={20} /></div>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--color-ink)', fontWeight: 600 }}>
          <span style={{ fontWeight: 900, color: 'var(--color-secondary)' }}>PENDIENTE:</span> Valida tu compra en Líder ($124.500)
        </div>
        <IcoChevron size={16} color="var(--color-secondary)" />
      </motion.div>

      <div style={{ marginBottom: 24 }}>
        <div className="wf-card" style={{ padding: 20, background: 'white', border: '1px solid var(--color-line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PRESUPUESTO MES</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)' }}>$452.400 <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500 }}>/ $600k</span></div>
            </div>
            <div style={{ width: 56, height: 56, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ position: 'absolute', inset: 0, border: '6px solid var(--color-line)', borderRadius: '50%' }} />
               <div style={{ position: 'absolute', inset: 0, border: '6px solid var(--color-primary)', borderRadius: '50%', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 75%)', transform: 'rotate(45deg)' }} />
               <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--color-primary)' }}>75%</span>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>
             <IcoBell size={14} color="var(--color-secondary)" /> Te quedan 14 días y $147.600
          </div>
        </div>
      </div>

      {/* Main Action */}
      <div className="wf-section-title" style={{ marginBottom: 12 }}>Acciones</div>
      
      <div onClick={() => onNavigate('generar_compra')} className="wf-card" style={{ 
        marginBottom: 16, 
        padding: 20, 
        background: 'var(--color-primary)', 
        borderColor: 'transparent',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoSearch size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Planificar Compra</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Optimiza tu canasta para hoy.</div>
          </div>
          <IcoChevron size={18} color="white" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Mi Canasta', sub: 'Gestiona stock', icon: <IcoList size={24} />, route: 'canasta' },
          { label: 'Historial', sub: 'Gastos previos', icon: <IcoChart size={24} />, route: 'historial' },
          { label: 'Subir Boleta', sub: 'Valida ahorro', icon: <IcoCam size={24} />, route: 'receipt_upload' },
          { label: 'Precios Guardados', sub: 'Categorización', icon: <IcoCheck size={24} />, route: 'receipt_database' }
        ].map((item, i) => (
          <div key={i} onClick={() => onNavigate(item.route)} className="wf-card" style={{ padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', border: '1px solid var(--color-line)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-ink)' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 9 — Perfil & Configuración
════════════════════════════════════════ */
export const ScreenPerfil = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const Section = ({ title, children }: { title: string, children: ReactNode }) => (
    <div style={{ marginBottom: 28 }}>
      <div className="wf-section-title" style={{ marginBottom: 12, padding: '0 20px' }}>{title}</div>
      <div className="wf-card" style={{ padding: 0, overflow: 'hidden', margin: '0 20px' }}>
        {children}
      </div>
    </div>
  );

  const Item = ({ icon, label, value, chevron = true, danger, onClick }: { icon: ReactNode, label: string, value?: string, chevron?: boolean, danger?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--color-line)', cursor: onClick ? 'pointer' : 'default', background: 'white' }}>
      <span style={{ color: danger ? '#DC2626' : 'var(--color-primary)', flexShrink: 0, opacity: 0.8 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: danger ? '#DC2626' : 'var(--color-ink)' }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{value}</span>}
      {chevron && <span style={{ color: 'var(--color-line)' }}><IcoChevron size={16} /></span>}
    </div>
  );

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
           <IcoChevron size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 900, flex: 1, textAlign: 'center', marginRight: 36 }}>Mi Perfil</span>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: 24, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, color: 'white', flexShrink: 0, boxShadow: 'var(--shadow-soft)' }}>D</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-ink)', letterSpacing: -0.5 }}>Daniela Rojas</div>
          <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500 }}>daniela.rojas@gmail.com</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
          <IcoEdit size={18} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        <Section title="CONFIGURACIÓN">
          <Item icon={<IcoLock size={18} />} label="Seguridad y Acceso" />
          <Item icon={<IcoBell size={18} />} label="Notificaciones de ahorro" value="Mensuales" />
        </Section>
        
        <Section title="MI COMPRA">
          <Item icon={<IcoPin size={18} />} label="Dirección de casa" value="Maipú" />
          <Item icon={<IcoWork size={18} />} label="Lugar de trabajo" value="Providencia" />
          <Item icon={<IcoRoute size={18} />} label="Optimización de ruta" value="Activada" />
          <Item icon={<IcoList size={18} />} label="Mi canasta habitual" value="48 productos" onClick={() => onNavigate('canasta')} />
        </Section>

        <Section title="MÁS OPCIONES">
          <Item icon={<IcoUser size={18} />} label="Exportar reporte anual" />
          <Item icon={<IcoTrash size={18} />} label="Eliminar mi cuenta" danger chevron={false} />
        </Section>

        <div style={{ padding: '0 20px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 20, fontWeight: 500 }}>Versión 2.4.0 · Producido por Cartwise UI</div>
          <button className="wf-btn wf-btn-ghost" style={{ color: '#DC2626' }} onClick={() => onNavigate('landing')}>Cerrar sesión segura</button>
        </div>
      </div>
      <BottomNav active="perfil" onNavigate={onNavigate} />
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 9a — Historial de Compras
   ════════════════════════════════════════ */
export const ScreenHistorial = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
    <StatusBar />
    <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
      <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
        <IcoChevron size={24} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <span style={{ fontSize: 20, fontWeight: 900, flex: 1, textAlign: 'center', marginRight: 36 }}>Historial de Compras</span>
    </div>
    
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, paddingTop: 10 }}>
      {[
        { month: 'ABRIL 2026', items: [
          { date: '25 Abr', store: 'Líder Maipú', total: '$14.200', status: 'Completada', type: 'Extra', color: '#10B981' },
          { date: '18 Abr', store: 'Jumbo Ñuñoa', total: '$42.300', status: 'Eliminada', type: 'Extra', color: '#EF4444' },
          { date: '01 Abr', store: 'Plan Mensual Optimo', total: '$516.000', status: 'Completada', type: 'Plan', color: '#10B981' }
        ]},
        { month: 'MARZO 2026', items: [
          { date: '28 Mar', store: 'Unimarc', total: '$8.450', status: 'Completada', type: 'Extra', color: '#10B981' },
          { date: '15 Mar', store: 'Líder Express', total: '$4.200', status: 'Generada', type: 'Extra', color: 'var(--color-primary)' },
          { date: '01 Mar', store: 'Plan Mensual Optimo', total: '$598.000', status: 'Completada', type: 'Plan', color: '#10B981' }
        ]}
      ].map((g, gi) => (
        <div key={gi} style={{ marginBottom: 24 }}>
          <div className="wf-section-title" style={{ marginBottom: 12, padding: '0 20px' }}>{g.month}</div>
          <div className="wf-card" style={{ padding: 0, margin: '0 20px', overflow: 'hidden' }}>
            {g.items.map((h, ii) => (
              <div 
                key={ii} 
                style={{ 
                  padding: '18px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: ii === g.items.length - 1 ? 'none' : '1px solid var(--color-line)',
                  background: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: h.type === 'Plan' ? 'var(--color-primary)' : 'var(--color-ink-muted)' }}>
                    {h.type === 'Plan' ? <IcoList size={20} /> : <IcoCart size={20} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-ink)' }}>{h.total}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 2, fontWeight: 500 }}>{h.date} · {h.store}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ 
                     fontSize: 11, 
                     fontWeight: 900, 
                     color: h.color, 
                     background: `${h.color}15`, 
                     padding: '4px 8px', 
                     borderRadius: 6,
                     textTransform: 'uppercase'
                   }}>
                     {h.status}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <BottomNav active="history" onNavigate={onNavigate} />
  </div>
);

/* ════════════════════════════════════════
   SCREEN 9b — Mi Canasta habitual
   ════════════════════════════════════════ */
export const ScreenCanasta = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0, position: 'relative' }}>
      <StatusBar />
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 900, flex: 1, textAlign: 'center', marginRight: 36 }}>Mi Canasta Mensual</span>
      </div>
      
      {/* Buscador Simple */}
      <div style={{ background: 'white', padding: '12px 20px', borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ background: 'var(--color-bg)', borderRadius: 12, height: 48, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <IcoSearch size={18} color="var(--color-ink-muted)" />
          <input 
            type="text" 
            placeholder="Buscar Producto" 
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 15, fontWeight: 500, outline: 'none', color: 'var(--color-ink)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, paddingTop: 20 }}>
      {[
        { cat: 'LÁCTEOS', items: [['Leche Soprole 1L', '4'], ['Yogur Colun', '8'], ['Mantequilla 250g', '1']] },
        { cat: 'ABARROTES', items: [['Arroz Tucapel 1kg', '3'], ['Aceite Maravilla 1L', '2'], ['Fideos Carozzi 400g', '5']] },
        { cat: 'LIMPIEZA', items: [['Detergente Líquido 3L', '1'], ['Lavalozas Quix 750ml', '2']] }
      ].map((g, gi) => (
        <div key={gi} style={{ marginBottom: 28 }}>
          <div className="wf-section-title" style={{ marginBottom: 12, padding: '0 20px' }}>{g.cat}</div>
          <div className="wf-card" style={{ padding: 0, margin: '0 20px', overflow: 'hidden' }}>
            {g.items.map(([n, q], ii) => (
              <div key={ii} style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: ii === g.items.length - 1 ? 'none' : '1px solid var(--color-line)', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary-light)', border: '2px solid var(--color-primary)' }}></div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 2, fontWeight: 500 }}>Frecuencia mensual: <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{q} un.</span></div>
                  </div>
                </div>
                <div style={{ color: 'var(--color-line)' }}>
                  <IcoChevron size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      {/* Botón Añadir Flotante */}
      <div 
        onClick={() => {}} 
        style={{ 
          position: 'absolute', 
          bottom: 90, 
          right: 20, 
          width: 56, 
          height: 56, 
          borderRadius: 28, 
          background: 'var(--color-primary)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <IcoPlus size={28} />
      </div>

      <BottomNav active="plan" onNavigate={onNavigate} />
    </div>
  );
};
