// src/components/brand/MealflowBrandMark.tsx

import React, { useId } from 'react';

export interface MealflowBrandMarkProps {
    readonly showWordmark?: boolean;
    readonly subtitle?: string;
    readonly size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
    sm: {
        box: 'h-8 w-8 rounded-xl',
        svg: 'h-5 w-5',
        title: 'text-[15px]',
    },
    md: {
        box: 'h-9 w-9 rounded-xl',
        svg: 'h-5.5 w-5.5',
        title: 'text-base',
    },
    lg: {
        box: 'h-11 w-11 rounded-2xl',
        svg: 'h-6.5 w-6.5',
        title: 'text-lg',
    },
} as const;

export const MealflowBrandMark: React.FC<MealflowBrandMarkProps> = React.memo(
    ({ showWordmark = true, subtitle, size = 'md' }) => {
        const baseGradId = useId();
        const waveGradId = useId();
        const dims = SIZE_MAP[size];

        return (
            <div className="inline-flex items-center gap-2.5 select-none">
                <div
                    className={`relative flex shrink-0 items-center justify-center overflow-hidden ${dims.box}`}
                    style={{
                        background:
                            'linear-gradient(145deg, #0f766e 0%, #0284c7 100%)',
                        boxShadow:
                            '0 6px 16px -4px rgba(2, 132, 199, 0.34), inset 0 1px 0 0 rgba(255, 255, 255, 0.45)',
                    }}
                >
                    <svg
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`relative z-10 ${dims.svg}`}
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id={baseGradId}
                                x1="6"
                                y1="7"
                                x2="26"
                                y2="25"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0f2fe" />
                            </linearGradient>
                            <linearGradient
                                id={waveGradId}
                                x1="7"
                                y1="22"
                                x2="25"
                                y2="22"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#6ee7b7" />
                                <stop offset="100%" stopColor="#fde68a" />
                            </linearGradient>
                        </defs>

                        {/* Monogram "M" Geometris Bersih dengan Sudut Bulat Konsisten */}
                        <path
                            d="M7.5 22.5V9.5L16 16.2L24.5 9.5V22.5"
                            stroke={`url(#${baseGradId})`}
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Garis Aliran / Ledger Flow di Bawah Monogram */}
                        <path
                            d="M7.5 26.2C10.5 24.4 13.5 24.4 16 26.2C18.5 28 21.5 28 24.5 26.2"
                            stroke={`url(#${waveGradId})`}
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />

                        {/* Titik Poros Takaran / Porsi di Puncak Tengah */}
                        <circle cx="16" cy="8.5" r="2.2" fill="#fde68a" />
                    </svg>
                </div>

                {showWordmark && (
                    <div className="flex flex-col leading-none">
                        <span
                            className={`font-extrabold tracking-tight text-ink-primary ${dims.title}`}
                        >
                            Meal<span className="text-brand">flow</span>
                        </span>
                        {subtitle && (
                            <span className="mt-1 text-[11px] font-medium text-ink-muted">
                                {subtitle}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    },
);

MealflowBrandMark.displayName = 'MealflowBrandMark';