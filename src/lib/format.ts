const numberFormat = new Intl.NumberFormat('en-GB')

/** 1082000 -> "1,082,000" */
export function formatNumber(value: number): string {
    return numberFormat.format(value)
}

/** 5.9509 -> "6.0%" (or "n/a" when the value could not be calculated) */
export function formatPercent(value: number | null, decimals = 1): string {
    if (value === null) return 'n/a'
    return `${value.toFixed(decimals)}%`
}

/** 9.68 -> "+9.7%", -9.04 -> "-9.0%". Use unit ' pts' for percentage points. */
export function formatChange(
    value: number | null,
    unit: '%' | ' pts' = '%',
): string {
    if (value === null) return 'n/a'
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}${unit}`
}