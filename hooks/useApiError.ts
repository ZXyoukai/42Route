import { useState, useCallback } from 'react';
import { ApiError, classifyError } from '../types/api';
import { extractApiError } from '../services/api';

/**
 * Hook for structured error handling across data-fetching hooks.
 *
 * Usage:
 *   const { apiError, handleError, clearError } = useApiError();
 *
 *   try { ... }
 *   catch (err) { handleError(err); }
 *
 *   if (apiError) return <TimeoutErrorScreen error={apiError} onRetry={...} />;
 */
export function useApiError() {
  const [apiError, setApiError] = useState<ApiError | null>(null);

  /** Classify a raw error and store it */
  const handleError = useCallback((err: any): ApiError => {
    const classified = extractApiError(err);
    setApiError(classified);
    return classified;
  }, []);

  /** Clear the current error (e.g. before retrying) */
  const clearError = useCallback(() => {
    setApiError(null);
  }, []);

  return { apiError, handleError, clearError };
}
