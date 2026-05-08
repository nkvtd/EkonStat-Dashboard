export type Currency = "MKD" | "EUR";

export const DEFAULT_CURRENCY: Currency = "MKD";
export const MKD_TO_EUR_RATE = 61.5;

export const convertFromMkd = (
    amount: number | null | undefined,
    currency: Currency = DEFAULT_CURRENCY,
): number => {
    const value = Number(amount ?? 0);

    if (currency === "EUR") {
        return value / MKD_TO_EUR_RATE;
    }

    return value;
};

export const convertToMkd = (
    amount: number | null | undefined,
    currency: Currency = DEFAULT_CURRENCY,
): number => {
    const value = Number(amount ?? 0);

    if (currency === "EUR") {
        return value * MKD_TO_EUR_RATE;
    }

    return value;
};

export const formatCurrency = (
    amount: number | null | undefined,
    currency: Currency = DEFAULT_CURRENCY,
): string => {
    const converted = convertFromMkd(amount, currency);

    return `${converted.toLocaleString(undefined, {
        minimumFractionDigits: currency === "EUR" ? 2 : 0,
        maximumFractionDigits: currency === "EUR" ? 2 : 0,
    })} ${currency}`;
};

export const formatSignedCurrencyDifference = (
    amount: number | null | undefined,
    currency: Currency = DEFAULT_CURRENCY,
): string => {
    const converted = convertFromMkd(amount, currency);

    if (converted > 0) {
        return `+${converted.toLocaleString(undefined, {
            minimumFractionDigits: currency === "EUR" ? 2 : 0,
            maximumFractionDigits: currency === "EUR" ? 2 : 0,
        })} ${currency}`;
    }

    if (converted < 0) {
        return `-${Math.abs(converted).toLocaleString(undefined, {
            minimumFractionDigits: currency === "EUR" ? 2 : 0,
            maximumFractionDigits: currency === "EUR" ? 2 : 0,
        })} ${currency}`;
    }

    return `0 ${currency}`;
};

export const isCurrency = (value: string): value is Currency => {
    return value === "MKD" || value === "EUR";
};
