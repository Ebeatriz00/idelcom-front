import { fetchCurrencyList } from "@/infrastructure";


export async function generateNextCurrencyCode(): Promise<string> {
  try {
    const page = 1;
    const pageSize = 100;
    const search = "";
    const currencies = await fetchCurrencyList(page, pageSize, search);

    if (!currencies || !currencies.items || currencies.items.length === 0) {
      return "01";
    }

    const existingCodes = currencies.items
      .map((c) => parseInt(c.code))
      .filter((n) => !isNaN(n));

    if (existingCodes.length === 0) return "01";

    const nextNumber = Math.max(...existingCodes) + 1;

    return nextNumber.toString().padStart(2, "0");
  } catch (error) {
    console.error("Error generando código automático:", error);
    return "01"; 
}}


