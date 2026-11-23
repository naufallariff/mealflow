// src/utils/format.ts

const idrFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
    if (!Number.isFinite(amount)) return 'Rp 0';
    return idrFormatter.format(Math.round(amount));
}

export function formatCompactRupiah(amount: number): string {
    if (!Number.isFinite(amount)) return 'Rp 0';
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1_000_000) {
        return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.0', '')} jt`;
    }
    if (abs >= 1_000) {
        return `${sign}Rp ${Math.round(abs / 1_000)} rb`;
    }
    return `${sign}Rp ${Math.round(abs)}`;
}