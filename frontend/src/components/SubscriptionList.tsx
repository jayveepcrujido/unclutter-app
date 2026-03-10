import { Subscription } from '../types';
import SubscriptionCard from './SubscriptionCard';

interface Props {
  subscriptions: Subscription[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
}

export default function SubscriptionList({ subscriptions, selectedIds, onToggleSelect, onSelectAll }: Props) {
  const activeCount = subscriptions.filter(s => s.status !== 'unsubscribed').length;
  const isAllSelected = selectedIds.length === activeCount && activeCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg sticky top-0 z-10 border-b">
        <input 
          type="checkbox" 
          checked={isAllSelected} 
          onChange={onSelectAll}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Select All {activeCount > 0 && `(${activeCount} available)`}</span>
      </div>
      
      <div className="space-y-3">
        {subscriptions.map((subscription) => (
          <SubscriptionCard 
            key={subscription.id} 
            subscription={subscription} 
            isSelected={selectedIds.includes(subscription.id)}
            onToggle={() => onToggleSelect(subscription.id)}
          />
        ))}
        {subscriptions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No subscriptions found.
          </div>
        )}
      </div>
    </div>
  );
}
