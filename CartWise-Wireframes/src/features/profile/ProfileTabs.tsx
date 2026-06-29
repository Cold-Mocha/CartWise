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
