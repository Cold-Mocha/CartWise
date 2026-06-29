import type {ReactNode} from 'react';

export function Badge({children, className = '', title}: {children: ReactNode; className?: string; title?: string}) {
  return <span className={`cw-badge${className ? ` ${className}` : ''}`} title={title}>{children}</span>;
}
