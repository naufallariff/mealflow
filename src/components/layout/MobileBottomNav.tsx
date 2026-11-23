// src/components/layout/MobileBottomNav.tsx

import React from 'react';
import {
    BookOpen,
    CalendarDays,
    CheckSquare,
    TableProperties,
} from 'lucide-react';

export type MobileTab = 'planner' | 'dashboard' | 'catalog' | 'calendar';

interface MobileBottomNavProps {
    readonly activeTab: MobileTab;
    readonly onSelectTab: (tab: MobileTab) => void;
    readonly plannedItemsCount?: number;
    readonly pendingShoppingCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    activeTab,
    onSelectTab,
    plannedItemsCount = 0,
    pendingShoppingCount = 0,
}) => {
    const navItems: ReadonlyArray<{
        readonly id: MobileTab;
        readonly label: string;
        readonly icon: React.ReactNode;
        readonly badge?: number;
    }> = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: <CheckSquare className="h-4 w-4" aria-hidden="true" />,
                badge: pendingShoppingCount > 0 ? pendingShoppingCount : undefined,
            },
            {
                id: 'planner',
                label: 'Rencana',
                icon: <TableProperties className="h-4 w-4" aria-hidden="true" />,
                badge: plannedItemsCount > 0 ? plannedItemsCount : undefined,
            },
            {
                id: 'calendar',
                label: 'Kalender',
                icon: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
            },
            {
                id: 'catalog',
                label: 'Katalog',
                icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
            },
        ];

    return (
        <nav
            aria-label="Navigasi utama mobile"
            className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 xl:hidden"
        >
            <div className="grid w-full max-w-md grid-cols-4 gap-1 rounded-full border border-(--border-subtle) bg-(--glass-card) p-1.5 shadow-lg backdrop-blur-xl">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectTab(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] font-bold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${isActive
                                ? 'bg-brand text-white shadow-xs'
                                : 'text-ink-secondary hover:text-ink-primary'
                                }`}
                        >
                            <span className="relative">
                                {item.icon}
                                {item.badge !== undefined && !isActive && (
                                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 tabular-nums text-[9px] font-extrabold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </span>
                            <span className="truncate">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};