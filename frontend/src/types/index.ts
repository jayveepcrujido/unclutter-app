export interface User {
  id: number;
  email: string;
}

export interface Subscription {
  id: number;
  sender_email: string;
  sender_name: string | null;
  status: 'active' | 'unsubscribed' | 'failed' | 'manual_required';
  email_count: number;
  last_email_received_at: string;
  unsubscribe_method: 'link' | 'mailto' | 'list-unsubscribe' | 'list-unsubscribe-post' | null;
  unsubscribe_link?: string;
  error_message?: string | null;
}

export interface UnsubscribeResult {
  subscription_id: number;
  status: 'unsubscribed' | 'failed' | 'manual_required';
  error_message: string | null;
}

export interface BulkUnsubscribeResponse {
  success_count: number;
  failed_count: number;
  manual_count: number;
  results: UnsubscribeResult[];
}

export interface ScanResponse {
  new_subscriptions_found: number;
  scan_completed_at: string;
  total_scanned: number;
}
