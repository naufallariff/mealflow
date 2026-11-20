// src/components/ui/ConfirmDialog.tsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface ConfirmDialogConfig {
    readonly title: string;
    readonly description: string;
    readonly confirmLabel: string;
    readonly cancelLabel?: string;
    readonly tone?: 'primary' | 'danger';
    readonly onConfirm: () => void;
}

interface ConfirmDialogProps {
    readonly config: ConfirmDialogConfig | null;
    readonly onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    config,
    onClose,
}) => {
    useEffect(() => {
        if (!config) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [config, onClose]);

    if (!config || typeof document === 'undefined') return null;

    const isDanger = config.tone === 'danger';

    return createPortal(
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="mf-modal-scrim z-70 p-4"
        >
            <div className="mf-modal-glass max-w-sm rounded-3xl p-5">
                <div className="flex items-start justify-between gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isDanger
                                ? 'bg-red-500/12 text-red-600 dark:text-red-400'
                                : 'bg-brand-glass text-brand'
                            }`}
                    >
                        {isDanger ? (
                            <AlertTriangle className="h-5 w-5" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5" />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup konfirmasi"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h3
                    id="confirm-dialog-title"
                    className="mt-3.5 text-base font-extrabold tracking-tight text-ink-primary"
                >
                    {config.title}
                </h3>
                <p
                    id="confirm-dialog-desc"
                    className="mt-1.5 text-xs leading-relaxed text-ink-secondary"
                >
                    {config.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mf-liquid-pill h-10.5 w-full text-xs font-bold"
                    >
                        {config.cancelLabel ?? 'Batal'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            config.onConfirm();
                            onClose();
                        }}
                        data-variant={isDanger ? undefined : 'primary'}
                        className={`mf-liquid-pill h-10.5 w-full text-xs font-bold ${isDanger
                                ? 'border-transparent bg-red-600 text-white hover:bg-red-700'
                                : ''
                            }`}
                    >
                        {config.confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};