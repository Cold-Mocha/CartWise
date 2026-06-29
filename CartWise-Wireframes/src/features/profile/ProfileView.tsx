/**
 * @deprecated Fuera del alcance del MVP actual de Cartwise.
 *
 * Este archivo se conserva como referencia para una etapa futura.
 * No debe importarse ni usarse en la navegación principal del MVP.
 *
 * El perfil incluye conceptos fuera del MVP (autenticación real / 2FA,
 * alertas de precio, notificaciones push, ubicación). Por eso queda inactivo.
 *
 * MVP actual:
 * - Landing pública
 * - Login demo
 * - Dashboard mensual
 * - Búsqueda de productos
 * - Compra pendiente
 * - Comparación y plan recomendado
 * - Historial
 * - Listas guardadas simples
 * - Despensa simulada
 *
 * Si una IA o desarrollador encuentra este archivo, no debe reactivarlo
 * sin actualizar primero el alcance del MVP y el README.md.
 */
import {useState, type Dispatch, type SetStateAction} from 'react';
import {Settings, Trash2} from 'lucide-react';
import {
  COMUNAS,
  DEFAULT_ACCOUNT,
  IDIOMAS,
  MONEDAS,
  PAISES,
  ZONAS_HORARIAS,
} from '../../domain/constants';
import type {Account, ProfileTab} from '../../domain/types';
import {accountInitials, cityValid, emailValid, phoneValid} from '../../lib/validation';
import {Hero} from '../../components/ui';
import {ProfileTabs} from './ProfileTabs';

