import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar, IcoList, IcoSearch, IcoCheck, TabToggle, IcoChevron } from '../WireframeComponents';
import { SourceBadge } from './ConversionScreens';

/* Mic button component */
export const MicBtn = ({ active }: { active?: boolean }) => (
  <div style={{ width: 52, height: 52, borderRadius: '50%', background: active ? '#DC2626' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? '0 0 0 8px rgba(220,38,38,0.15)' : 'var(--shadow-soft)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0014 0M12 19v4M8 23h8" />
    </svg>
  </div>
);

/* 10 — Bifurcación: ¿Qué tipo de compra? */
export const ScreenGenerarCompra = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [selected, setSelected] = useState<'mes' | 'semana' | null>('mes');

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 900, flex: 1, textAlign: 'center', marginRight: 36 }}>Planificar Compra</span>
      </div>

      <div style={{ padding: '32px 20px' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 }}>¿Qué compraremos?</div>
        <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', marginBottom: 40, textAlign: 'center', fontWeight: 500 }}>Selecciona tu modo de ahorro</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card 1: Mensual */}
          <div 
            onClick={() => setSelected('mes')}
            className="wf-card"
            style={{ 
              padding: 24, 
              background: 'white', 
              cursor: 'pointer', 
              border: `2.5px solid ${selected === 'mes' ? 'var(--color-primary)' : 'var(--color-line)'}`,
              boxShadow: selected === 'mes' ? 'var(--shadow-soft)' : 'none',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: 18, 
                background: selected === 'mes' ? 'var(--color-primary)' : 'var(--color-bg)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: selected === 'mes' ? 'white' : 'var(--color-ink-muted)',
                transition: 'all 0.2s'
              }}>
                <IcoList size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 4 }}>Abastecimiento Mensual</div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                  Para compras grandes usando tu canasta habitual.
                </div>
              </div>
            </div>
            {selected === 'mes' && (
              <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--color-primary)' }}>
                <IcoCheck size={20} />
              </div>
            )}
          </div>

          {/* Card 2: Semanal */}
          <div 
            onClick={() => setSelected('semana')}
            className="wf-card"
            style={{ 
              padding: 24, 
              background: 'white', 
              cursor: 'pointer', 
              border: `2.5px solid ${selected === 'semana' ? 'var(--color-primary)' : 'var(--color-line)'}`,
              boxShadow: selected === 'semana' ? 'var(--shadow-soft)' : 'none',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: 18, 
                background: selected === 'semana' ? 'var(--color-primary)' : 'var(--color-bg)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: selected === 'semana' ? 'white' : 'var(--color-ink-muted)',
                transition: 'all 0.2s'
              }}>
                <IcoSearch size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 4 }}>Compra Semanal</div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                  Reponer frescos o faltantes rápidos.
                </div>
              </div>
            </div>
            {selected === 'semana' && (
              <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--color-primary)' }}>
                <IcoCheck size={20} />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => onNavigate(selected === 'mes' ? 'compra_mes' : 'compra_pequena_1')}
          disabled={!selected}
          className="wf-btn" 
          style={{ width: '100%', marginTop: 40, height: 60, fontSize: 16, fontWeight: 800 }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

/* 11 — Compra del mes REIMAGINADO */
export const ScreenCompraMes = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('generar_compra')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center', marginRight: 36 }}>Revisar Canasta</span>
      </div>

      <div style={{ background: 'white', padding: '20px', borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Abastecimiento Mensual</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, color: 'var(--color-ink)', fontWeight: 700 }}>48 productos en tu lista base</div>
          <button style={{ fontSize: 13, color: 'var(--color-ink-muted)', background: 'transparent', border: 'none', fontWeight: 600 }}>Editar lista</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
        <AnimatePresence>
          {[
            { cat: 'LÁCTEOS', items: [['Leche Soprole 1L', '×4', true], ['Yogur Colun', '×8', true], ['Mantequilla Colun', '×1', true]] },
            { cat: 'ABARROTES', items: [['Aceite Miraflores 1L', '×2', true], ['Arroz Tucapel 1kg', '×3', true], ['Fideos Carozzi', '×4', false], ['Sal Lobos 1kg', '×2', true]] },
            { cat: 'CARNES Y POLLOS', items: [['Pechuga de pollo 1kg', '×2', true], ['Carne molida 500g', '×3', true]] }
          ].map((g, gi) => (
            <motion.div 
              key={gi} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
              style={{ marginBottom: 32 }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, marginLeft: 4, letterSpacing: 1 }}>{g.cat}</div>
              <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--color-line)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
                {g.items.map(([n, q, sel], ii) => (
                  <div key={ii} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16, 
                    padding: '18px 20px', 
                    borderBottom: ii === g.items.length - 1 ? 'none' : '1px solid var(--color-line)', 
                    opacity: sel ? 1 : 0.5,
                  }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: 8, 
                      border: `2.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-line)'}`, 
                      background: sel ? 'var(--color-primary)' : 'transparent', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {sel && <IcoCheck color="#fff" size={16} />}
                    </div>
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', textDecoration: sel ? 'none' : 'line-through' }}>{n as string}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>{q as string}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', textAlign: 'center', paddingBottom: 20, fontWeight: 600 }}>
          43 de 48 productos seleccionados
        </div>
      </div>

      <div style={{ padding: '24px 20px', borderTop: '1px solid var(--color-line)', background: 'white', position: 'sticky', bottom: 0, boxShadow: '0 -10px 20px rgba(0,0,0,0.03)' }}>
        <button className="wf-btn" style={{ height: 60, fontSize: 16, fontWeight: 800 }} onClick={() => onNavigate('resultado_mes')}>Comparar Mejores Precios</button>
      </div>
    </div>
  );
};

