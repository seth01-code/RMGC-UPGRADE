import { useState, useEffect } from "react";
import axios from "axios";

// Country-to-Currency mapping
const countryToCurrencyMap: Record<string, string> = {
  Nigeria: "NGN",
  "United States": "USD",
  Canada: "CAD",
  UK: "GBP",
  Germany: "EUR",
  France: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Netherlands: "EUR",
  Belgium: "EUR",
  Austria: "EUR",
  Finland: "EUR",
  Ireland: "EUR",
  Portugal: "EUR",
  Slovakia: "EUR",
  Slovenia: "EUR",
  Cyprus: "EUR",
  Estonia: "EUR",
  Latvia: "EUR",
  Lithuania: "EUR",
  Malta: "EUR",
  India: "INR",
  "South Africa": "ZAR",
  Kenya: "KES",
  Ghana: "GHS",
  Uganda: "UGX",
  Tanzania: "TZS",
  Rwanda: "RWF",
  Malawi: "MWK",
  Zambia: "ZMW",
  Egypt: "EGP",
  Senegal: "XOF",
  Cameroon: "XAF",
  "Côte d'Ivoire": "XOF",
  Ethiopia: "ETB",
  Seychelles: "SCR",
  Mauritius: "MUR",
  Morocco: "MAD",
  Tunisia: "TND",
  Algeria: "DZD",
  Botswana: "BWP",
  Namibia: "NAD",
  Lesotho: "LSL",
  Eswatini: "SZL",
  Mozambique: "MZN",
  Angola: "AOA",
  "Democratic Republic of Congo": "CDF",
  SierraLeone: "SLL",
  Liberia: "LRD",
  Gambia: "GMD",
  Guinea: "GNF",
  BurkinaFaso: "XOF",
  Niger: "XOF",
  Mali: "XOF",
  Togo: "XOF",
  Benin: "XOF",
  Gabon: "XAF",
  "Congo-Brazzaville": "XAF",
  Chad: "XAF",
  "Central African Republic": "XAF",
  "Equatorial Guinea": "XAF",
  "São Tomé and Príncipe": "STN",
};

const BASE_CURRENCY = "USD"; // Base currency for conversion

interface ExchangeRateHook {
  exchangeRate: number;
  currencySymbol: string;
  convertPrice: (price: number, originalCurrency?: string) => number;
  countryCurrency: string;
}

export const useExchangeRate = (country?: string): ExchangeRateHook => {
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  const formattedCountry = country?.trim() || "";
  const countryCurrency = countryToCurrencyMap[formattedCountry] || "USD";

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await axios.get<{ rates: Record<string, number> }>(
          `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`
        );

        if (res.data.rates[countryCurrency]) {
          const rate = res.data.rates[countryCurrency];
          setExchangeRate(rate);
          setCurrencySymbol(getCurrencySymbol(countryCurrency));
        } else {
          setExchangeRate(1);
          setCurrencySymbol("$");
        }
      } catch (err) {
        console.error("Error fetching exchange rate:", err);
        setExchangeRate(1);
        setCurrencySymbol("$");
      }
    };

    fetchExchangeRate();
  }, [countryCurrency]);

  const convertPrice = (price: number, originalCurrency = "USD") => {
    if (originalCurrency === countryCurrency) return price;
    return price * exchangeRate;
  };

  return { exchangeRate, currencySymbol, convertPrice, countryCurrency };
};

// Helper function to get currency symbol
const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    CAD: "C$",
    GBP: "£",
    EUR: "€",
    INR: "₹",
    NGN: "₦",
    ZAR: "R",
    KES: "KSh",
    GHS: "GH₵",
    UGX: "USh",
    TZS: "TSh",
    RWF: "FRw",
    MWK: "MK",
    ZMW: "ZK",
    EGP: "E£",
    XOF: "CFA",
    XAF: "FCFA",
    ETB: "Br",
    SCR: "SR",
    MUR: "Rs",
    MAD: "د.م.",
    TND: "د.ت",
    DZD: "دج",
    BWP: "P",
    NAD: "N$",
    LSL: "L",
    SZL: "E",
    MZN: "MT",
    AOA: "Kz",
    CDF: "FC",
    SLL: "Le",
    LRD: "L$",
    GMD: "D",
    GNF: "FG",
    STN: "Db",
  };

  return currencySymbols[currencyCode] || "$";
};
