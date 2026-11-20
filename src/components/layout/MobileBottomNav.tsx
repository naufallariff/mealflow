// src/components/layout/MobileBottomNav.tsx

import React from 'react';
import { CalendarDays, LayoutGrid, ShoppingBag } from 'lucide-react';

export type MobileTab = 'calendar' | 'catalog' | 'summary';

interface MobileBottomNavProps {
    readonly activeTab: MobileTab;
    readonly onChangeTab: (tab: MobileTab) => void;
    readonly scheduledCount: number;
    readonly groceryItemCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    activeTab,
    onChangeTab,
    scheduledCount,
    groceryItemCount,
}) => {
    const tabs: readonly {
        readonly id: MobileTab;
        readonly label: string;
        readonly icon: React.ReactNode;
        readonly badge?: number;
    }[] = [
            {
                id: 'calendar',
                label: 'Kalender',
                icon: <CalendarDays className="h-5 w-5" />,
                badge: scheduledCount > 0 ? scheduledCount : undefined,
            },
            {
                id: 'catalog',
                label: 'Katalog',
                icon: <LayoutGrid className="h-5 w-5" />,
            },
            {
                id: 'summary',
                label: 'Belanja',
                icon: <ShoppingBag className="h-5 w-5" />,
                badge: groceryItemCount > 0 ? groceryItemCount : undefined,
            },
        ];

    return (
        <nav
            aria-label="Navigasi utama mobile"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E5EA] bg-white/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        >
            <div className="grid grid-cols-3 gap-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChangeTab(tab.id)}
                            className={`relative flex min-h-11.5lex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors active:scale-[0.97] ${isActive
                                    ? 'bg-[#007AFF]/10 text-[#007AFF]'
                                    : 'text-[#636366] hover:bg-[#F2F2F7]'
                                }`}
                        >
                            <div className="relative">
                                {tab.icon}
                                {tab.badge !== undefined && (
                                    <span className="tabular-nums absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#007AFF] px-1 text-[10px] font-bold text-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};