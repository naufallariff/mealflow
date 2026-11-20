// src/components/ui/CustomSelect.tsx

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CustomSelectOption<T extends string> {
    readonly value: T;
    readonly label: string;
    readonly dotColor?: string;
}

interface CustomSelectProps<T extends string> {
    readonly id?: string;
    readonly value: T;
    readonly options: readonly CustomSelectOption<T>[];
    readonly onChange: (value: T) => void;
    readonly ariaLabel?: string;
}

export function CustomSelect<T extends string>({
    id,
    value,
    options,
    onChange,
    ariaLabel,
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption =
        options.find((opt) => opt.value === value) ?? options[0];

    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex h-11 w-full items-center justify-between gap-2 rounded-2xl border px-3.5 text-left text-sm font-semibold transition-colors outline-none ${isOpen
                        ? 'border-brand bg-(--glass-card) ring-2 ring-brand/20'
                        : 'border-(--border-subtle) bg-(--glass-card-subtle) hover:border-(--border-strong)'
                    } text-ink-primary`}
            >
                <span className="flex min-w-0 items-center gap-2">
                    {selectedOption?.dotColor && (
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${selectedOption.dotColor}`}
                        />
                    )}
                    <span className="truncate">{selectedOption?.label}</span>
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-secondary transition-transform duration-150 ${isOpen ? 'rotate-180 text-brand' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute inset-x-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-(--border-strong) bg-(--glass-card) p-1.5 shadow-2xl"
                >
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${isSelected
                                            ? 'bg-brand-glass text-brand'
                                            : 'text-ink-primary hover:bg-(--glass-card-subtle)'
                                        }`}
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        {opt.dotColor && (
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${opt.dotColor}`}
                                            />
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                    </span>
                                    {isSelected && (
                                        <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}