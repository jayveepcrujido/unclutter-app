import { 
  Subscription, 
  BulkUnsubscribeResponse, 
  ScanResponse 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getHeaders = () => {
  const token = localStorage.getItem('unclutter_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  async connectEmail() {
    const res = await fetch(`${API_BASE_URL}/auth/connect-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider: 'gmail', redirect_uri: `${window.location.origin}/auth/callback` }),
    });
    return res.json();
  },

  async handleCallback(code: string, state: string) {
    const res = await fetch(`${API_BASE_URL}/auth/callback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, state }),
    });
    if (!res.ok) throw new Error('Auth failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async getSubscriptions(status?: string, limit = 50, offset = 0): Promise<{ subscriptions: Subscription[], total: number }> {
    const url = new URL(`${API_BASE_URL}/subscriptions/`);
    if (status) url.searchParams.append('status', status);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async triggerScan(): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/scan`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async bulkUnsubscribe(subscriptionIds: number[]): Promise<BulkUnsubscribeResponse> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/unsubscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subscription_ids: subscriptionIds }),
    });
    return res.json();
  },
};
