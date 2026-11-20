// src/components/layout/MobileBottomNav.tsx

import React from 'react';
import { CalendarDays, LayoutGrid, ShoppingBag } from 'lucide-react';

export type MobileTab = 'calendar' | 'catalog' | 'summary';

interface MobileBottomNavProps {
    readonly activeTab: MobileTab;
    readonly onChangeTab: (tab: MobileTab) => void;
}

const TABS: readonly {
    readonly id: MobileTab;
    readonly label: string;
    readonly icon: React.ReactNode;
}[] = [
        {
            id: 'calendar',
            label: 'Kalender',
            icon: <CalendarDays className="h-4 w-4" />,
        },
        {
            id: 'catalog',
            label: 'Katalog',
            icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
            id: 'summary',
            label: 'Belanja',
            icon: <ShoppingBag className="h-4 w-4" />,
        },
    ];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    activeTab,
    onChangeTab,
}) => {
    return (
        <nav aria-label="Navigasi utama mobile" className="mf-mobile-dock-wrap">
            <div className="mf-mobile-dock">
                {TABS.map((tab) => {
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
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};