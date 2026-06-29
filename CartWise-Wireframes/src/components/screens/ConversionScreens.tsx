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
import { StatusBar, IcoCheck, IcoUpload, TabToggle, IcoSearch, IcoCart } from '../WireframeComponents';

/* ════════════════════════════════════════
   SCREEN 1 — Landing
   ════════════════════════════════════════ */
export const ScreenLanding = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content">
    <StatusBar />
    <div style={{ padding: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary)', letterSpacing: -1 }}>Cartwise</span>
    </div>
    <div style={{ padding: '20px 0 40px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.05, marginBottom: 16, letterSpacing: -1.5 }}>
        Optimiza y controla<br />tu gasto mensual.
      </div>
      <div style={{ fontSize: 17, color: 'var(--color-ink-muted)', marginBottom: 32, lineHeight: 1.5, maxWidth: 300, margin: '0 auto 32px', fontWeight: 500 }}>
        Dinos qué compras y te diremos exactamente dónde comprar para pagar menos.
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button 
          className="wf-btn shadow-lg" 
          onClick={() => onNavigate('register')}
        >
          Crear cuenta gratis
        </button>
        <button 
          className="wf-btn-ghost" 
          style={{ color: 'var(--color-primary)', fontWeight: 700 }}
          onClick={() => onNavigate('login')}
        >
          Ya tengo cuenta, ingresar
        </button>
      </div>

      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ display: 'flex' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', border: '2.5px solid var(--color-bg)', marginLeft: i === 1 ? 0 : -12 }} />
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 }}>+2.400 familias ahorrando</span>
      </div>
    </div>

    <div style={{ paddingBottom: 40 }}>
      <div className="wf-section-title" style={{ marginBottom: 20, textAlign: 'center' }}>¿Cómo funciona Cartwise?</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { icon: <IcoUpload size={22} />, title: 'Carga', desc: 'Sube una foto de tu boleta anterior.', bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
          { icon: <IcoSearch size={22} />, title: 'Compara', desc: 'Buscamos en las 8 cadenas de Chile.', bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
          { icon: <IcoCheck size={22} />, title: 'Optimiza', desc: 'Sigue tu plan inteligente.', bg: '#ECFDF5', color: '#10B981' },
          { icon: <IcoCart size={22} />, title: 'Repite', desc: 'Actualizamos precios cada día.', bg: 'white', color: 'var(--color-ink-muted)' }
        ].map((step, i) => (
          <div key={i} className="wf-card" style={{ padding: 16, background: step.bg, border: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, boxShadow: 'var(--shadow-soft)' }}>
              {step.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 2 }}>{step.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.4, fontWeight: 500 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ background: 'var(--color-ink)', margin: '0 -20px', padding: '40px 24px', borderRadius: '32px 32px 0 0' }}>
      <div className="wf-section-title" style={{ color: 'white', opacity: 0.6, marginBottom: 20 }}>Testimonios reales</div>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 16, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontStyle: 'italic', marginBottom: 12, lineHeight: 1.6, fontWeight: 500 }}>
          "Antes iba solo al Jumbo por costumbre. Con Cartwise me di cuenta que dividiendo mi compra en dos tiendas gasto casi 60 lucas menos al mes."
        </div>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>— Daniela R., Maipú</div>
      </div>
    </div>
  </div>
);

export const SourceBadge = ({ type }: { type: string }) => {
  const config = ({
    boleta: { bg: '#E8F5EF', color: '#2FA572', label: 'BOLETA' },
    web: { bg: '#f4f6f7', color: '#8A94A1', label: 'WEB' },
    both: { bg: '#E6F4F4', color: '#0E7C7B', label: 'WEB y BOLETA' }
  } as any)[type] || { bg: '#f4f6f7', color: '#8A94A1', label: 'WEB' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: config.bg, color: config.color, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
      Fuentes: {config.label}
    </span>
  );
};

/* ════════════════════════════════════════
   SCREEN 3b — Registrarte
   ════════════════════════════════════════ */
export const ScreenRegister = ({ onNavigate }: { onNavigate: (s: string) => void }) => (
  <div className="wf-content">
    <StatusBar />
    <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={() => onNavigate('landing')} style={{ fontSize: 24, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-ink)' }}>←</button>
      <span className="wf-section-title">Crear Cuenta</span>
      <span style={{ width: 24 }} />
    </div>
    <div style={{ padding: '30px 0' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 12, textAlign: 'center', letterSpacing: -1 }}>Únete a Cartwise</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: 40, fontWeight: 500 }}>Guarda tu canasta y empieza a gestionar tu presupuesto hoy mismo.</div>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Nombre completo</div>
        <div className="wf-input">Juan Pérez</div>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Correo electrónico</div>
        <div className="wf-input">juan.perez@email.com</div>
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Contraseña</div>
        <div className="wf-input">••••••••••••</div>
      </div>

      <button className="wf-btn shadow-md" onClick={() => onNavigate('onb1')}>Crear cuenta y Continuar</button>
      
      <div style={{ marginTop: 32, textAlign: 'center', fontSize: 15, color: 'var(--color-ink-muted)', fontWeight: 500 }}>
        ¿Ya tienes cuenta? <span onClick={() => onNavigate('login')} style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>Inicia sesión</span>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 1b — Iniciar Sesión
   ════════════════════════════════════════ */
export const ScreenLogin = ({ onNavigate, target = 'home' }: { onNavigate: (s: string) => void, target?: string }) => (
  <div className="wf-content">
    <StatusBar />
    <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={() => onNavigate('landing')} style={{ fontSize: 24, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-ink)' }}>←</button>
      <span className="wf-section-title">Iniciar Sesión</span>
      <span style={{ width: 24 }} />
    </div>
    <div style={{ padding: '30px 0' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 12, textAlign: 'center', letterSpacing: -1 }}>Bienvenido de nuevo</div>
      <div style={{ fontSize: 16, color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: 40, fontWeight: 500 }}>Ingresa tus credenciales para continuar.</div>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Correo electrónico</div>
        <div className="wf-input">usuario@email.com</div>
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Contraseña</div>
        <div className="wf-input">••••••••••••</div>
      </div>

      <button className="wf-btn shadow-md" onClick={() => onNavigate(target)}>Entrar</button>
      
      <div style={{ marginTop: 32, textAlign: 'center', fontSize: 15, color: 'var(--color-ink-muted)', fontWeight: 500 }}>
        ¿No tienes cuenta? <span onClick={() => onNavigate('register')} style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>Regístrate</span>
      </div>
    </div>
  </div>
);
