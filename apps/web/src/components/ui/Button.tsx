import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'danger' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'btn btn-primary',
  danger: 'btn btn-danger',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button type="button" className={`${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
