import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar, IcoCheck, IcoUpload, IcoCam, IcoChart, IcoChevron, IcoShield, IcoBell } from '../WireframeComponents';

/* ════════════════════════════════════════
   SCREEN 16.5 — Lista de Compras Pendientes
   REIMAGINADO 
   ════════════════════════════════════════ */
export const ScreenPendingPurchases = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const pending = [
    { id: 1, store: 'Líder Maipú', date: 'Hoy', total: '$124.500', items: 43, optimization: '$39.200' },
  ];

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center' }}>Validar Compras</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {pending.map((p, i) => (
          <motion.div 
            key={p.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: 24, 
              marginBottom: 16, 
              border: '2px solid var(--color-secondary)',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <IcoBell size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.store}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>{p.date}</div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '20px 0', borderTop: '1.5px dashed var(--color-line)', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 4, fontWeight: 500 }}>Total por confirmar</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-ink)' }}>{p.total}</div>
            </div>
            
            <button className="wf-btn" onClick={() => onNavigate('confirm_reality')} style={{ background: 'var(--color-secondary)', height: 60, fontSize: 16, fontWeight: 800, borderRadius: 18 }}>
              Validar y cerrar compra
            </button>
          </motion.div>
        ))}

        {pending.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 8 }}>¡Todo al día!</div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500 }}>No tienes compras pendientes de validación.</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 17 — Confirmar realidad de compra
   REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenConfirmReality = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [items, setItems] = useState([
    { name: 'Leche Soprole 1L', qty: '4 un.', bought: true },
    { name: 'Aceite Miraflores 1L', qty: '2 un.', bought: true },
    { name: 'Arroz Tucapel 1kg', qty: '3 un.', bought: true },
    { name: 'Detergente Ariel 3kg', qty: '1 un.', bought: false },
    { name: 'Pollo Pechuga 1kg', qty: '2 un.', bought: true }
  ]);

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('pending_purchases')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center' }}>¿Qué compraste?</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1.5px solid var(--color-line)' }}>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 500, lineHeight: 1.4 }}>
          Marca los productos que finalmente pudiste encontrar en la tienda.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                const newItems = [...items];
                newItems[i].bought = !newItems[i].bought;
                setItems(newItems);
              }}
              style={{ 
                background: 'white', 
                borderRadius: 20, 
                padding: '16px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                border: `2px solid ${it.bought ? 'var(--color-primary)' : 'var(--color-line)'}`,
                boxShadow: it.bought ? 'var(--shadow-tiny)' : 'none',
                opacity: it.bought ? 1 : 0.6,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 10, 
                border: `2.5px solid ${it.bought ? 'var(--color-primary)' : 'var(--color-line)'}`, 
                background: it.bought ? 'var(--color-primary)' : 'transparent', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {it.bought && <IcoCheck color="#fff" size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-ink)', textDecoration: it.bought ? 'none' : 'line-through' }}>{it.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>{it.qty}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px', borderTop: '1px solid var(--color-line)', background: 'white' }}>
        <button className="wf-btn" onClick={() => onNavigate('verification_upload')} style={{ height: 60, fontSize: 16, fontWeight: 800 }}>
          Confirmar y Seguir
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 18 — Carga de boleta para Verificación
   REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenVerificationUpload = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'white' }}>
    <StatusBar />
    
    <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={() => onNavigate('confirm_reality')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <IcoChevron size={20} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
      </button>
      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)' }}>Completar Gasto</div>
      <div style={{ width: 40 }} />
    </div>

    <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 12, marginTop: 24 }}>¿Cuánto pagaste?</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', lineHeight: 1.5, marginBottom: 40, fontWeight: 500 }}>
        Sube una boleta para comparar tu ahorro real o ingresa el monto manualmente.
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('savings_analysis')}
          style={{ width: '100%', height: 72, background: 'var(--color-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}
        >
          <div style={{ color: 'white' }}><IcoCam size={24} /></div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Tomar foto a la boleta</span>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1.5, background: 'var(--color-line)' }} />
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 800, textTransform: 'uppercase' }}>o manual</span>
          <div style={{ flex: 1, height: 1.5, background: 'var(--color-line)' }} />
        </div>

        <div style={{ background: 'var(--color-bg)', borderRadius: 24, padding: 24, border: '1.5px solid var(--color-line)', width: '100%' }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
             <span style={{ position: 'absolute', left: 16, top: 16, fontWeight: 900, fontSize: 20, color: 'var(--color-ink-muted)' }}>$</span>
             <input 
              type="text" 
              placeholder="0" 
              style={{ width: '100%', padding: '16px 16px 16px 36px', borderRadius: 16, border: '2px solid var(--color-line)', outline: 'none', fontWeight: 900, fontSize: 20, color: 'var(--color-ink)' }} 
             />
          </div>
          <button onClick={() => onNavigate('savings_analysis')} className="wf-btn" style={{ height: 56, fontSize: 16, fontWeight: 800 }}>Confirmar monto</button>
        </div>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 19 — Resultado de Verificación
   REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenSavingsAnalysis = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
    <StatusBar />
    
    <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
      <span style={{ width: 36 }} />
      <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center' }}>Compra Finalizada</span>
      <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: -8 }}>
        <span style={{ fontSize: 24, fontWeight: 300 }}>×</span>
      </button>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      
      {/* Resumen Gasto vs Proyectado */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--color-primary)', borderRadius: 28, padding: 28, marginBottom: 24, color: 'white' }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Gasto vs Proyectado</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900 }}>$124.500</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4FFFB0' }}>Gasto Real</div>
          </div>
          <div style={{ width: 1.5, height: 40, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, opacity: 0.9 }}>$124.950</div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Proyectado</div>
          </div>
        </div>
      </motion.div>

      {/* Qué compraste */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>¿Qué compraste?</div>
        <div style={{ background: 'white', borderRadius: 24, padding: 20, border: '1.5px solid var(--color-line)' }}>
          {[
            { name: 'Leche Soprole 1L', qty: '4 un.', price: '$4.200' },
            { name: 'Pan Bimbo Familiar', qty: '1 un.', price: '$2.350' },
            { name: 'Coca-Cola 2L', qty: '2 un.', price: '$3.400' },
            { name: 'Arroz Tucapel 1kg', qty: '2 un.', price: '$2.700' }
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 3 ? 'none' : '1px solid var(--color-bg)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-ink)' }}>{it.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>{it.qty}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-ink)' }}>{it.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de compra */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Detalle de compra</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1.5px solid var(--color-line)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Lugar de compra</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-ink)' }}>Líder Maipú</span>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1.5px solid var(--color-line)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Fecha validación</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-ink)' }}>Hoy, 28 Abr</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding: '24px 20px', background: 'white', borderTop: '1px solid var(--color-line)' }}>
      <button className="wf-btn" onClick={() => onNavigate('home')} style={{ height: 60, fontSize: 16, fontWeight: 800 }}>Finalizar Verificación</button>
    </div>
  </div>
);

