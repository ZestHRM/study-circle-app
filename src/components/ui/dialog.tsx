import { cn } from '@/lib/utils';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  type ViewProps,
} from 'react-native';

type DialogContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const isOpen = Boolean(open);
  console.log('[Dialog] rendering Modal with visible =', isOpen);

  if (!isOpen) {
    return null;
  }

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => handleOpenChange(false)}
      >
        {children}
      </Modal>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
  style,
  ...props
}: ViewProps) {
  const { onOpenChange } = React.useContext(DialogContext);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-end"
    >
      {/* Backdrop */}
      <Pressable
        onPress={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60"
      />

      {/* Modal Content Box */}
      <View
        className={cn(
          'bg-[#FAF8F5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 rounded-t-[32px] px-6 pb-8 pt-4 w-full shadow-2xl',
          className
        )}
        style={[{ maxHeight: '90%' }, style]}
        {...props}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onOpenChange(false)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="absolute right-5 top-5 z-20 w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-800 items-center justify-center"
        >
          <Feather name="x" size={18} color="#78716C" />
        </TouchableOpacity>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

export function DialogHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, children, ...props }: ViewProps) {
  const actionItems = React.Children.toArray(children).filter(Boolean);
  const shouldSplitEvenly = actionItems.length === 2;

  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    >
      {actionItems.map((child, index) => {
        if (!shouldSplitEvenly) {
          return child;
        }

        return (
          <View key={`dialog-footer-action-${index}`} className="flex-1">
            {child}
          </View>
        );
      })}
    </View>
  );
}

export function DialogTitle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        'text-stone-900 dark:text-stone-100 text-lg font-semibold leading-none',
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

export function DialogDescription({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        'text-stone-500 dark:text-stone-400 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

export const DialogTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DialogPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DialogOverlay = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DialogClose = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