/* 12 — Compra pequeña con VOZ */
export const ScreenCompraPequena1 = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  return (
    <div className="wf-content">
      <StatusBar />
      <div style={{ background: '#fff', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginTop: 10 }}>
        <button onClick={() => onNavigate('generar_compra')} style={{ fontSize: 22, border: 'none', background: 'none' }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Compra puntual</span>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ background: '#fafaf7', padding: '14px 20px', borderBottom: '1px solid #eee' }}>
        <div style={{ background: '#fff', border: '1.5px solid #ddd', borderRadius: 10, height: 44, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          <span style={{ color: '#0E7C7B' }}><IcoSearch size={16} /></span>
          <input 
            type="text"
            placeholder="Escribe un producto..."
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 15, outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 0' }}>
        <div className="wf-section-title" style={{ marginBottom: 4 }}>Tu lista de compra</div>
        <div className="wf-muted" style={{ marginBottom: 10 }}>Agrega los productos que te faltan</div>
        {[
          ['Leche Soprole 1L', '2 un.'],
          ['Pan Bimbo molde', '1 un.'],
          ['Coca-Cola 2L', '3 un.'],
          ['Detergente Ariel 3kg', '1 un.'],
          ['Queso mantecoso 200g', '1 un.']
        ].map(([n, q], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 4px', borderBottom: '1px solid #f0f0f0', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 600 }}>{n as string}</div>
              <div className="wf-muted" style={{ fontSize: 12 }}>{q as string}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 22, height: 22, border: '1.5px solid #ddd', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>−</div>
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{(q as string).split(' ')[0]}</span>
              <div style={{ width: 22, height: 22, border: '1.5px solid #0E7C7B', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#0E7C7B' }}>+</div>
            </div>
            <span style={{ color: '#ff4d4f', fontSize: 18, marginLeft: 8 }}>×</span>
          </div>
        ))}
        <div style={{ fontSize: 14, color: '#0E7C7B', padding: '16px 0', fontWeight: 700 }}>+ Agregar otro producto</div>
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', background: '#fff' }}>
        <button className="wf-btn" onClick={() => onNavigate('compra_pequena_2')}>Ver mejores precios →</button>
      </div>
    </div>
  );
};

/* 12A — Resultado Compra del Mes REIMAGINADO */
export const ScreenResultadoMes = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [tab, setTab] = useState<'una' | 'dos'>('una');
  
  return (
    <div className="wf-content" style={{ background: 'white' }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ padding: '20px 20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('compra_mes')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IcoChevron size={20} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>Tu Planificación</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)' }}>Ahorro Mensual</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ background: 'var(--color-bg)', padding: 4, borderRadius: 12, display: 'flex' }}>
          <button 
            onClick={() => setTab('una')}
            style={{ 
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 800, 
              background: tab === 'una' ? 'white' : 'transparent',
              color: tab === 'una' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              boxShadow: tab === 'una' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            Una Tienda
          </button>
          <button 
            onClick={() => setTab('dos')}
            style={{ 
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 800, 
              background: tab === 'dos' ? 'white' : 'transparent',
              color: tab === 'dos' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              boxShadow: tab === 'dos' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            Dos Tiendas (Mix)
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          {tab === 'una' ? (
            <motion.div 
              key="una"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Comparativa Total</div>
              {[
                { store: 'Líder Maipú', total: '$598.000', best: true },
                { store: 'Santa Isabel', total: '$608.200', best: false },
                { store: 'Unimarc', total: '$621.300', best: false },
                { store: 'Jumbo Ñuñoa', total: '$650.400' }
              ].map((c, i) => (
                <div key={i} style={{ 
                  padding: 18, 
                  background: 'white', 
                  borderRadius: 20, 
                  border: `2px solid ${c.best ? 'var(--color-primary)' : 'var(--color-line)'}`,
                  boxShadow: c.best ? 'var(--shadow-soft)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                       <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-ink)' }}>{c.store}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>
                      {c.best ? 'Mejor opción para este mes' : 'Precio total canasta'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: c.best ? 'var(--color-primary)' : 'var(--color-ink)' }}>{c.total}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="dos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 20 }}
            >
              <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1.5px solid var(--color-line)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Estrategia Dividida Mensual</div>
                
                <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, bottom: 20, left: 19, width: 2, background: 'var(--color-bg)' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 14, fontWeight: 900, color: 'white' }}>1</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-ink)' }}>Líder Maipú</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 4 }}>27 productos</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-primary)' }}>$321.400</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg)', border: '1.5px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 14, fontWeight: 900, color: 'var(--color-ink-muted)' }}>2</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-ink)' }}>Jumbo Ñuñoa</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 4 }}>16 productos</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-ink)' }}>$194.600</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', borderRadius: 20, padding: 20, color: 'var(--color-ink)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2.5px solid #bbb' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Estrategia Mix</div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>$516.000</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '24px 20px', borderTop: '1px solid var(--color-line)' }}>
        <button 
          className="wf-btn" 
          onClick={() => onNavigate('detalle_compra_mes')}
          style={{ width: '100%', height: 60, fontSize: 16, fontWeight: 800 }}
        >
          Ver Detalle de Compra
        </button>
      </div>
    </div>
  );
};


