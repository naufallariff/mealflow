// src/components/dashboard/WorkspaceBackupBar.tsx

import React, { useRef, useState } from 'react';
import { Check, Download, Upload } from 'lucide-react';

interface WorkspaceBackupBarProps {
    readonly onExportJson: () => string;
    readonly onImportJson: (
        rawJson: string,
    ) => { ok: true } | { ok: false; error: string };
}

export const WorkspaceBackupBar: React.FC<WorkspaceBackupBarProps> = ({
    onExportJson,
    onImportJson,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [statusMessage, setStatusMessage] = useState<{
        tone: 'ok' | 'error';
        text: string;
    } | null>(null);

    const handleDownloadBackup = () => {
        const json = onExportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `mealflow-profil-${dateStamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setStatusMessage({
            tone: 'ok',
            text: 'Cadangan JSON berhasil diunduh ke perangkat.',
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const content = await file.text();
            const result = onImportJson(content);
            if (result.ok) {
                setStatusMessage({
                    tone: 'ok',
                    text: 'Profil dan harga katalog berhasil dipulihkan.',
                });
            } else {
                setStatusMessage({ tone: 'error', text: result.error });
            }
        } catch {
            setStatusMessage({
                tone: 'error',
                text: 'Gagal membaca file JSON yang dipilih.',
            });
        } finally {
            e.target.value = '';
        }
    };

    return (
        <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-xs font-extrabold text-ink-primary">
                        Cadangkan & Pulihkan Data Lokal
                    </h3>
                    <p className="mt-0.5 text-[11px] text-ink-secondary">
                        Simpan daftar harga pasar kustom dan rencana bulanan ke file JSON
                        tanpa akun.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="mf-liquid-pill h-11 px-3.5 text-xs font-bold cursor-pointer"
                    >
                        <Download className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                        <span>Ekspor JSON</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mf-liquid-pill h-11 px-3.5 text-xs font-bold cursor-pointer"
                    >
                        <Upload className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                        <span>Impor JSON</span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="Pilih file cadangan Mealflow JSON"
                    />
                </div>
            </div>

            {statusMessage && (
                <p
                    role="status"
                    className={`mt-2.5 flex items-center gap-1.5 text-[11px] font-bold ${statusMessage.tone === 'ok'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                >
                    {statusMessage.tone === 'ok' && (
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>{statusMessage.text}</span>
                </p>
            )}
        </div>
    );
};