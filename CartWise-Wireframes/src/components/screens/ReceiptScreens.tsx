/**
 * @deprecated Fuera del alcance del MVP actual de Cartwise.
 *
 * Prototipo móvil de exploración de UI. Se conserva como referencia para una
 * etapa futura. No se enruta ni se renderiza: la única experiencia activa es la
 * web principal (src/web/WebApp.tsx). Contiene flujos fuera del MVP (OCR de
 * boletas, rutas/mapas, tiendas Líder/Tottus, etc.).
 *
 * No debe importarse en la navegación principal del MVP. Si una IA o
 * desarrollador encuentra este archivo, no debe reactivarlo sin actualizar
 * primero el alcance del MVP y el README.md.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar, IcoUpload, IcoCam, IcoCheck, IcoTrash, IcoEdit, IcoSearch, IcoPlus, IcoChevron, IcoShield } from '../WireframeComponents';

/* ════════════════════════════════════════
   SCREEN 14 — Selección de entrada (Boleta)
   REIMAGINADO 
   ════════════════════════════════════════ */
export const ScreenReceiptUpload = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'white' }}>
    <StatusBar />
    
    {/* Header polished */}
    <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={() => onNavigate('home')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <IcoChevron size={20} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
      </button>
      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)' }}>Subir Boleta</div>
      <div style={{ width: 40 }} />
    </div>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 12 }}>¿Quieres mejores ofertas?</div>
        <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', lineHeight: 1.5, fontWeight: 500 }}>
          Sube tu boleta para que <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>AhorraApp</span> aprenda los precios reales de tus tiendas y te de mejores recomendaciones.
        </div>
      </motion.div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('receipt_adjust')} 
          style={{ 
            height: 160, borderRadius: 24, background: 'var(--color-primary)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            gap: 12, cursor: 'pointer', color: 'white', boxShadow: 'var(--shadow-soft)'
          }}
        >
          <IcoCam size={32} />
          <span style={{ fontSize: 16, fontWeight: 800 }}>Usar Cámara</span>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('receipt_adjust')} 
          style={{ 
            height: 160, borderRadius: 24, background: 'white', border: '2px solid var(--color-line)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            gap: 12, cursor: 'pointer'
          }}
        >
          <IcoUpload size={32} color="var(--color-primary)" />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-ink)' }}>Subir Imagen</span>
        </motion.div>
      </div>

      <div style={{ background: 'var(--color-bg)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--color-primary)', marginTop: 2 }}><IcoShield size={20} /></div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 4 }}>Privacidad Garantizada</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.4, fontWeight: 500 }}>
              Tus datos son personales y <strong>no se comparten</strong> con otros usuarios. Solo se usan para mejorar tus propios planes de ahorro.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Es totalmente opcional.</span>
      </div>
    </div>

    <div style={{ padding: '0 24px 32px' }}>
      <button className="wf-btn" style={{ background: 'white', color: 'var(--color-ink-muted)', fontWeight: 800, border: '2px solid var(--color-line)' }} onClick={() => onNavigate('home')}>
        Omitir por ahora
      </button>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 15 — Ajuste de Extracción REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenReceiptAdjust = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [items, setItems] = useState([
    { name: 'Leche Soprole 1L', price: '1290', qty: '4', offer: true },
    { name: 'Aceite Miraflores', price: '2990', qty: '2', offer: false },
    { name: 'Arroz Tucapel 1kg', price: '1450', qty: '3', offer: true },
    { name: 'Detergente Ariel', price: '12400', qty: '1', offer: false },
  ]);

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('receipt_upload')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center' }}>Revisar Boleta</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ background: 'white', padding: '20px', borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Tienda Detectada</div>
            <div style={{ fontSize: 18, color: 'var(--color-ink)', fontWeight: 900 }}>Jumbo Ñuñoa</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>19 de abril, 2026</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)' }}>$23.900</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, marginLeft: 4, letterSpacing: 0.5 }}>PRODUCTOS EXTRAÍDOS (4)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'white', borderRadius: 20, padding: 16, border: '1.5px solid var(--color-line)', boxShadow: 'var(--shadow-tiny)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-ink)' }}>{it.name}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Cant: <span style={{ color: 'var(--color-ink)' }}>{it.qty}</span></div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Precio: <span style={{ color: 'var(--color-ink)' }}>${it.price}</span></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 8, background: it.offer ? '#FFF4CD' : 'var(--color-bg)', color: it.offer ? '#856404' : 'var(--color-ink-muted)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                    {it.offer ? 'Oferta' : 'Normal'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--color-line)', paddingTop: 12 }}>
                 <button style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                   <IcoEdit size={16} /> Editar
                 </button>
                 <div style={{ width: 1, height: 20, background: 'var(--color-line)' }} />
                 <button style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, fontWeight: 800, color: '#D64545', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                   <IcoTrash size={16} /> Borrar
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '24px 20px', borderTop: '1px solid var(--color-line)', background: 'white', position: 'sticky', bottom: 0 }}>
        <button className="wf-btn" style={{ height: 60, fontSize: 16, fontWeight: 800 }} onClick={() => onNavigate('receipt_confirmation')}>Finalizar y Guardar</button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 15.5 — Confirmación de Base de Datos REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenReceiptConfirmation = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ background: 'white' }}>
    <StatusBar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2FA572', marginBottom: 24, border: '1.5px solid var(--color-line)' }}
      >
        <IcoCheck size={40} />
      </motion.div>

      <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-ink)', marginBottom: 8 }}>¡Datos Inteligentes!</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', lineHeight: 1.5, marginBottom: 32, fontWeight: 500 }}>
        Has mejorado tu base de datos con <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>4 nuevos precios</span>. Esto hará que tus planes de ahorro sean mucho más precisos.
      </div>

      <div style={{ width: '100%', background: 'var(--color-bg)', borderRadius: 24, padding: 24, border: '1.5px solid var(--color-line)', marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-ink-muted)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>Productos Registrados</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {[
            'Leche Soprole 1L (Mejorado)',
            'Pan Bimbo Familiar',
            'Coca-Cola 2L (Oferta)',
            'Arroz Tucapel 1kg'
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-ink)', fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2FA572' }} />
              {item}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 16 }}>
          <span>Comercio asociado</span>
          <span style={{ fontWeight: 800, color: 'var(--color-ink)' }}>Jumbo Ñuñoa</span>
        </div>
      </div>

      <button className="wf-btn" style={{ height: 60, fontSize: 16, fontWeight: 800 }} onClick={() => onNavigate('home')}>
        Ir al Dashboard
      </button>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 16 — Base de Datos de Boletas REIMAGINADO
   ════════════════════════════════════════ */
