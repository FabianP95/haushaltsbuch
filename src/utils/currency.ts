/**
 * Formats a number as euro currency in German notation, e.g. 12.5 -> "12,50 €".
 * @param val - Amount to format
 * @returns The formatted currency string
 */
export const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    };


/**
 * Formats a number as euro currency without decimals, e.g. 1234.56 -> "1.235 €" (compact chart axis labels).
 * @param val - Amount to format
 * @returns The rounded currency string
 */
export const formatCurrencyShort = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
};
