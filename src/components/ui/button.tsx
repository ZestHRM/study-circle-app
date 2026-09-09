import { APP_COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { Feather } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Spinner } from './spinner';
import {
  Pressable,
  Text as RNText,
  View,
} from 'react-native';

const buttonVariants = cva(
  'group shrink-0 flex-row items-center justify-center gap-2 rounded-xl border-0 active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-[#D95B38] active:bg-[#C04928] shadow-2xs',
        terracotta: 'bg-[#D95B38] active:bg-[#C04928] shadow-2xs',
        quiz: 'bg-[#2563EB] active:bg-[#1D4ED8] shadow-2xs',
        secondary:
          'bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700',
        outline:
          'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 active:bg-stone-50 dark:active:bg-stone-700/50 shadow-2xs',
        ghost:
          'bg-transparent active:bg-stone-100 dark:active:bg-stone-800 shadow-none',
        destructive: 'bg-red-600 active:bg-red-700 shadow-2xs',
        link: 'bg-transparent shadow-none underline',
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 px-3.5 py-1.5 rounded-lg',
        md: 'h-11 px-4 py-2.5',
        lg: 'h-13 px-6 py-3.5 rounded-2xl',
        icon: 'h-10 w-10 p-0 rounded-full items-center justify-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('text-xs font-bold tracking-wide', {
  variants: {
    variant: {
      default: 'text-white',
      terracotta: 'text-white',
      quiz: 'text-white',
      secondary: 'text-stone-800 dark:text-stone-200',
      outline: 'text-stone-700 dark:text-stone-300 font-bold',
      ghost: 'text-stone-600 dark:text-stone-400 font-semibold',
      destructive: 'text-white',
      link: 'text-[#D95B38] underline',
    },
    size: {
      default: 'text-xs',
      sm: 'text-[11px]',
      md: 'text-xs',
      lg: 'text-sm font-bold',
      icon: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    /** Explicit text label prop (alternative to children) */
    title?: string;
    /** Feather icon name */
    icon?: keyof typeof Feather.glyphMap;
    /** Icon position (left or right) */
    iconPosition?: 'left' | 'right';
    /** Icon size */
    iconSize?: number;
    /** Override icon color */
    iconColor?: string;
    /** Show ActivityIndicator loader spinner */
    loading?: boolean;
    /** Alias for loading */
    isLoading?: boolean;
    /** Optional text to display while loading */
    loadingText?: string;
    /** Extra Tailwind text classes */
    textClassName?: string;
  };

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant = 'default',
      size = 'default',
      title,
      icon,
      iconPosition = 'left',
      iconSize = 16,
      iconColor,
      loading = false,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const activeLoading = loading || isLoading;

    const resolvedIconColor = React.useMemo(() => {
      if (iconColor) return iconColor;
      if (
        variant === 'terracotta' ||
        variant === 'default' ||
        variant === 'quiz' ||
        variant === 'destructive'
      ) {
        return '#FFFFFF';
      }
      if (variant === 'outline' || variant === 'secondary') {
        return '#57534E';
      }
      return APP_COLORS.primary;
    }, [iconColor, variant]);

    const labelContent = activeLoading && loadingText ? loadingText : title || children;

    const renderIcon = () => (
      <Feather name={icon!} size={iconSize} color={resolvedIconColor} />
    );

    return (
      <Pressable
        ref={ref}
        disabled={disabled || activeLoading}
        className={cn(
          (disabled || activeLoading) && 'opacity-50',
          buttonVariants({ variant, size }),
          className
        )}
        role="button"
        {...props}
      >
        {(state) => (
          <>
            {activeLoading ? (
              <Spinner size="small" color={resolvedIconColor} />
            ) : icon && iconPosition === 'left' ? (
              renderIcon()
            ) : null}

            {typeof labelContent === 'string' || typeof labelContent === 'number' ? (
              <RNText
                className={cn(buttonTextVariants({ variant, size }), textClassName)}
              >
                {labelContent}
              </RNText>
            ) : typeof labelContent === 'function' ? (
              (labelContent as any)(state)
            ) : (
              labelContent
            )}

            {!activeLoading && icon && iconPosition === 'right' ? (
              renderIcon()
            ) : null}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
