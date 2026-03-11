interface Props {
  selectedCount: number;
  onUnsubscribe: () => void;
  isLoading: boolean;
}

export default function BulkActionBar({ selectedCount, onUnsubscribe, isLoading }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
      <div className="glass-panel flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4">
        <span className="text-[15px] font-semibold text-text-primary">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onUnsubscribe}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[14px] font-semibold text-white transition-all ${
            isLoading 
              ? 'bg-primary/60 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-hover active:scale-95 shadow-soft'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
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
