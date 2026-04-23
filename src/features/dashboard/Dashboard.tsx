import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { fetchMultipleStockQuotes, FinnhubQuote } from '../../services/marketService';
import { useWatchlist } from '../../hooks/useWatchlist';

const SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'AMZN', 'MSFT', 'NVDA', 'META', 'NFLX'];

const SYMBOL_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla, Inc.',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com, Inc.',
  MSFT: 'Microsoft Corp.',
  NVDA: 'NVIDIA Corp.',
  META: 'Meta Platforms',
  NFLX: 'Netflix, Inc.',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface StockWithMeta extends FinnhubQuote {
  symbol: string;
  name: string;
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { watchlist, toggleStock, isFavorite } = useWatchlist();

  const {
    data: stocks,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['stocks-v2'],
    queryFn: async () => {
      const results = await fetchMultipleStockQuotes(SYMBOLS);
      return results.map(quote => ({
        ...quote,
        name: SYMBOL_NAMES[quote.symbol] || quote.symbol
      })) as StockWithMeta[];
    },
    staleTime: 1000 * 60,
  });

  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    return stocks.filter((stock) => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = showFavoritesOnly ? watchlist.includes(stock.symbol) : true;
      return matchesSearch && matchesFilter;
    });
  }, [stocks, searchQuery, showFavoritesOnly, watchlist]);

  const renderStockItem = ({ item }: { item: StockWithMeta }) => {
    const isPositive = item.d >= 0;
    const favorite = isFavorite(item.symbol);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Details', { symbol: item.symbol })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <TouchableOpacity onPress={() => toggleStock(item.symbol)} style={styles.favoriteButton}>
              <Text style={[styles.favoriteIcon, { color: favorite ? '#FFD700' : '#444' }]}>
                {favorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{item.name}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.priceText}>${(item.c ?? 0).toFixed(2)}</Text>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)' },
            ]}
          >
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? '#4CAF50' : '#F44336' },
              ]}
            >
              {isPositive ? '+' : ''}
              {(item.dp ?? 0).toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching market data...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load market data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.appTitle}>Market Dash</Text>
        <View style={styles.filterRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]} 
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={[styles.filterButtonText, showFavoritesOnly && styles.filterButtonTextActive]}>
              {showFavoritesOnly ? 'Favorites ★' : 'All Stocks'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No stocks found' : showFavoritesOnly ? 'No favorites added yet' : 'No data available'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  appTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  searchInput: {
    color: '#FFF',
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  filterButtonText: {
    color: '#888',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#4CAF50',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardLeft: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginLeft: 8,
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  symbolText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  priceText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  changeBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default Dashboard;
