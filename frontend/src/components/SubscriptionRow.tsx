'use client';

import React from 'react';
import { 
  Zap, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle, 
  MoreHorizontal,
  RefreshCw
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
  const isPending = subscription.status === 'pending_confirmation';
  const isManual = isFailed && (subscription.error_message?.includes('manual') || subscription.error_message?.includes('form'));
  const isUnsubscribed = subscription.status === 'unsubscribed';
  const isAutoMethod = ['list-unsubscribe', 'list-unsubscribe-post'].includes(subscription.unsubscribe_method || '');
  const methodLabel = subscription.unsubscribe_method === 'list-unsubscribe-post'
    ? 'One-Click'
    : isAutoMethod
      ? 'Auto'
      : 'Link';
  
  const initial = (subscription.sender_name || subscription.sender_email)[0].toUpperCase();
  
  // Deterministic avatar color based on name
  const avatarColors = [
    'bg-teal-500', 'bg-cyan-600', 'bg-amber-500', 'bg-emerald-500', 'bg-orange-500', 'bg-slate-500'
  ];
  const colorIndex = (subscription.sender_name || subscription.sender_email).length % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  const statusToneClasses = (() => {
    if (isFailed) {
      return "bg-danger-light border-l-[3px] border-danger/70";
    }
    if (isPending) {
      return "bg-primary/10 border-l-[3px] border-primary/60";
    }
    if (isUnsubscribed) {
      return "bg-surface-hover/80 border-l-[3px] border-border/60";
    }
    return "bg-white/90 hover:bg-background border-l-[3px] border-transparent hover:border-primary/50";
  })();

  const selectionClasses = !isReadOnly && isSelected
    ? "ring-2 ring-primary/25 ring-offset-0"
    : "";

  return (
    <div 
      className={cn(
        "group flex items-center px-6 py-5 transition-all duration-200 relative border-b border-border",
        statusToneClasses,
        selectionClasses,
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
            disabled={isUnsubscribed || isPending}
            suppressHydrationWarning={true}
            className="w-4 h-4 rounded-sm border-border text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
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
            isAutoMethod 
              ? "bg-primary/15 text-primary" 
              : "bg-surface-hover text-text-secondary"
          )}>
          {isAutoMethod ? (
            <Zap size={12} className="shrink-0" />
          ) : (
            <LinkIcon size={12} className="shrink-0" />
          )}
          <span>{methodLabel}</span>
        </span>
      </div>

      {/* Status */}
      <div className="w-[100px] flex-shrink-0 px-2 text-right">
        {isUnsubscribed ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-secondary px-2 py-0.5 rounded-badge bg-surface-hover">
            <CheckCircle size={14} className="shrink-0 text-success" />
            <span>Stopped</span>
          </span>
        ) : isPending ? (
          <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-badge bg-primary/15 text-primary font-bold" title="Waiting for confirmation email...">
            <RefreshCw size={12} className="shrink-0 animate-spin" />
            <span>Confirming</span>
          </span>
        ) : isManual ? (
          <a 
            href={subscription.unsubscribe_link || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-badge bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 transition-colors"
            title="Click to unsubscribe manually"
          >
            <AlertCircle size={12} className="shrink-0" />
            <span>Manual</span>
          </a>
        ) : isFailed ? (
          <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-badge bg-danger-light text-danger font-medium" title={subscription.error_message || 'Unsubscribe failed'}>
            <AlertCircle size={12} className="shrink-0" />
            <span>Failed</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-badge bg-primary/10 text-primary text-[12px] font-medium">
            Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="w-[48px] flex-shrink-0 flex justify-end">
        <button className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text-primary transition-all duration-150">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
