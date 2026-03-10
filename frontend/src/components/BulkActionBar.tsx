interface Props {
  selectedCount: number;
  onUnsubscribe: () => void;
  isLoading: boolean;
}

export default function BulkActionBar({ selectedCount, onUnsubscribe, isLoading }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
      <div className="bg-white border rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
        <span className="font-medium text-gray-700">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onUnsubscribe}
          disabled={isLoading}
          className={`px-6 py-2 rounded-xl font-bold text-white transition-all ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Unsubscribe from all`
          )}
        </button>
      </div>
    </div>
  );
}
