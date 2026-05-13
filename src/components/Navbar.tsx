import React from 'react';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'upload', icon: PlusCircle, label: '', primary: true },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-white/10 flex items-center justify-around px-4 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-200",
              activeTab === tab.id ? "text-white" : "text-white/50",
              tab.primary && "scale-110"
            )}
          >
            {tab.primary ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-brand rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative bg-white text-black p-1 rounded-lg">
                  <Icon size={28} />
                </div>
              </div>
            ) : (
              <>
                <Icon size={24} />
                {tab.label && <span className="text-[10px] mt-1 font-medium">{tab.label}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
