// src/components/brand/MealflowBrandMark.tsx
import React, { useId } from 'react';

export interface MealflowBrandMarkProps {
    showWordmark?: boolean;
    subtitle?: string;
    badgeText?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
    sm: {
        box: 'h-8 w-8 rounded-xl',
        svg: 'h-5 w-5',
        title: 'text-base',
        badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
        box: 'h-10 w-10 rounded-2xl',
        svg: 'h-6 w-6',
        title: 'text-lg',
        badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
        box: 'h-12 w-12 rounded-[18px]',
        svg: 'h-7 w-7',
        title: 'text-xl',
        badge: 'text-xs px-2 py-0.5',
    },
} as const;

export const MealflowBrandMark: React.FC<MealflowBrandMarkProps> = React.memo(
    ({
        showWordmark = true,
        subtitle,
        badgeText,
        size = 'md',
    }) => {
        const forkGradId = useId();
        const flowGradId = useId();
        const sunOrbGradId = useId();
        const dims = SIZE_MAP[size];

        return (
            <div className="inline-flex items-center gap-3 select-none group">
                {/* Apple Liquid Glass Squircle Emblem */}
                <div
                    className={`relative flex shrink-0 items-center justify-center overflow-hidden transition-transform duration-200 ease-out group-hover:scale-[1.03] group-active:scale-[0.96] ${dims.box}`}
                    style={{
                        background:
                            'linear-gradient(135deg, #1D4ED8 0%, #2563EB 48%, #10B981 100%)',
                        boxShadow:
                            '0 8px 20px -5px rgba(37, 99, 235, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 1px 0 rgba(15, 23, 42, 0.18)',
                    }}
                >
                    {/* Ambient Glass Sheen Overlay */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.38) 0%, transparent 58%)',
                        }}
                    />

                    <svg
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`relative z-10 ${dims.svg}`}
                        aria-hidden="true"
                    >
                        <defs>
                            {/* Gradasi Pilar Kiri (Garpu / Presisi) */}
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

                            {/* Gradasi Aliran Kanan (Sendok & Gelombang Flow) */}
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

                            {/* Gradasi Aksen Hangat (Sunrise Food Energy) */}
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

                        {/* Pilar Kiri "M": Siluet Garpu Ganda yang Mengalir ke Tengah */}
                        <path
                            d="M6.5 9.2C6.5 8.26 7.26 7.5 8.2 7.5C9.14 7.5 9.9 8.26 9.9 9.2V13.4H11.3V9.2C11.3 8.26 12.06 7.5 13 7.5C13.94 7.5 14.7 8.26 14.7 9.2V14.2C14.7 15.85 13.72 17.28 12.24 17.92L16.2 22.8C16.85 23.6 16.28 24.8 15.25 24.8C14.84 24.8 14.46 24.61 14.21 24.29L9.9 18.85V23.2C9.9 24.14 9.14 24.9 8.2 24.9C7.26 24.9 6.5 24.14 6.5 23.2V9.2Z"
                            fill={`url(#${forkGradId})`}
                        />

                        {/* Pilar Kanan "M": Aliran Gelombang Sendok & Kurva Flow */}
                        <path
                            d="M15.6 20.6L19.8 14.5C20.55 13.4 22.18 13.45 22.86 14.6L23.4 15.5V11.2C23.4 9.15 24.65 7.6 25.95 7.6C26.8 7.6 27.5 8.3 27.5 9.15V23.2C27.5 24.14 26.74 24.9 25.8 24.9C24.86 24.9 24.1 24.14 24.1 23.2V18.3L21.3 22.4C20.62 23.4 19.15 23.42 18.44 22.45L15.6 20.6Z"
                            fill={`url(#${flowGradId})`}
                        />

                        {/* Titik Energi Hangat (Simbol Hidangan Hangat & Meal Balance) */}
                        <circle
                            cx="17.8"
                            cy="8.6"
                            r="2.15"
                            fill={`url(#${sunOrbGradId})`}
                        />
                    </svg>
                </div>

                {/* Wordmark & Optional Badge / Subtitle */}
                {showWordmark && (
                    <div className="flex flex-col leading-none">
                        <div className="flex items-center gap-2">
                            <span
                                className={`font-extrabold tracking-tight text-ink-primary ${dims.title}`}
                            >
                                Meal
                                <span className="bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                                    flow
                                </span>
                            </span>

                            {badgeText && (
                                <span
                                    className={`rounded-full font-bold tracking-wide bg-brand-glass text-brand border border-blue-500/20 ${dims.badge}`}
                                >
                                    {badgeText}
                                </span>
                            )}
                        </div>

                        {subtitle && (
                            <span className="mt-1 text-[11px] font-medium tracking-wide text-ink-muted">
                                {subtitle}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

MealflowBrandMark.displayName = 'MealflowBrandMark';