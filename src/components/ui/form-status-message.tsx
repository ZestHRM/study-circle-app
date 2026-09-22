import { Text } from "@/components/ui/text";
import * as React from "react";

export type FormStatusMessageProps = {
  error?: string | null;
  message?: string | null;
};

/**
 * Renders the shared "generalError" / success "message" text block that was
 * duplicated across auth screens (forgot-password, reset-password,
 * verify-email, change-password, etc).
 */
export function FormStatusMessage({ error, message }: FormStatusMessageProps) {
  if (!error && !message) return null;

  return (
    <>
      {error ? (
        <Text variant="error" className="text-sm">
          {error}
        </Text>
      ) : null}

      {message ? (
        <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          {message}
        </Text>
      ) : null}
    </>
  );
}
