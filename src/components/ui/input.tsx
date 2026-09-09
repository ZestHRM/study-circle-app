import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, TextInput, View } from 'react-native';

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { className, containerClassName, label, error, ...props },
  ref
) {
  const inputElement = (
    <TextInput
      ref={ref}
      placeholderTextColor="#A8A29E"
      className={cn(
        'bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 flex h-12 w-full min-w-0 flex-row items-center rounded-2xl px-4 text-sm font-medium shadow-2xs',
        error && 'border-red-500 dark:border-red-500',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-stone-400 selection:bg-purple-500 selection:text-white outline-none transition-[color,box-shadow]',
            'focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px]',
            'aria-invalid:border-red-500'
          ),
          native: 'placeholder:text-stone-400',
        }),
        className
      )}
      {...props}
    />
  );

  if (!label && !error) {
    return inputElement;
  }

  return (
    <View className={cn('gap-1.5 w-full', containerClassName)}>
      {label ? <Text variant="subhead">{label}</Text> : null}
      {inputElement}
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
});

Input.displayName = 'Input';

export { Input };
