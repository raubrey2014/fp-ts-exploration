import { calculateBillTotal, billCalulator } from './pipe-and-flow'

console.log(calculateBillTotal([10, 5, 5]))

const calculator = billCalulator()

console.log(calculator([10, 1, 1, 3]))
