import { pipe, flow } from 'fp-ts/lib/function'

interface Bill {
    beforeTax: number
    afterTax: number
}
function addTip(total: number): Bill {
    return { beforeTax: total, afterTax: total + Math.round(total * 0.15) }
}

function sumLineItems(items: number[]): number {
    return items.reduce((prev, current) => prev + current, 0)
}

/**
 * Directly calculate the bill total
 *
 * @param items line items on your bill
 */
export function calculateBillTotal(items: number[]): Bill {
    return pipe(items, sumLineItems, addTip)
}

type BillCalculator = (items: number[]) => Bill

/**
 * Create a calculator that can later be used
 * to calculate the bill
 */
export function billCalulator(): BillCalculator {
    return flow(sumLineItems, addTip)
}
