import axios from 'axios';

// Finnhub API Configuration
const BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string;   // Status
  t: number[]; // Timestamps
  v: number[]; // Volume
}

/**
 * Fetches real-time quote data for a single stock symbol
 */
export const fetchStockQuote = async (symbol: string): Promise<FinnhubQuote> => {
  try {
    const response = await axios.get<FinnhubQuote>(`${BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: API_KEY,
      },
    });

    if (response.data.c === 0 && response.data.t === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch stock quote');
    }
    throw error;
  }
};

/**
 * Fetches historical candle data or returns simulated data if API is restricted
 */
export const fetchStockCandles = async (
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  currentPrice?: number
): Promise<FinnhubCandle> => {
  try {
    const response = await axios.get<FinnhubCandle>(`${BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol.toUpperCase(),
        resolution,
        from,
        to,
        token: API_KEY,
      },
    });

    if (response.data.s === 'no_data') {
      throw new Error(`No historical data found`);
    }

    return response.data;
  } catch (error: any) {
    // If 403 (Premium only) or any other error, fallback to simulation for UI consistency
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn(`Finnhub candles API restricted. Using simulation for ${symbol}.`);
      return generateSimulatedCandles(currentPrice || 150);
    }
    throw error;
  }
};

/**
 * Generates realistic-looking candle data for UI demonstration
 */
const generateSimulatedCandles = (basePrice: number): FinnhubCandle => {
  const points = 50;
  const c: number[] = [];
  const t: number[] = [];
  let lastPrice = basePrice;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    lastPrice += change;
    c.push(lastPrice);
    t.push(Math.floor(Date.now() / 1000) - (points - i) * 3600);
  }

  return {
    c,
    h: c.map(v => v * 1.01),
    l: c.map(v => v * 0.99),
    o: c.map(v => v * 1.005),
    s: 'ok',
    t,
    v: c.map(() => Math.random() * 10000),
  };
};

export const fetchMultipleStockQuotes = async (symbols: string[]) => {
  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      const data = await fetchStockQuote(symbol);
      return { ...data, symbol };
    })
  );
  return quotes;
};