/* 12B — Resultado Compra Pequeña REIMAGINADO */
export const ScreenCompraPequena2 = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [tab, setTab] = useState<'una' | 'dos'>('una');
  
  return (
    <div className="wf-content" style={{ background: 'white' }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ padding: '20px 20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('compra_pequena_1')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IcoChevron size={20} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>Tu Estrategia</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)' }}>Mejor Opción</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ background: 'var(--color-bg)', padding: 4, borderRadius: 12, display: 'flex' }}>
          <button 
            onClick={() => setTab('una')}
            style={{ 
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 800, 
              background: tab === 'una' ? 'white' : 'transparent',
              color: tab === 'una' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              boxShadow: tab === 'una' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            Una Tienda
          </button>
          <button 
            onClick={() => setTab('dos')}
            style={{ 
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 800, 
              background: tab === 'dos' ? 'white' : 'transparent',
              color: tab === 'dos' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              boxShadow: tab === 'dos' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            Dos Tiendas (Mix)
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          {tab === 'una' ? (
            <motion.div 
              key="una"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {[
                { store: 'Líder Maipú', total: '$14.200', note: 'En tu ruta a casa · 1.2 km', color: 'var(--color-primary)', best: true },
                { store: 'Unimarc Express', total: '$15.100', note: 'A 2 cuadras de ti', color: 'var(--color-line)', best: false },
                { store: 'Jumbo Ñuñoa', total: '$17.850', note: 'Tu tienda habitual', color: 'var(--color-line)', best: false, habit: true }
              ].map((c, i) => (
                <div key={i} style={{ 
                  padding: 18, 
                  background: 'white', 
                  borderRadius: 20, 
                  border: `2px solid ${c.best ? 'var(--color-primary)' : 'var(--color-line)'}`,
                  boxShadow: c.best ? 'var(--shadow-soft)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                       <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-ink)' }}>{c.store}</div>
                       {c.habit && <span style={{ fontSize: 10, background: 'var(--color-bg)', color: 'var(--color-ink-muted)', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>HÁBITO</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{c.note}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: c.best ? 'var(--color-primary)' : 'var(--color-ink)' }}>{c.total}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#2FA572' }}>
                      {c.best ? '' : i === 1 ? '−$2.750' : 'REFERENCIA'}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="dos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 20 }}
            >
              <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1.5px solid var(--color-line)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Estrategia Dividida</div>
                
                <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, bottom: 20, left: 19, width: 2, background: 'var(--color-bg)' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 14, fontWeight: 900, color: 'white' }}>1</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-ink)' }}>Líder Maipú</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 2 }}>3 productos (Lácteos y Abarrotes)</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-primary)' }}>$9.800</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg)', border: '1.5px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 14, fontWeight: 900, color: 'var(--color-ink-muted)' }}>2</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-ink)' }}>Unimarc Express</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 2 }}>2 productos (Fresco y Panadería)</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-ink)' }}>$3.900</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', borderRadius: 20, padding: 20, color: 'var(--color-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #bbb' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Combinado</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>$13.700</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#2FA572' }}>−$4.150</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '24px 20px', borderTop: '1px solid var(--color-line)' }}>
        <button 
          className="wf-btn" 
          onClick={() => onNavigate('plan_actualizado')}
          style={{ width: '100%', height: 60, fontSize: 16, fontWeight: 800 }}
        >
          Confirmar y Registrar
        </button>
      </div>
    </div>
  );
};

