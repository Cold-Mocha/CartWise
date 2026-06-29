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
import { StatusBar, IcoUpload, IcoCam, IcoCheck, IcoRoute, IcoPin, IcoWork, IcoBell, TabToggle, AddressRow, IcoList, IcoCart, IcoSearch, IcoChevron } from '../WireframeComponents';
import { MicBtn } from './FlowScreens';

/* ════════════════════════════════════════
   SCREEN 4 — Onboarding 1/5
════════════════════════════════════════ */
export const ScreenOnb1 = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [voiceActive, setVoiceActive] = useState(false);
  
  return (
    <div className="wf-content" style={{ padding: 0 }}>
      <StatusBar />
      <div style={{ background: 'var(--color-bg)', padding: '16px 20px 20px', borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => onNavigate('register')} style={{ cursor: 'pointer', color: 'var(--color-ink-muted)' }}>
              <IcoChevron dir="left" size={24} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paso 1 de 4</span>
          </div>
          <button onClick={() => onNavigate('home')} style={{ fontSize: 13, color: 'var(--color-primary)', border: 'none', background: 'none', fontWeight: 700 }}>Saltar</button>
        </div>
        <div className="wf-progress-bar"><div className="wf-progress-fill" style={{ width: '20%' }} /></div>
      </div>
      
      <div className="wf-content" style={{ paddingTop: 24 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 8, letterSpacing: -0.5 }}>Cuéntanos qué compras</div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-muted)', marginBottom: 32, lineHeight: 1.5, fontWeight: 500 }}>Ingresa los productos que compras siempre para armar tu canasta base.</div>
        
        {/* Voice & Manual Input Section */}
        <div style={{ background: voiceActive ? 'var(--color-ink)' : 'white', padding: '20px', borderRadius: 20, border: '1px solid var(--color-line)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: 24, boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, background: voiceActive ? 'rgba(255,255,255,0.1)' : 'var(--color-bg)', border: '1.5px solid var(--color-line)', borderRadius: 12, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
              {voiceActive ? (
                <>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
                    {[12, 20, 14, 24, 10, 18].map((h, i) => (
                      <div key={i} style={{ width: 3, height: h, background: 'var(--color-secondary)', borderRadius: 2 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 15, color: 'white', fontWeight: 600, opacity: 0.9 }}>
                    "10 leches, 2 aceites, pan..."
                  </span>
                </>
              ) : (
                <>
                  <IcoSearch size={18} color="var(--color-ink-muted)" />
                  <span style={{ fontSize: 15, color: 'var(--color-ink-muted)', fontWeight: 500 }}>Escribe un producto...</span>
                </>
              )}
            </div>
            <div onClick={() => setVoiceActive(!voiceActive)} style={{ cursor: 'pointer' }}>
              <MicBtn active={voiceActive} />
            </div>
          </div>
          
          <div style={{ fontSize: 13, color: voiceActive ? 'rgba(255,255,255,0.4)' : 'var(--color-ink-muted)', marginTop: 12, textAlign: 'center', fontWeight: 600 }}>
            {voiceActive ? "Escuchando... toca para detener" : "🎤 Toca el micrófono para dictar por voz"}
          </div>
        </div>

        <div className="wf-section-title" style={{ marginBottom: 12 }}>Elementos detectados</div>
        <div className="wf-card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          {[
            { n: 'Leche Soprole 1L', q: '4' },
            { n: 'Aceite Miraflores 1L', q: '2' },
            { n: 'Pan de molde XL', q: '1' }
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i === 2 ? 'none' : '1px solid var(--color-line)', background: 'white' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{it.n}</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 600 }}>Cargar por unidad</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg)', borderRadius: 10, padding: '4px' }}>
                  <button style={{ width: 28, height: 28, border: 'none', background: 'white', borderRadius: 8, fontSize: 18, color: 'var(--color-ink-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>−</button>
                  <span style={{ fontSize: 15, fontWeight: 800, minWidth: 32, textAlign: 'center' }}>{it.q}</span>
                  <button style={{ width: 28, height: 28, border: 'none', background: 'var(--color-primary)', borderRadius: 8, fontSize: 18, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>+</button>
                </div>
                <span style={{ color: 'var(--color-secondary)', opacity: 0.6, fontSize: 24, fontWeight: 300, cursor: 'pointer', marginLeft: 4 }}>×</span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 800, padding: '12px 0', textAlign: 'center', cursor: 'pointer' }}>+ Agregar producto</div>
      </div>
      
      <div style={{ marginTop: 'auto', padding: '24px 20px' }}>
        <button className="wf-btn shadow-lg" onClick={() => onNavigate('onb3')}>Continuar</button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 6 — Onboarding 3/5
════════════════════════════════════════ */
export const ScreenOnb3 = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ padding: 0 }}>
    <StatusBar />
    <div style={{ background: 'var(--color-bg)', padding: '16px 20px 20px', borderBottom: '1px solid var(--color-line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => onNavigate('onb1')} style={{ cursor: 'pointer', color: 'var(--color-ink-muted)' }}>
            <IcoChevron dir="left" size={24} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paso 2 de 4</span>
        </div>
      </div>
      <div className="wf-progress-bar"><div className="wf-progress-fill" style={{ width: '50%' }} /></div>
    </div>
    
    <div className="wf-content" style={{ paddingTop: 24 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 8, letterSpacing: -0.5 }}>¿Dónde compras?</div>
      <div style={{ fontSize: 15, color: 'var(--color-ink-muted)', marginBottom: 24, lineHeight: 1.5, fontWeight: 500 }}>Danos tu ubicación para comparar precios en tiendas cercanas.</div>

      <div style={{ marginBottom: 28 }}>
        <AddressRow icon={null as any} label="País" placeholder="Chile" />
        <AddressRow icon={null as any} label="Ciudad" placeholder="Santiago" />
        <AddressRow icon={null as any} label="Comuna" placeholder="Providencia" />
      </div>

      <div className="wf-card" style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', borderStyle: 'solid', borderWidth: 1, marginBottom: 28, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <IcoRoute size={18} /> Optimiza tu ruta
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20, lineHeight: 1.5, fontWeight: 500 }}>
          Si agregas tus lugares frecuentes, te sugeriremos tiendas que te queden de camino.
        </div>
        <AddressRow icon={<IcoPin size={14} />} label="Mi casa" placeholder="Parque Bustamante 123" badge="Casa" />
        <AddressRow icon={<IcoWork size={14} />} label="Mi trabajo" placeholder="Av. Providencia 1100" badge="Trabajo" />
      </div>

      <div className="wf-section-title" style={{ marginBottom: 16 }}>Tus Supermercados Preferidos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {[
          { n: 'Jumbo', sel: true }, 
          { n: 'Líder', sel: true }, 
          { n: 'Unimarc', sel: false }, 
          { n: 'Tottus', sel: false }, 
          { n: 'Santa Isabel', sel: true }, 
          { n: 'Acuenta', sel: false }
        ].map((s, i) => (
          <div key={i} className="wf-card" style={{ padding: '16px 12px', border: s.sel ? '2px solid var(--color-primary)' : '1px solid var(--color-line)', background: s.sel ? 'white' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', boxShadow: s.sel ? 'var(--shadow-soft)' : 'none' }}>
            <div style={{ width: 44, height: 32, background: 'var(--color-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <IcoCart size={18} color={s.sel ? 'var(--color-primary)' : 'var(--color-line)'} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: s.sel ? 'var(--color-ink)' : 'var(--color-ink-muted)' }}>{s.n}</span>
            {s.sel && <div style={{ position: 'absolute', top: 8, right: 8 }}><IcoCheck color="var(--color-primary)" size={16} /></div>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', textAlign: 'center', paddingBottom: 20, fontWeight: 500 }}>Puedes cambiar esto en Configuración</div>
    </div>
    <div style={{ padding: '24px 20px' }}>
      <button className="wf-btn shadow-md" onClick={() => onNavigate('onb_budget')}>Siguiente</button>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 7 — Onboarding 4/4
════════════════════════════════════════ */
/* ════════════════════════════════════════
   SCREEN 6bis — Onboarding 4/5 (Presupuesto)
   ════════════════════════════════════════ */
export const ScreenOnbBudget = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content" style={{ padding: 0 }}>
    <StatusBar />
    <div style={{ background: 'var(--color-bg)', padding: '16px 20px 20px', borderBottom: '1px solid var(--color-line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => onNavigate('onb3')} style={{ cursor: 'pointer', color: 'var(--color-ink-muted)' }}>
            <IcoChevron dir="left" size={24} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paso 3 de 4</span>
        </div>
      </div>
      <div className="wf-progress-bar"><div className="wf-progress-fill" style={{ width: '75%' }} /></div>
    </div>
    
    <div className="wf-content" style={{ paddingTop: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 8, letterSpacing: -0.5 }}>Presupuesto mensual</div>
      <div style={{ fontSize: 15, color: 'var(--color-ink-muted)', marginBottom: 32, lineHeight: 1.5, fontWeight: 500 }}>
        ¿Cuánto es lo máximo que quieres gastar al mes? Te ayudaremos a optimizar cada peso.
      </div>
      
      <div className="wf-card" style={{ padding: '24px', marginBottom: 20, textAlign: 'center', background: 'white' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>MONTO MENSUAL OBJETIVO</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-primary)', marginRight: 4 }}>$</span>
          <input 
            type="text" 
            defaultValue="600.000" 
            style={{ width: '180px', border: 'none', background: 'transparent', fontSize: 42, fontWeight: 900, color: 'var(--color-ink)', outline: 'none', textAlign: 'left' }} 
          />
        </div>
        <div style={{ marginTop: 12, height: 2, background: 'var(--color-primary)', width: '100%', borderRadius: 99, opacity: 0.2 }} />
      </div>
    </div>
    <div style={{ padding: '24px 20px' }}>
      <button className="wf-btn shadow-md" onClick={() => onNavigate('onb4')}>Continuar</button>
    </div>
  </div>
);

export const ScreenOnb4 = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const [selected, setSelected] = useState('Inicio de mes');
  const [customDay, setCustomDay] = useState(1);
  
  const options = [
    { label: 'Inicio de mes', sub: '1° de cada mes' },
    { label: 'Quincena + inicio', sub: '1° y 15 de cada mes' },
    { label: 'Solo manual', sub: 'Sin notificaciones' },
    { label: 'Personalizado', sub: 'Tú eliges los días de aviso' },
  ];

  return (
    <div className="wf-content" style={{ padding: 0 }}>
      <StatusBar />
      <div style={{ background: 'var(--color-bg)', padding: '16px 20px 20px', borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => onNavigate('onb_budget')} style={{ cursor: 'pointer', color: 'var(--color-ink-muted)' }}>
              <IcoChevron dir="left" size={24} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paso 4 de 4</span>
          </div>
        </div>
        <div className="wf-progress-bar"><div className="wf-progress-fill" style={{ width: '100%' }} /></div>
      </div>
      
      <div className="wf-content" style={{ paddingTop: 32, textAlign: 'center', flex: 1 }}>

        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 12, letterSpacing: -0.5 }}>¿Cuándo quieres tu plan?</div>
        <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', marginBottom: 40, lineHeight: 1.5, padding: '0 12px', fontWeight: 500 }}>
          Te avisamos cuando tu plan mensual esté listo para que empieces a ahorrar de inmediato.
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {options.map((opt, i) => {
            const isSel = selected === opt.label;
            return (
              <div key={i}>
                <div 
                  onClick={() => setSelected(opt.label)}
                  className="wf-card" 
                  style={{ 
                    padding: 18, 
                    border: isSel ? '2.5px solid var(--color-primary)' : '1px solid var(--color-line)', 
                    background: isSel ? 'white' : 'transparent', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16, 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    marginBottom: 0
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${isSel ? 'var(--color-primary)' : 'var(--color-line)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSel && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{opt.sub}</div>
                  </div>
                </div>

                {opt.label === 'Personalizado' && isSel && (
                  <div style={{ 
                    marginTop: -4, 
                    padding: '24px 18px', 
                    background: 'white', 
                    border: '2.5px solid var(--color-primary)', 
                    borderTop: 'none',
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20
                  }}>
                    {/* Day Selection */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Día de inicio</div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="number" 
                          min="1" 
                          max="31"
                          value={customDay || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setCustomDay(Math.min(31, Math.max(1, val)));
                            else setCustomDay(0);
                          }}
                          className="wf-input"
                          style={{ 
                            width: '100%', 
                            height: 52, 
                            borderRadius: 12, 
                            paddingLeft: 16, 
                            paddingRight: 110,
                            fontSize: 16, 
                            fontWeight: 700,
                            color: 'var(--color-ink)',
                            background: 'var(--color-bg)',
                            border: '1.5px solid var(--color-line)'
                          }}
                          placeholder="Ej: 1"
                        />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: 'var(--color-ink-muted)', pointerEvents: 'none' }}>
                          de cada mes
                        </span>
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora del aviso</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ padding: '10px 16px', background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-line)', fontSize: 15, fontWeight: 700, flex: 1, textAlign: 'center' }}>09:00 AM</div>
                        <div style={{ padding: '10px 16px', background: 'white', borderRadius: 10, border: '1px solid var(--color-line)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)' }}>Cambiar</div>
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-ink-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Se repite cada</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['Día', 'Semana', 'Mes'].map((f, i) => (
                          <div key={i} style={{ 
                            flex: 1,
                            padding: '10px', 
                            borderRadius: 10, 
                            border: f === 'Mes' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-line)',
                            background: f === 'Mes' ? 'var(--color-primary-light)' : 'transparent',
                            color: f === 'Mes' ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                            fontSize: 13,
                            fontWeight: 700,
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: 10, fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                      Te enviaremos una notificación el día {customDay} de cada mes a las 09:00 AM.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '24px 20px' }}>
        <button className="wf-btn shadow-lg" onClick={() => onNavigate('home')}>Comenzar a optimizar</button>
      </div>
    </div>
  );
};