export function ProfileView({
  account,
  onAccountChange,
}: {
  account: Account;
  onAccountChange: Dispatch<SetStateAction<Account>>;
}) {
  const [tab, setTab] = useState<ProfileTab>('cuenta');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Account>(account);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const set = <K extends keyof Account>(key: K, value: Account[K]) =>
    setDraft((current) => ({...current, [key]: value}));

  const emailOk = emailValid(draft.email);
  const phoneOk = phoneValid(draft.phone);
  const cityOk = cityValid(draft.city);
  const passwordTouched = newPassword.length > 0 || confirmPassword.length > 0;
  const passwordOk = !passwordTouched || (newPassword.length >= 8 && newPassword === confirmPassword);
  const canSave = emailOk && phoneOk && cityOk && passwordOk;

  const resetPasswordFields = () => {
    setNewPassword('');
    setConfirmPassword('');
  };
  const startEdit = () => {
    setDraft(account);
    resetPasswordFields();
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    resetPasswordFields();
  };
  const save = () => {
    if (!canSave) return;
    onAccountChange(() => ({...draft, email: draft.email.trim(), city: draft.city.trim()}));
    setEditing(false);
    resetPasswordFields();
  };
  const deleteAccount = () => {
    if (window.confirm('¿Eliminar tu cuenta? Se borrarán tus datos guardados en este navegador.')) {
      onAccountChange(() => ({...DEFAULT_ACCOUNT}));
      setEditing(false);
    }
  };

  const fullName = [account.firstName, account.lastName].filter(Boolean).join(' ');
  const yn = (value: boolean) => (value ? 'Sí' : 'No');
  const avatar = (
    <span className="cw-avatar" aria-hidden="true">
      {account.avatarUrl ? <img src={account.avatarUrl} alt="" /> : accountInitials(account)}
    </span>
  );

  const renderView = () => {
    if (tab === 'cuenta') {
      return (
        <>
          <div className="cw-profile-identity">
            {avatar}
            <div>
              <strong>{fullName || account.username}</strong>
              <span>@{account.username}</span>
            </div>
          </div>
          <table className="cw-data-table"><tbody>
            <tr><th scope="row">Nombre de usuario</th><td>{account.username || '—'}</td></tr>
            <tr><th scope="row">Nombre</th><td>{account.firstName || '—'}</td></tr>
            <tr><th scope="row">Apellido</th><td>{account.lastName || '—'}</td></tr>
            <tr><th scope="row">Correo</th><td>{account.email}</td></tr>
            <tr><th scope="row">Teléfono</th><td>{account.phone || '—'}</td></tr>
            <tr><th scope="row">Contraseña</th><td>••••••••</td></tr>
          </tbody></table>
        </>
      );
    }
    if (tab === 'ubicacion') {
      return (
        <table className="cw-data-table"><tbody>
          <tr><th scope="row">País</th><td>{account.country}</td></tr>
          <tr><th scope="row">Región / estado</th><td>{account.region || '—'}</td></tr>
          <tr><th scope="row">Ciudad / comuna</th><td>{account.city}</td></tr>
          <tr><th scope="row">Dirección</th><td>{account.address || '—'}</td></tr>
          <tr><th scope="row">Código postal</th><td>{account.postalCode || '—'}</td></tr>
          <tr><th scope="row">Idioma</th><td>{account.language}</td></tr>
          <tr><th scope="row">Zona horaria</th><td>{account.timezone}</td></tr>
          <tr><th scope="row">Moneda</th><td>{account.currency}</td></tr>
        </tbody></table>
      );
    }
    if (tab === 'notificaciones') {
      return (
        <table className="cw-data-table"><tbody>
          <tr><th scope="row">Correos de novedades</th><td>{yn(account.notifyEmail)}</td></tr>
          <tr><th scope="row">Notificaciones push</th><td>{yn(account.notifyPush)}</td></tr>
          <tr><th scope="row">Alertas de precio</th><td>{yn(account.priceAlerts)}</td></tr>
        </tbody></table>
      );
    }
    return (
      <>
        <table className="cw-data-table"><tbody>
          <tr>
            <th scope="row">Verificación en dos pasos</th>
            <td><span className={account.twoFactor ? 'cw-status-ok' : 'cw-status-bad'}>{account.twoFactor ? 'Activada' : 'Desactivada'}</span></td>
          </tr>
          <tr><th scope="row">Sesión actual</th><td>Este navegador · activa ahora</td></tr>
        </tbody></table>
        <button type="button" className="cw-danger-btn" onClick={deleteAccount}>
          <Trash2 size={16} aria-hidden="true" />
          Eliminar cuenta
        </button>
      </>
    );
  };

  const renderEdit = () => {
    if (tab === 'cuenta') {
      return (
        <div className="cw-profile-grid">
          <label className="cw-field">Nombre de usuario
            <input value={draft.username} onChange={(e) => set('username', e.target.value)} />
          </label>
          <label className="cw-field">URL de avatar (opcional)
            <input value={draft.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://..." />
          </label>
          <label className="cw-field">Nombre
            <input value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </label>
          <label className="cw-field">Apellido
            <input value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </label>
          <label className="cw-field">Correo
            <input
              type="email"
              value={draft.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={!emailOk || undefined}
              aria-describedby={!emailOk ? 'cw-email-err' : undefined}
            />
            {!emailOk && <span className="cw-form-error" id="cw-email-err" role="alert">Ingresa un correo válido.</span>}
          </label>
          <label className="cw-field">Teléfono
            <input
              value={draft.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+56 9 1234 5678"
              aria-invalid={!phoneOk || undefined}
              aria-describedby={!phoneOk ? 'cw-phone-err' : undefined}
            />
            {!phoneOk && <span className="cw-form-error" id="cw-phone-err" role="alert">Teléfono no válido.</span>}
          </label>
          <fieldset className="cw-field cw-span-2">
            <legend>Cambiar contraseña</legend>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 8 caracteres)" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
            {passwordTouched && !passwordOk && (
              <span className="cw-form-error" role="alert">Mínimo 8 caracteres y ambas deben coincidir.</span>
            )}
            <span className="cw-field-hint">Por seguridad, en este demo la contraseña no se almacena.</span>
          </fieldset>
        </div>
      );
    }
    if (tab === 'ubicacion') {
      return (
        <div className="cw-profile-grid">
          <label className="cw-field">País
            <select value={draft.country} onChange={(e) => set('country', e.target.value)}>
              {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="cw-field">Región / estado
            <input value={draft.region} onChange={(e) => set('region', e.target.value)} />
          </label>
          <label className="cw-field" htmlFor="cw-city">Ciudad / comuna
            <input
              id="cw-city"
              list="cw-comunas"
              value={draft.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Escribe y elige tu comuna"
              aria-invalid={!cityOk || undefined}
              aria-describedby={!cityOk ? 'cw-city-err' : undefined}
            />
            <datalist id="cw-comunas">{COMUNAS.map((c) => <option key={c} value={c} />)}</datalist>
            {!cityOk && <span className="cw-form-error" id="cw-city-err" role="alert">Selecciona una comuna válida de la lista.</span>}
          </label>
          <label className="cw-field">Dirección
            <input value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle y número" />
          </label>
          <label className="cw-field">Código postal
            <input value={draft.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
          </label>
          <label className="cw-field">Idioma
            <select value={draft.language} onChange={(e) => set('language', e.target.value)}>
              {IDIOMAS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <label className="cw-field">Zona horaria
            <select value={draft.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {ZONAS_HORARIAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </label>
          <label className="cw-field">Moneda
            <select value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
      );
    }
    if (tab === 'notificaciones') {
      return (
        <div className="cw-profile-toggles">
          <label className="cw-check">
            <input type="checkbox" checked={draft.notifyEmail} onChange={(e) => set('notifyEmail', e.target.checked)} />
            Recibir correos de novedades
          </label>
          <label className="cw-check">
            <input type="checkbox" checked={draft.notifyPush} onChange={(e) => set('notifyPush', e.target.checked)} />
            Notificaciones push
          </label>
          <label className="cw-check">
            <input type="checkbox" checked={draft.priceAlerts} onChange={(e) => set('priceAlerts', e.target.checked)} />
            Avisarme cuando baje un precio de mi compra
          </label>
        </div>
      );
    }
    return (
      <div className="cw-profile-toggles">
        <label className="cw-check">
          <input type="checkbox" checked={draft.twoFactor} onChange={(e) => set('twoFactor', e.target.checked)} />
          Activar verificación en dos pasos (2FA)
        </label>
        <p className="cw-field-hint">En este demo la 2FA es ilustrativa: no se envía un código real.</p>
      </div>
    );
  };

  return (
    <div className="cw-stack">
      <Hero title="Tu perfil" subtitle="Tus datos personales, ubicación y preferencias." />
      <section className="cw-panel">
        <div className="cw-profile-top">
          <ProfileTabs tab={tab} onTabChange={setTab} />
          {editing ? (
            <div className="cw-profile-actions">
              <button type="button" className="cw-ghost-btn" onClick={cancel}>Cancelar</button>
              <button type="button" className="cw-primary-btn" onClick={save} disabled={!canSave}>Guardar cambios</button>
            </div>
          ) : (
            <button type="button" className="cw-primary-btn" onClick={startEdit}>
              <Settings size={16} aria-hidden="true" />
              Modificar datos
            </button>
          )}
        </div>
        <div className="cw-profile-tab-content">
          {editing ? renderEdit() : renderView()}
        </div>
      </section>
    </div>
  );
}
