import BN = require("bn.js");
import Decimal from "decimal.js";

export function toRawAmount(
    amount: number | string,
    decimals: number,
) {
    const amountD = new Decimal(amount);
    const amountLamports = amountD.mul(new Decimal(10 ** decimals));
    return new BN(amountLamports.toString());
}

export function toUiAmount(
    amount: BN,
    decimals: number,
) {
    const amountD = new Decimal(amount.toString());
    const uiAmount = amountD.div(new Decimal(10 ** decimals));
    return uiAmount.toString();
}
