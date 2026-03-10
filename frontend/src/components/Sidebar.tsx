'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Inbox, 
  Mail, 
  MailX, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../hooks/useAuth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const userEmail = user?.email || "Guest";
  const userName = user?.name || userEmail.split('@')[0];

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) onCollapseChange(newState);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Current Subscriptions', icon: Mail, href: '/dashboard' },
    { label: 'Pending Confirmations', icon: RefreshCw, href: '/pending' },
    { label: 'Unsubscribed', icon: MailX, href: '/unsubscribed' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-surface flex flex-col fixed left-0 top-0 z-30 transition-width duration-200 ease-in-out border-r border-[#E2E8F0]",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={toggleCollapse}
        suppressHydrationWarning={true}
        className="absolute -right-[14px] top-8 w-[28px] h-[28px] rounded-full bg-white shadow-soft flex items-center justify-center text-text-muted hover:border-[#6366F1] hover:text-[#6366F1] transition-all duration-150 z-40 border border-[#E2E8F0]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Section / Logo */}
      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
        <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary shrink-0">
          <Inbox size={16} />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold text-text-primary leading-tight">Unclutter</h1>
            <p className="text-[12px] text-text-muted truncate">{userEmail}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-6">
        <div>
          {!isCollapsed && (
            <h2 className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">Mailbox</h2>
          )}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center w-full h-[38px] px-[10px] rounded-[8px] transition-all duration-150 overflow-hidden",
                      isActive 
                        ? "bg-primary-light border-l-2 border-primary text-primary font-medium" 
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3")} />
                    {!isCollapsed && (
                      <span className="text-[14px] flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-[70px] top-1/2 -translate-y-1/2 px-3 py-2 bg-white text-text-primary text-[13px] rounded-[8px] shadow-dropdown opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#E2E8F0]">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className={cn("p-4 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
          {userName[0].toUpperCase()}
        </div>
        {!isCollapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary truncate">{userName}</p>
            </div>
            <button 
              onClick={handleLogout}
              suppressHydrationWarning={true}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-[#F3F4F6] transition-all duration-150 rounded-md"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
        {isCollapsed && (
          <div className="absolute left-[70px] bottom-4 px-3 py-2 bg-white text-text-primary text-[13px] rounded-[8px] shadow-dropdown opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#E2E8F0]">
            Logout
          </div>
        )}
      </div>
    </aside>
  );
}
