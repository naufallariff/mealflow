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
        svg: 'h-4.5 w-4.5',
        title: 'text-[15px]',
    },
    md: {
        box: 'h-9 w-9 rounded-xl',
        svg: 'h-5 w-5',
        title: 'text-base',
    },
    lg: {
        box: 'h-11 w-11 rounded-2xl',
        svg: 'h-6 w-6',
        title: 'text-lg',
    },
} as const;

export const MealflowBrandMark: React.FC<MealflowBrandMarkProps> = React.memo(
    ({ showWordmark = true, subtitle, size = 'md' }) => {
        const forkGradId = useId();
        const flowGradId = useId();
        const sunOrbGradId = useId();
        const dims = SIZE_MAP[size];

        return (
            <div className="inline-flex items-center gap-2.5 select-none">
                <div
                    className={`relative flex shrink-0 items-center justify-center overflow-hidden ${dims.box}`}
                    style={{
                        background:
                            'linear-gradient(135deg, #1D4ED8 0%, #2563EB 55%, #0EA5E9 100%)',
                        boxShadow:
                            '0 6px 16px -4px rgba(37, 99, 235, 0.38), inset 0 1px 0 0 rgba(255, 255, 255, 0.55)',
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
                                id={forkGradId}
                                x1="5"
                                y1="7"
                                x2="17"
                                y2="26"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#DBEAFE" />
                            </linearGradient>
                            <linearGradient
                                id={flowGradId}
                                x1="14"
                                y1="10"
                                x2="27"
                                y2="25"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#A7F3D0" />
                                <stop offset="55%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#E0F2FE" />
                            </linearGradient>
                            <linearGradient
                                id={sunOrbGradId}
                                x1="14"
                                y1="5"
                                x2="19"
                                y2="11"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#FDE047" />
                                <stop offset="100%" stopColor="#FB923C" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M6.5 9.2C6.5 8.26 7.26 7.5 8.2 7.5C9.14 7.5 9.9 8.26 9.9 9.2V13.4H11.3V9.2C11.3 8.26 12.06 7.5 13 7.5C13.94 7.5 14.7 8.26 14.7 9.2V14.2C14.7 15.85 13.72 17.28 12.24 17.92L16.2 22.8C16.85 23.6 16.28 24.8 15.25 24.8C14.84 24.8 14.46 24.61 14.21 24.29L9.9 18.85V23.2C9.9 24.14 9.14 24.9 8.2 24.9C7.26 24.9 6.5 24.14 6.5 23.2V9.2Z"
                            fill={`url(#${forkGradId})`}
                        />
                        <path
                            d="M15.6 20.6L19.8 14.5C20.55 13.4 22.18 13.45 22.86 14.6L23.4 15.5V11.2C23.4 9.15 24.65 7.6 25.95 7.6C26.8 7.6 27.5 8.3 27.5 9.15V23.2C27.5 24.14 26.74 24.9 25.8 24.9C24.86 24.9 24.1 24.14 24.1 23.2V18.3L21.3 22.4C20.62 23.4 19.15 23.42 18.44 22.45L15.6 20.6Z"
                            fill={`url(#${flowGradId})`}
                        />
                        <circle
                            cx="17.8"
                            cy="8.6"
                            r="2.15"
                            fill={`url(#${sunOrbGradId})`}
                        />
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