export function formatNumber(number) {
    if (typeof number !== 'number') {
        return number;
    }
    const parts = number.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts[1];
    return `${integerPart},${decimalPart}`;
}

export function formatCurrency(value, currency = '$', currencyPosition = 'before') {
    const formattedNumber = formatNumber(value);
    if (currencyPosition === 'before') {
        return `${currency}${formattedNumber}`;
    } else {
        return `${formattedNumber} ${currency}`;
    }
}
