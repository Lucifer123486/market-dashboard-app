import { useState, useCallback, useEffect } from 'react';

// Use a lazy-loaded approach for MMKV to prevent crash if native module is missing
let storage: any;
try {
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV();
} catch (e) {
  console.warn('MMKV native module not found. Persistence will not work until you rebuild the app.');
  storage = {
    getString: () => null,
    set: () => {},
    delete: () => {},
  };
}

const WATCHLIST_KEY = 'user_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const storedWatchlist = storage.getString(WATCHLIST_KEY);
    if (storedWatchlist) {
      try {
        setWatchlist(JSON.parse(storedWatchlist));
      } catch (e) {
        console.error('Failed to parse watchlist from storage', e);
      }
    }
  }, []);

  const addStock = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      const newWatchlist = [...prev, symbol];
      storage.set(WATCHLIST_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);

  const removeStock = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const newWatchlist = prev.filter((s) => s !== symbol);
      storage.set(WATCHLIST_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);

  const isFavorite = useCallback((symbol: string) => {
    return watchlist.includes(symbol);
  }, [watchlist]);

  const toggleStock = useCallback((symbol: string) => {
    if (watchlist.includes(symbol)) {
      removeStock(symbol);
    } else {
      addStock(symbol);
    }
  }, [watchlist, addStock, removeStock]);

  return {
    watchlist,
    addStock,
    removeStock,
    toggleStock,
    isFavorite,
  };
};
