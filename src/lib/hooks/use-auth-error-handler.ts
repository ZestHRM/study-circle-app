import { getErrorMessage } from "@/services/api-client";
import * as React from "react";

export type RunActionResult<T> = { ok: true; data: T } | { ok: false };

export type RunActionOptions = {
  onError?: (message: string) => void;
};

/**
 * Shared error/message state + a `runAction` wrapper that removes the
 * repeated try/catch/getErrorMessage boilerplate found across auth screens
 * (forgot-password, reset-password, verify-email, change-password, etc).
 */
export function useAuthErrorHandler() {
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const runAction = React.useCallback(
    async <T>(
      action: () => Promise<T>,
      fallbackMessage: string,
      options?: RunActionOptions,
    ): Promise<RunActionResult<T>> => {
      setError(null);

      try {
        const data = await action();
        return { ok: true, data };
      } catch (caughtError) {
        const msg = getErrorMessage(caughtError, fallbackMessage);
        setError(msg);
        options?.onError?.(msg);
        return { ok: false };
      }
    },
    [],
  );

  return { error, setError, message, setMessage, runAction };
}
