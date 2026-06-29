import React, { ReactNode, CSSProperties } from 'react';

/* ── Icons ── */
export const Ico = ({ d, d2, size = 20, color = 'currentColor', stroke = 1.8, fill = 'none', style = {} }: { d: string, d2?: string, size?: number, color?: string, stroke?: number, fill?: string, style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={d} />{d2 && <path d={d2} />}
  </svg>
);

export const IcoHome = () => <Ico d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" />;
export const IcoList = () => <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
export const IcoCam = () => <Ico d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z" />;
export const IcoChart = () => <Ico d="M18 20V10 M12 20V4 M6 20v-6" />;
export const IcoUser = () => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />;
export const IcoUpload = () => <Ico d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />;
export const IcoCheck = ({ color = '#2FA572', size = 20 }) => <Ico d="M20 6L9 17l-5-5" color={color} stroke={2.5} size={size} />;
export const IcoPin = () => <Ico d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 10a1 1 0 100-2 1 1 0 000 2z" />;
export const IcoSearch = () => <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />;
export const IcoEdit = () => <Ico d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
export const IcoBell = () => <Ico d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" />;
export const IcoLock = () => <Ico d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4" />;
export const IcoCard = () => <Ico d="M1 4h22v4H1z M1 12h22v8H1z" />;
export const IcoTrash = () => <Ico d="M3 6h18 M19 6l-1 14H6L5 6 M9 6V4h6v2" color="#D64545" />;
export const IcoChevron = ({ dir = 'right', size = 20, color = 'currentColor', style = {} }: { dir?: 'right' | 'left', size?: number, color?: string, style?: CSSProperties }) => <Ico d={dir === 'right' ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} stroke={2} size={size} color={color} style={style} />;

export const IcoWork = () => <Ico d="M20 7H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />;
export const IcoRoute = () => <Ico d="M3 12h18 M3 6h6 M15 6h6 M3 18h6 M15 18h6" />;
export const IcoCart = ({ size = 20, color = 'currentColor' }) => <Ico size={size} color={color} d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0" />;
export const IcoPlus = ({ size = 20, color = 'currentColor' }) => <Ico size={size} color={color} d="M12 5v14M5 12h14" stroke={3} />;
export const IcoShield = ({ size = 20, color = 'currentColor' }) => <Ico size={size} color={color} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

/* ── Shared primitives ── */
export const StatusBar = ({ light }: { light?: boolean }) => (
  <div className="wf-statusbar" style={{ color: light ? 'rgba(255,255,255,0.9)' : 'var(--color-ink)' }}>
    <span style={{ fontSize: 13 }}>9:41</span>
    <span style={{ fontSize: 12, opacity: 0.8 }}>●●● WiFi 🔋</span>
  </div>
);

export const BottomNav = ({ active = 'home', onNavigate }: { active?: string, onNavigate?: (s: string) => void }) => {
  const items = [
    { id: 'home', label: 'Inicio', icon: <IcoHome /> },
    { id: 'generar_compra', label: 'Plan', icon: <IcoList /> },
    { id: 'receipt_upload', label: 'Boleta', icon: <IcoCam /> },
    { id: 'historial', label: 'Historial', icon: <IcoChart /> },
    { id: 'perfil', label: 'Perfil', icon: <IcoUser /> },
  ];

  return (
    <div className="wf-nav">
      {items.map((it) => (
        <div 
          key={it.id} 
          className={`wf-nav-item ${it.id === active ? 'active' : ''}`}
          onClick={() => onNavigate?.(it.id)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ transform: it.id === active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease' }}>
            {React.cloneElement(it.icon as React.ReactElement, { color: it.id === active ? 'var(--color-primary)' : 'var(--color-ink-muted)' })}
          </div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
};

export const Divider = () => <div style={{ height: 1.5, background: 'var(--color-line)', margin: '16px 0', opacity: 0.6 }} />;
export const Row = ({ children, style = {} }: { children: ReactNode, style?: CSSProperties }) => <div style={{ display: 'flex', gap: 12, alignItems: 'center', ...style }}>{children}</div>;

export const TabToggle = ({ tabs, active, onChange }: { tabs: string[], active: string, onChange: (t: string) => void }) => (
  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 14, padding: 4, marginBottom: 20 }}>
    {tabs.map((t) => (
      <div 
        key={t} 
        onClick={() => onChange(t)}
        style={{ 
          flex: 1, 
          background: active === t ? 'var(--color-surface)' : 'transparent', 
          borderRadius: 11, 
          padding: '10px 0',
          textAlign: 'center', 
          boxShadow: active === t ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
          fontSize: 14, 
          fontWeight: 700,
          color: active === t ? 'var(--color-ink)' : 'var(--color-ink-muted)', 
          cursor: 'pointer', 
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

export const AddressRow = ({ icon, label, placeholder, badge }: { icon: ReactNode, label: string, placeholder: string, badge?: string }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span> {label}
    </div>
    <div className="wf-input" style={{ gap: 12, color: 'var(--color-ink)', justifyContent: 'space-between', boxShadow: 'var(--shadow-soft)' }}>
      <span style={{ fontWeight: 500 }}>{placeholder}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge && <span className="wf-chip" style={{ fontSize: 10 }}>{badge}</span>}
        <span style={{ color: 'var(--color-line)', fontSize: 18 }}>▾</span>
      </div>
    </div>
  </div>
);
