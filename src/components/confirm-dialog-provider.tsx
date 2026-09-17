import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import * as React from "react";

type ConfirmDialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmDialogContextValue = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

const ConfirmDialogContext =
  React.createContext<ConfirmDialogContextValue | null>(null);

const DEFAULT_OPTIONS: Required<Omit<ConfirmDialogOptions, "title">> = {
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
};

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmDialogOptions | null>(
    null,
  );
  const resolverRef = React.useRef<((confirmed: boolean) => void) | null>(null);
  const isConfirmedRef = React.useRef<boolean>(false);

  const handleActionClick = React.useCallback((confirmed: boolean) => {
    isConfirmedRef.current = confirmed;
  }, []);

  const handleOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      const resolver = resolverRef.current;
      const result = isConfirmedRef.current;
      resolverRef.current = null;
      isConfirmedRef.current = false;
      setOptions(null);
      resolver?.(result);
    }
  }, []);

  const confirm = React.useCallback((dialogOptions: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      isConfirmedRef.current = false;
      setOptions(dialogOptions);
      setOpen(true);
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title ?? "Are you sure?"}
            </AlertDialogTitle>
            {options?.description ? (
              <AlertDialogDescription>
                {options.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onPressIn={() => handleActionClick(false)}
              onPress={() => handleActionClick(false)}
            >
              <Text>{options?.cancelText ?? DEFAULT_OPTIONS.cancelText}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive active:bg-destructive/90"
              onPressIn={() => handleActionClick(true)}
              onPress={() => handleActionClick(true)}
            >
              <Text className="text-white" style={{ color: "#ffffff" }}>
                {options?.confirmText ?? DEFAULT_OPTIONS.confirmText}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = React.useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider",
    );
  }

  return context.confirm;
}
