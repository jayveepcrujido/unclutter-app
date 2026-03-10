import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Subscription } from '../types';

export function useSubscriptions(status?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSubscriptions(status);
      setSubscriptions(data.subscriptions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, loading, error, refetch: fetchSubscriptions };
}