export const ScreenReceiptDatabase = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [data] = useState([
    { prod: 'Leche Soprole 1L', store: 'Jumbo', price: '$1.290', date: '19/04', offer: true, cat: 'Lácteos' },
    { prod: 'Aceite Miraflores', store: 'Jumbo', price: '$2.990', date: '19/04', offer: false, cat: 'Abarrotes' },
    { prod: 'Detergente Ariel', store: 'Líder', price: '$12.400', date: '15/04', offer: false, cat: 'Limpieza' },
    { prod: 'Coca-Cola 2.5L', store: 'Líder', price: '$1.850', date: '15/04', offer: true, cat: 'Bebidas' },
    { prod: 'Pan Bimbo Molde', store: 'Unimarc', price: '$2.450', date: '12/04', offer: false, cat: 'Abarrotes' },
    { prod: 'Arroz Tucapel', store: 'Santa Is.', price: '$1.450', date: '05/04', offer: true, cat: 'Abarrotes' },
  ]);

  return (
    <div className="wf-content" style={{ background: 'var(--color-bg)', padding: 0 }}>
      <StatusBar />
      
      {/* Header polished */}
      <div style={{ background: 'white', padding: '16px 20px', height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-line)' }}>
        <button onClick={() => onNavigate('home')} style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-bg)', border: 'none', color: 'var(--color-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <IcoChevron size={24} style={{ transform: 'rotate(180deg)', marginRight: 2 }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, flex: 1, textAlign: 'center' }}>Precios Guardados</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ background: 'white', padding: '20px', borderBottom: '1.5px solid var(--color-line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Tu Base de Datos</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-ink)' }}>482 <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontWeight: 600 }}>ítems</span></div>
          </div>
          <div style={{ color: 'var(--color-primary)' }}><IcoShield size={24} /></div>
        </div>

        <div style={{ background: 'var(--color-bg)', borderRadius: 16, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, border: '1.5px solid var(--color-line)' }}>
          <IcoSearch size={20} color="var(--color-ink-muted)" />
          <input 
            type="text" 
            placeholder="Buscar producto o tienda..." 
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 15, fontWeight: 600, outline: 'none', color: 'var(--color-ink)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((row, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'white', padding: 18, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid var(--color-line)', boxShadow: 'var(--shadow-tiny)' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {row.cat === 'Lácteos' ? '🥛' : row.cat === 'Abarrotes' ? '🥫' : row.cat === 'Limpieza' ? '🧼' : '🥤'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-ink)' }}>{row.prod}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 4, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{row.store}</span>
                    <span>·</span>
                    <span>{row.date}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-ink)' }}>{row.price}</div>
                {row.offer && <div style={{ fontSize: 10, color: '#F26522', fontWeight: 800, marginTop: 2 }}>OFERTA</div>}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div style={{ marginTop: 24, padding: 20, background: 'white', borderRadius: 20, textAlign: 'center', border: '1.5px dashed var(--color-line)' }}>
           <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 800 }}>Cargar historial completo</span>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('receipt_upload')} 
        style={{ 
          position: 'absolute', 
          bottom: 32, 
          right: 24, 
          width: 60, 
          height: 60, 
          borderRadius: 20, 
          background: 'var(--color-primary)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: 'var(--shadow-soft)',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <IcoCam size={28} />
      </motion.div>
    </div>
  );
};

