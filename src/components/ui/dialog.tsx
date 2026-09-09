import { AppBottomSheet } from "@/components/ui/app-bottom-sheet";
import { cn } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  type ViewProps,
} from "react-native";

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

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <DialogContext.Provider
      value={{ open: isOpen, onOpenChange: handleOpenChange }}
    >
      <AppBottomSheet
        open={isOpen}
        onOpenChange={handleOpenChange}
        snapPoints={["90%"]}
        initialIndex={0}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        backdropPressBehavior="close"
      >
        {children}
      </AppBottomSheet>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
  style,
  ...props
}: ViewProps) {
  return (
    <View
      className={cn("flex-1 justify-start gap-3", className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

export function DialogHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, children, ...props }: ViewProps) {
  const actionItems = React.Children.toArray(children).filter(Boolean);
  const shouldSplitEvenly = actionItems.length === 2;

  return (
    <View
      className={cn("flex flex-row items-center gap-2", className)}
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
        "text-stone-900 dark:text-stone-100 text-lg font-semibold leading-none",
        className,
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
      className={cn("text-stone-500 dark:text-stone-400 text-sm", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export const DialogTrigger = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
export const DialogPortal = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
export const DialogOverlay = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
export const DialogClose = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
