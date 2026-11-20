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
                icon: <CalendarDays className="h-4.5 w-4.5" />,
                badge: scheduledCount > 0 ? scheduledCount : undefined,
            },
            {
                id: 'catalog',
                label: 'Katalog',
                icon: <LayoutGrid className="h-4.5 w-4.5" />,
            },
            {
                id: 'summary',
                label: 'Belanja',
                icon: <ShoppingBag className="h-4.5 w-4.5" />,
                badge: groceryItemCount > 0 ? groceryItemCount : undefined,
            },
        ];

    return (
        <nav aria-label="Navigasi utama mobile" className="mf-mobile-dock-wrap">
            <div className="mf-mobile-dock">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChangeTab(tab.id)}
                            aria-current={isActive ? 'page' : undefined}
                            data-active={isActive}
                            className="mf-dock-tab"
                        >
                            <div className="relative flex items-center justify-center">
                                {tab.icon}
                                {tab.badge !== undefined && (
                                    <span className="mf-dock-badge">
                                        {tab.badge > 99 ? '99+' : tab.badge}
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