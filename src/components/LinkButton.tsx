'use client';

import { buttonVariants } from '@/components/ui/button';

interface Props {
  label: string;
  href: string;
  target?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
}

export function LinkButton({ props }: { props: Props }) {
  return (
    <a
      href={props.href}
      target={props.target ?? '_self'}
      rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
      className={buttonVariants({ variant: props.variant ?? 'default' })}
    >
      {props.label}
    </a>
  );
}
