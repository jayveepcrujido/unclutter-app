import { useState } from 'react';
import { api } from '../lib/api';

export function useScan(onComplete?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerScan = async () => {
    setLoading(true);
    try {
      await api.triggerScan();
      setError(null);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return { scan: triggerScan, loading, error };
}
