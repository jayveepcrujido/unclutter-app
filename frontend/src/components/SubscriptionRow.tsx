'use client';

import React from 'react';
import { 
  Zap, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle, 
  MoreHorizontal 
} from 'lucide-react';
import { Subscription } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  subscription: Subscription;
  isSelected: boolean;
  onToggle: () => void;
  isReadOnly?: boolean;
}

export default function SubscriptionRow({ subscription, isSelected, onToggle, isReadOnly }: Props) {
  const isFailed = subscription.status === 'failed';
  const isUnsubscribed = subscription.status === 'unsubscribed';
  
  const initial = (subscription.sender_name || subscription.sender_email)[0].toUpperCase();
  
  // Deterministic avatar color based on name
  const avatarColors = [
    'bg-indigo-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-sky-500'
  ];
  const colorIndex = (subscription.sender_name || subscription.sender_email).length % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  return (
    <div 
      className={cn(
        "group flex items-center px-6 py-5 transition-all duration-200 relative border-b border-[#E2E8F0]",
        !isReadOnly && isSelected ? "bg-surface-selected border-l-[3px] border-primary" : "bg-white hover:bg-background border-l-[3px] border-transparent hover:border-primary",
        isFailed && "bg-[#FFF8F8] border-l-[3px] border-[#FCA5A5]",
        isUnsubscribed && "opacity-[0.85]"
      )}
    >
      {/* Checkbox */}
      {!isReadOnly && (
        <div className="w-[40px] flex-shrink-0">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggle}
            disabled={isUnsubscribed}
            className="w-4 h-4 rounded-sm border-[#E2E8F0] text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
          />
        </div>
      )}

      {/* Sender */}
      <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0", avatarBg)}>
          {initial}
        </div>
        <div className="min-w-0">
          <h3 className={cn(
            "text-[14px] font-medium leading-tight truncate", 
            isUnsubscribed ? "text-text-secondary" : "text-text-primary"
          )}>
            {subscription.sender_name || 'Unknown Sender'}
          </h3>
          <p className="text-[12px] text-text-secondary truncate">{subscription.sender_email}</p>
        </div>
      </div>

      {/* Emails */}
      <div className="w-[100px] flex-shrink-0 px-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-badge bg-surface-hover text-text-primary text-[12px] font-medium">
          {subscription.email_count} emails
        </span>
      </div>

      {/* Last Received */}
      <div className="w-[120px] flex-shrink-0 px-2 text-[13px] text-text-secondary">
        {new Date(subscription.last_email_received_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </div>

      {/* Method */}
      <div className="w-[100px] flex-shrink-0 px-2">
        <span className={cn(
          "inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded-badge",
          subscription.unsubscribe_method === 'list-unsubscribe' 
            ? "bg-primary-light text-primary" 
            : "bg-surface-hover text-text-secondary"
        )}>
          {subscription.unsubscribe_method === 'list-unsubscribe' ? (
            <Zap size={12} className="shrink-0" />
          ) : (
            <LinkIcon size={12} className="shrink-0" />
          )}
          <span>{subscription.unsubscribe_method === 'list-unsubscribe' ? 'Auto' : 'Link'}</span>
        </span>
      </div>

      {/* Status */}
      <div className="w-[100px] flex-shrink-0 px-2 text-right">
        {isUnsubscribed ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-secondary px-2 py-0.5 rounded-badge bg-surface-hover">
            <CheckCircle size={14} className="shrink-0 text-success" />
            <span>Stopped</span>
          </span>
        ) : isFailed ? (
          <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-badge bg-danger-light text-danger font-medium">
            <AlertCircle size={12} className="shrink-0" />
            <span>Failed</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-badge bg-success-light text-success text-[12px] font-medium">
            Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="w-[48px] flex-shrink-0 flex justify-end">
        <button className="w-[28px] h-[28px] rounded-badge flex items-center justify-center text-text-muted hover:bg-[#F3F4F6] hover:text-[#374151] transition-all duration-150">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
