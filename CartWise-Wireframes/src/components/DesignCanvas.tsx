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

import React, { useRef, useCallback, useEffect, ReactNode, CSSProperties } from 'react';

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// ─────────────────────────────────────────────────────────────
// Main canvas — transform-based pan/zoom viewport
// ─────────────────────────────────────────────────────────────
export function DesignCanvas({ children, minScale = 0.1, maxScale = 8, style = {} }: { children: ReactNode, minScale?: number, maxScale?: number, style?: CSSProperties }) {
  const vpRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tf = useRef({ x: 0, y: 0, scale: 1 });

  const apply = useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx: number, cy: number, factor: number) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    const isMouseWheel = (e: WheelEvent) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isGesturing) return; 
      if (e.ctrlKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e: any) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e: any) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e: any) => { e.preventDefault(); isGesturing = false; };

    let drag: { id: number, lx: number, ly: number } | null = null;
    const onPointerDown = (e: PointerEvent) => {
      const onBg = e.target === vp || e.target === worldRef.current;
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart' as any, onGestureStart, { passive: false });
    vp.addEventListener('gesturechange' as any, onGestureChange, { passive: false });
    vp.addEventListener('gestureend' as any, onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart' as any, onGestureStart);
      vp.removeEventListener('gesturechange' as any, onGestureChange);
      vp.removeEventListener('gestureend' as any, onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
          backgroundImage: gridSvg,
          backgroundSize: '120px 120px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section — title + subtitle + h-stack of artboards (no wrap)
// ─────────────────────────────────────────────────────────────
export function DCSection({ title, subtitle, children, gap = 48 }: { title: string, subtitle?: string, children: ReactNode, gap?: number }) {
  return (
    <div style={{ marginBottom: 80, position: 'relative' }}>
      <div style={{ padding: '0 60px 36px' }}>
        <div style={{
          fontSize: 22, fontWeight: 600, color: DC.title,
          letterSpacing: -0.3, marginBottom: 4,
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: 14, fontWeight: 400, color: DC.subtitle,
          }}>{subtitle}</div>
        )}
      </div>
      <div style={{
        display: 'flex', gap, padding: '0 60px',
        alignItems: 'flex-start', width: 'max-content',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Artboard — labeled card
// ─────────────────────────────────────────────────────────────
export function DCArtboard({ label, children, width, height, style = {} }: { label?: string, children: ReactNode, width: number, height: number, style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {label && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0,
          paddingBottom: 8,
          fontSize: 12, fontWeight: 500, color: DC.label,
          whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
      <div style={{
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        width, height,
        background: '#fff',
        ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
export function DCPostIt({ children, top, left, right, bottom, rotate = -2, width = 180 }: { children: ReactNode, top?: number, left?: number, right?: number, bottom?: number, rotate?: number, width?: number }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      background: DC.postitBg, padding: '14px 16px',
      fontFamily: DC.font,
      fontSize: 14, lineHeight: 1.4, color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Flow Arrow — icon between artboards
// ─────────────────────────────────────────────────────────────
export function DCFlowArrow({ label, color = '#0E7C7B' }: { label?: string, color?: string }) {
  return (
    <div style={{
      alignSelf: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      flexShrink: 0,
      marginTop: 20
    }}>
      {label && (
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          background: '#fff',
          padding: '1px 6px',
          borderRadius: 8,
          border: `1.5px solid ${color}`,
          marginBottom: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}>
          {label}
        </div>
      )}
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" style={{ overflow: 'visible' }}>
        <path d="M0 12H44" stroke={color} strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
        <path d="M36 4L44 12L36 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Home Target — represents the main dashboard destination
// ─────────────────────────────────────────────────────────────
export function DCHomeTarget({ color = '#0E7C7B' }: { color?: string }) {
  return (
    <div style={{
      alignSelf: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px',
      opacity: 0.8
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8
      }}>
        Pestaña Principal
      </div>
      <div style={{
        width: 54,
        height: 54,
        borderRadius: 16,
        background: '#fff',
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Flow Trigger — represents the button or action that starts a flow
// ─────────────────────────────────────────────────────────────
export function DCFlowTrigger({ label, note, color = '#555' }: { label: string, note?: string, color?: string }) {
  return (
    <div style={{
      alignSelf: 'center',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginRight: -10,
      padding: '0 10px'
    }}>
      <div style={{
        background: '#fff',
        border: `1.5px solid ${color}`,
        borderRadius: 10,
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 700,
        color,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          {label}
        </div>
        {note && (
          <div style={{
            fontSize: 10,
            opacity: 0.6,
            fontWeight: 500,
            paddingLeft: 16,
            marginTop: -2
          }}>
            {note}
          </div>
        )}
      </div>
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" style={{ overflow: 'visible' }}>
        <path d="M0 10H28" stroke={color} strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />
        <path d="M22 4L28 10L22 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
