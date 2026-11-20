// src/utils/currency.ts

const idrFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

/**
 * Formats an integer amount into standard Indonesian Rupiah (e.g. "Rp 26.000").
 */
export function formatIdr(amount: number): string {
    const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
    return idrFormatter.format(safeAmount);
}

/**
 * Formats large IDR values into compact labels for tight mobile badges (e.g. "Rp 800rb", "Rp 1,2jt").
 */
export function formatCompactIdr(amount: number): string {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 1_000_000) {
        const millions = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',');
        return `${sign}Rp ${millions}jt`;
    }
    if (abs >= 1_000) {
        return `${sign}Rp ${Math.round(abs / 1_000)}rb`;
    }
    return `${sign}Rp ${Math.round(abs)}`;
}