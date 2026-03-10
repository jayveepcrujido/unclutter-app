import { Subscription } from '../types';

interface Props {
  subscription: Subscription;
  isSelected: boolean;
  onToggle: () => void;
}

export default function SubscriptionCard({ subscription, isSelected, onToggle }: Props) {
  const isFailed = subscription.status === 'failed';
  const isUnsubscribed = subscription.status === 'unsubscribed';

  return (
    <div className={`p-4 border rounded-lg flex items-center gap-4 transition-colors ${
      isUnsubscribed ? 'opacity-50 bg-gray-50' : isFailed ? 'border-red-200 bg-red-50' : 'hover:bg-gray-50'
    }`}>
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={onToggle}
        disabled={isUnsubscribed}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-bold truncate ${isUnsubscribed ? 'line-through text-gray-500' : ''}`}>
            {subscription.sender_name || 'Unknown Sender'}
          </h3>
          {isFailed && (
            <span className="text-red-600" title="Unsubscribe failed">
              ⚠️
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{subscription.sender_email}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {subscription.email_count} emails
        </span>
        <span className="text-xs text-gray-400">
          Last: {new Date(subscription.last_email_received_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
