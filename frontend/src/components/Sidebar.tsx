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
  LayoutDashboard 
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
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Current Subscriptions', icon: Mail, href: '/subscriptions' },
    { label: 'Unsubscribed', icon: MailX, href: '/unsubscribed' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-white/80 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-30 transition-width duration-200 ease-in-out border-r border-border-sidebar shadow-soft",
        isCollapsed ? "w-[64px]" : "w-[250px]"
      )}
    >
      {/* External Collapse Toggle Button */}
      <button 
        onClick={toggleCollapse}
        suppressHydrationWarning={true}
        className={cn(
          "absolute -right-[16px] top-8 w-[32px] h-[32px] rounded-full bg-white shadow-card flex items-center justify-center text-text-primary hover:text-primary transition-all duration-150 z-40 border border-border active:scale-95",
          isCollapsed && "right-[-16px]"
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Top Section / Logo */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center flex-1")}> 
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Inbox size={16} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-[17px] font-semibold text-text-primary leading-tight tracking-tight">Unclutter</h1>
                <p className="text-[12px] text-text-muted truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-6">
        <div>
          {!isCollapsed && (
            <h2 className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-[0.4em] mb-2">Mailbox</h2>
          )}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center w-full h-10 px-[12px] rounded-lg transition-all duration-150 overflow-hidden",
                      isActive 
                        ? "bg-primary/15 border-l-2 border-primary text-primary font-semibold" 
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3") } />
                    {!isCollapsed && (
                      <span className="text-[14px] flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-[70px] top-1/2 -translate-y-1/2 px-3 py-2 bg-white text-text-primary text-[13px] rounded-[12px] shadow-dropdown opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
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
      <div className={cn("p-4 flex items-center gap-3", isCollapsed ? "justify-center px-0 relative group" : "")}> 
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
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
              className="p-2 text-primary bg-surface-hover border border-border rounded-full transition-colors duration-150 hover:bg-primary/10"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
        {isCollapsed && (
          <div className="absolute left-[70px] bottom-4 px-3 py-2 bg-white text-text-primary text-[13px] rounded-[12px] shadow-dropdown opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
            Logout
          </div>
        )}
      </div>
    </aside>
  );
}
