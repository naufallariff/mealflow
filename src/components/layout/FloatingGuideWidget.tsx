// src/components/layout/FloatingGuideWidget.tsx

import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import type { ActiveWorkspaceTab } from '../../services/storage-engine';
import { FeatureWalkthroughModal } from './FeatureWalkthroughModal';
import type { MobileTab } from './MobileBottomNav';

const WALKTHROUGH_SEEN_KEY = 'mealflow.walkthrough.seen.v1';

interface FloatingGuideWidgetProps {
    readonly onJumpToFeature?: (
        workspaceTab?: ActiveWorkspaceTab,
        mobileTab?: MobileTab,
    ) => void;
}

export const FloatingGuideWidget: React.FC<FloatingGuideWidgetProps> = ({
    onJumpToFeature,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            const hasSeen = window.localStorage.getItem(WALKTHROUGH_SEEN_KEY);
            if (!hasSeen) {
                setIsOpen(true);
            }
        } catch {
            // Abaikan jika localStorage tidak tersedia
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        try {
            window.localStorage.setItem(WALKTHROUGH_SEEN_KEY, '1');
        } catch {
            // Abaikan error penyimpanan
        }
    };

    return (
        <>
            <footer className="mf-fluid-container pt-2 pb-24 text-center xl:pb-8">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="mf-liquid-pill inline-flex min-h-11 items-center gap-2 px-4 text-xs font-bold text-ink-secondary cursor-pointer hover:text-ink-primary"
                >
                    <Compass className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                    <span>Tur Detail Fitur Mealflow</span>
                </button>
            </footer>

            <FeatureWalkthroughModal
                isOpen={isOpen}
                onClose={handleClose}
                onJumpToFeature={onJumpToFeature}
            />
        </>
    );
};