import type {ButtonHTMLAttributes, ReactNode} from 'react';

export function Button({
  children,
  className = 'cw-primary-btn',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {children: ReactNode}) {
  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  );
}
