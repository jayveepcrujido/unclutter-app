'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    success: {
      icon: CheckCircle,
      color: 'text-success',
      title: 'Success'
    },
    error: {
      icon: AlertCircle,
      color: 'text-danger',
      title: 'Error'
    },
    info: {
      icon: Info,
      color: 'text-primary',
      title: 'Information'
    }
  };

  const { icon: Icon, color, title } = variants[type];

  return (
    <div className={cn(
      "flex items-center gap-4 min-w-[300px] p-[14px] px-[16px] bg-white rounded-panel shadow-toast animate-in fade-in slide-in-from-right-4 duration-300"
    )}>
      <Icon className={cn("w-[18px] h-[18px] shrink-0", color)} />
      <div className="flex-1">
        <p className="text-[14px] font-medium text-text-primary leading-tight">{title}</p>
        <p className="text-[13px] text-text-secondary mt-0.5">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }: { toasts: { id: number, message: string, type: ToastType }[], removeToast: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