/* 13 — Plan actualizado */
export const ScreenPlanActualizado = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'white' }}>
    <StatusBar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 24, border: '1.5px solid var(--color-line)' }}
      >
        <IcoCheck size={40} />
      </motion.div>
      
      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 8, textAlign: 'center' }}>¡Compra Guardada!</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: 32, fontWeight: 500, lineHeight: 1.4 }}>
        Hemos guardado tu lista. <br/>
        Confírmala cuando estés en la tienda.
      </div>

      <div style={{ width: '100%', background: 'var(--color-bg)', borderRadius: 20, padding: 24, border: '1.5px solid var(--color-line)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>Resumen del plan</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 2 }}>Gasto estimado</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)' }}>$14.200</div>
          </div>
        </div>
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 8 }}>
          <span>Lugar recomendado</span>
          <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>Líder Maipú</span>
        </div>
        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lista de productos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Leche Soprole 1L (2)',
              'Pan Bimbo (1)',
              'Coca-Cola 2L (3)',
              'Detergente Ariel (1)'
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div style={{ padding: '24px 20px', background: 'white' }}>
      <button className="wf-btn" onClick={() => onNavigate('home_simple')} style={{ height: 60, fontSize: 16, fontWeight: 800 }}>Volver al Inicio</button>
    </div>
  </div>
);

/* 12A-bis — Plan Mensual Actualizado */
export const ScreenDetalleCompraMes = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'white' }}>
    <StatusBar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 24, border: '1.5px solid var(--color-line)' }}
      >
        <IcoCheck size={40} />
      </motion.div>
      
      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 8, textAlign: 'center' }}>¡Plan Mensual Guardado!</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: 32, fontWeight: 500, lineHeight: 1.4 }}>
        Hemos organizado tu abastecimiento. <br/>
        Sigue la estrategia para ahorrar este mes.
      </div>

      <div style={{ width: '100%', background: 'var(--color-bg)', borderRadius: 20, padding: 24, border: '1.5px solid var(--color-line)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>Resumen del plan mensual</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 2 }}>Gasto total estimado</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)' }}>$516.000</div>
          </div>
        </div>
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 8 }}>
          <span>Mix recomendado</span>
          <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>Líder + Jumbo</span>
        </div>
        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Categorías clave</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Abarrotes y Despensa (27 prod.)',
              'Frescos y Carnes (16 prod.)',
              'Lácteos y Bebidas (12 prod.)',
              'Limpieza y Hogar (8 prod.)'
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div style={{ padding: '24px 20px', background: 'white' }}>
      <button className="wf-btn" onClick={() => onNavigate('home_simple')} style={{ height: 60, fontSize: 16, fontWeight: 800 }}>Finalizar Planificación</button>
    </div>
  </div>
);

