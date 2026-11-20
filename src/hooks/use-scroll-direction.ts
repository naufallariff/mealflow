// src/hooks/use-scroll-direction.ts

import { useEffect, useRef, useState } from 'react';

export type ScrollDirection = 'up' | 'down';

/**
 * Tracks vertical scroll direction using requestAnimationFrame
 * so the floating header hides smoothly on scroll-down and reveals on scroll-up.
 */
export function useScrollDirection(thresholdPx = 12, topRevealOffsetPx = 72): ScrollDirection {
    const [direction, setDirection] = useState<ScrollDirection>('up');
    const lastScrollY = useRef<number>(0);
    const isTicking = useRef<boolean>(false);

    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const updateDirection = () => {
            const currentY = window.scrollY;

            if (currentY <= topRevealOffsetPx) {
                setDirection('up');
                lastScrollY.current = currentY;
                isTicking.current = false;
                return;
            }

            const delta = currentY - lastScrollY.current;
            if (Math.abs(delta) >= thresholdPx) {
                setDirection(delta > 0 ? 'down' : 'up');
                lastScrollY.current = currentY;
            }

            isTicking.current = false;
        };

        const handleScroll = () => {
            if (!isTicking.current) {
                window.requestAnimationFrame(updateDirection);
                isTicking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [thresholdPx, topRevealOffsetPx]);

    return direction;
}