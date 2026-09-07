import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva(
  cn(
    'text-stone-900 dark:text-stone-100 text-base',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: 'text-stone-900 dark:text-stone-100',
        h1: 'text-stone-900 dark:text-stone-100 text-3xl font-extrabold tracking-tight',
        h2: 'text-stone-900 dark:text-stone-100 text-xl font-bold',
        h3: 'text-stone-900 dark:text-stone-100 text-base font-semibold',
        h4: 'text-stone-900 dark:text-stone-100 text-sm font-semibold',
        muted: 'text-stone-500 dark:text-stone-400 text-xs font-medium',
        subhead: 'text-stone-700 dark:text-stone-300 text-xs font-semibold',
        caption: 'text-stone-400 dark:text-stone-500 text-xs',
        primary: 'text-[#8B5CF6] font-bold',
        terracotta: 'text-[#D95B38] font-bold',
        success: 'text-[#047857] font-semibold',
        error: 'text-red-500 font-medium text-xs',
        p: 'text-stone-800 dark:text-stone-200 text-sm leading-6',
        large: 'text-lg font-semibold text-stone-900 dark:text-stone-100',
        small: 'text-xs font-medium text-stone-700 dark:text-stone-300',
        code: 'bg-stone-200 dark:bg-stone-800 rounded px-1.5 py-0.5 font-mono text-xs font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
