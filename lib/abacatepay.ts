import AbacatePay from "abacatepay-nodejs-sdk";

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;

if (!ABACATEPAY_API_KEY) {
  throw new Error("ABACATEPAY_API_KEY environment variable is not set");
}

export const abacatepay = AbacatePay(ABACATEPAY_API_KEY);
