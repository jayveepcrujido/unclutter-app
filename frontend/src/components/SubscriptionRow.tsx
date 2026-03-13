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
  const manualHint = (subscription.error_message || '').toLowerCase();
  const derivedManual = isFailed && (manualHint.includes('manual') || manualHint.includes('form'));
  const isManual = subscription.status === 'manual_required' || derivedManual;
  const isUnsubscribed = subscription.status === 'unsubscribed';
  const unsubscribeMethod = subscription.unsubscribe_method || '';
  const isAutoMethod = ['list-unsubscribe', 'list-unsubscribe-post'].includes(unsubscribeMethod);
  const methodLabel = unsubscribeMethod === 'list-unsubscribe-post'
    ? 'One-Click'
    : unsubscribeMethod === 'list-unsubscribe'
      ? 'Auto'
      : unsubscribeMethod === 'mailto'
        ? 'Mailto'
        : 'Link';
  const isManualLink = unsubscribeMethod === 'link' && Boolean(subscription.unsubscribe_link);
  
  const initial = (subscription.sender_name || subscription.sender_email)[0].toUpperCase();
  
  // Deterministic avatar color based on name
  const avatarColors = [
    'bg-teal-500', 'bg-cyan-600', 'bg-amber-500', 'bg-emerald-500', 'bg-orange-500', 'bg-slate-500'
  ];
  const colorIndex = (subscription.sender_name || subscription.sender_email).length % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  const statusToneClasses = (() => {
    if (isManual) {
      return "bg-amber-50 border-l-[3px] border-amber-300";
    }
    if (isFailed) {
      return "bg-danger-light border-l-[3px] border-danger/70";
    }
    if (isUnsubscribed) {
      return "bg-surface-hover/80 border-l-[3px] border-border/60";
    }
    return "bg-white/90 hover:bg-background border-l-[3px] border-transparent hover:border-primary/50";
  })();

  const selectionClasses = !isReadOnly && isSelected
    ? "ring-2 ring-primary/25 ring-offset-0"
    : "";

  const formattedDate = subscription.last_email_received_at
    ? new Date(subscription.last_email_received_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '—';

  const emailCount = subscription.email_count ?? 0;

  const renderEmailCount = (extra?: string) => (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-badge bg-surface-hover text-text-primary text-[12px] font-medium",
      extra
    )}>
      {emailCount} emails
    </span>
  );

  const renderMethodBadge = (extra?: string) => {
    if (isAutoMethod) {
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-badge bg-primary/15 px-1.5 py-0.5 text-[12px] font-semibold text-primary", extra)}>
          <Zap size={12} className="shrink-0" />
          <span>{methodLabel}</span>
        </span>
      );
    }

    if (isManualLink) {
      return (
        <a
          href={subscription.unsubscribe_link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("inline-flex items-center gap-1 rounded-badge bg-surface-hover px-1.5 py-0.5 text-[12px] font-semibold text-primary underline decoration-dotted", extra)}
          title="Open unsubscribe link"
        >
          <LinkIcon size={12} className="shrink-0" />
          <span>{methodLabel}</span>
        </a>
      );
    }

    return (
      <span className={cn("inline-flex items-center gap-1 rounded-badge bg-surface-hover px-1.5 py-0.5 text-[12px] font-semibold text-text-secondary", extra)}>
        <LinkIcon size={12} className="shrink-0" />
        <span>{methodLabel}</span>
      </span>
    );
  };

  const renderStatusBadge = (extra?: string) => {
    if (isUnsubscribed) {
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-badge bg-surface-hover px-2 py-0.5 text-[12px] text-text-secondary", extra)}>
          <CheckCircle size={14} className="shrink-0 text-success" />
          <span>Stopped</span>
        </span>
      );
    }

    if (isManual) {
      if (subscription.unsubscribe_link) {
        return (
          <a
            href={subscription.unsubscribe_link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-1 rounded-badge bg-amber-100 px-2 py-0.5 text-[12px] font-bold text-amber-700 transition-colors hover:bg-amber-200", extra)}
            title={subscription.error_message || 'Complete this unsubscribe manually'}
          >
            <AlertCircle size={12} className="shrink-0" />
            <span>Manual</span>
          </a>
        );
      }
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-badge bg-amber-100 px-2 py-0.5 text-[12px] font-bold text-amber-700", extra)} title={subscription.error_message || 'Manual completion required'}>
          <AlertCircle size={12} className="shrink-0" />
          <span>Manual</span>
        </span>
      );
    }

    if (isFailed) {
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-badge bg-danger-light px-2 py-0.5 text-[12px] font-medium text-danger", extra)} title={subscription.error_message || 'Unsubscribe failed'}>
          <AlertCircle size={12} className="shrink-0" />
          <span>Failed</span>
        </span>
      );
    }

    return (
      <span className={cn("inline-flex items-center rounded-badge bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary", extra)}>
        Active
      </span>
    );
  };

  const actionButton = (
    <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-text-muted transition-all duration-150 hover:bg-surface-hover hover:text-text-primary">
      <MoreHorizontal size={16} />
    </button>
  );

  return (
    <div 
      className={cn(
        "group relative flex flex-col gap-3 border-b border-border px-4 py-4 text-sm transition-all duration-200 md:flex-row md:items-center md:gap-0 md:px-6 md:py-5",
        statusToneClasses,
        selectionClasses,
        isUnsubscribed && "opacity-[0.85]"
      )}
    >
      {!isReadOnly && (
        <div className="flex items-center md:w-[40px] md:flex-shrink-0 md:justify-center">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggle}
            disabled={isUnsubscribed || isManual}
            suppressHydrationWarning={true}
            className="h-4 w-4 rounded-sm border-border text-primary transition-all focus:ring-primary focus:ring-offset-0"
          />
        </div>
      )}
      {isReadOnly && <div className="hidden md:block md:w-[40px] md:flex-shrink-0" />}

      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-10 md:pr-4">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white", avatarBg)}>
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

        <div className="hidden w-[100px] flex-shrink-0 px-2 md:block">
          {renderEmailCount()}
        </div>
        <div className="hidden w-[120px] flex-shrink-0 px-2 text-[13px] text-text-secondary md:block">
          {formattedDate}
        </div>
        <div className="hidden w-[100px] flex-shrink-0 px-2 md:block">
          {renderMethodBadge()}
        </div>
        <div className="hidden w-[100px] flex-shrink-0 px-2 text-right md:block">
          {renderStatusBadge()}
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
          {renderEmailCount()}
          <span className="rounded-badge bg-surface-hover px-2 py-0.5 text-text-secondary">Last {formattedDate}</span>
          {renderMethodBadge()}
          {renderStatusBadge()}
        </div>
      </div>

      <div className="absolute right-4 top-4 md:hidden">
        {actionButton}
      </div>
      <div className="hidden w-[48px] flex-shrink-0 justify-end md:flex">
        {actionButton}
      </div>
    </div>
  );
}
