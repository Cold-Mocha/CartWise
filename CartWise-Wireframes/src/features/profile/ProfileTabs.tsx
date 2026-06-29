/**
 * @deprecated Fuera del alcance del MVP actual de Cartwise.
 *
 * Este archivo se conserva como referencia para una etapa futura.
 * No debe importarse ni usarse en la navegación principal del MVP.
 * Forma parte de la pantalla de Perfil, inactiva en el MVP (ver ProfileView.tsx).
 *
 * Si una IA o desarrollador encuentra este archivo, no debe reactivarlo
 * sin actualizar primero el alcance del MVP y el README.md.
 */
import {PROFILE_TABS} from '../../domain/constants';
import type {ProfileTab} from '../../domain/types';

export function ProfileTabs({tab, onTabChange}: {tab: ProfileTab; onTabChange: (tab: ProfileTab) => void}) {
  return (
    <div className="cw-segmented cw-profile-tabs" role="group" aria-label="Secciones del perfil">
      {PROFILE_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={tab === t.id ? 'active' : ''}
          aria-pressed={tab === t.id}
          onClick={() => onTabChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
