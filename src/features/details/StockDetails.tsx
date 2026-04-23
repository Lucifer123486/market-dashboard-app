import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'react-native-chart-kit'; // Ensure this is installed
import { RootStackParamList } from '../../types/navigation';
import { fetchStockQuote, fetchStockCandles } from '../../services/marketService';

type DetailsRouteProp = RouteProp<RootStackParamList, 'Details'>;

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

const TIME_FILTERS = [
  { label: '1D', resolution: '5', days: 1 },
  { label: '1W', resolution: '60', days: 7 },
  { label: '1M', resolution: 'D', days: 30 },
  { label: '1Y', resolution: 'W', days: 365 },
];

const StockDetails = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation();
  const { symbol } = route.params;
  const [activeFilter, setActiveFilter] = useState(TIME_FILTERS[0]);

  // Fetch real-time quote
  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: () => fetchStockQuote(symbol),
    staleTime: 1000 * 30,
  });

  // Fetch historical data for chart
  const { data: candleData, isLoading: isChartLoading } = useQuery({
    queryKey: ['stock-candles', symbol, activeFilter.label],
    queryFn: () => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - activeFilter.days * 24 * 60 * 60;
      return fetchStockCandles(symbol, activeFilter.resolution, from, to, quote?.c);
    },
    enabled: !!quote, // Only fetch candles once we have the current price
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const chartData = useMemo(() => {
    if (!candleData || !candleData.c) return null;
    
    // Subsample data if there are too many points for performance
    const prices = candleData.c;
    const maxPoints = 50;
    const step = Math.max(1, Math.floor(prices.length / maxPoints));
    const filteredPrices = prices.filter((_, index) => index % step === 0);

    return {
      labels: [], // No labels for a cleaner look
      datasets: [
        {
          data: filteredPrices,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Default green
          strokeWidth: 2,
        },
      ],
    };
  }, [candleData]);

  if (isQuoteLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPositive = quote.d >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{symbol} Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Price Info */}
        <View style={styles.infoSection}>
          <Text style={styles.companyName}>{SYMBOL_NAMES[symbol] || symbol}</Text>
          <Text style={styles.currentPrice}>${quote.c.toFixed(2)}</Text>
          <Text style={[styles.changeText, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {isPositive ? '+' : ''}{quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
          </Text>
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <View style={styles.filterRow}>
            {TIME_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterButton,
                  activeFilter.label === filter.label && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter.label === filter.label && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isChartLoading ? (
            <View style={styles.chartLoader}>
              <ActivityIndicator color="#4CAF50" />
            </View>
          ) : chartData ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={true}
              chartConfig={{
                backgroundColor: '#0F0F0F',
                backgroundGradientFrom: '#1A1A1A',
                backgroundGradientTo: '#1A1A1A',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '0',
                },
              }}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <View style={styles.chartError}>
              <Text style={styles.errorText}>Historical data unavailable</Text>
            </View>
          )}
        </View>

        {/* Statistics Grid */}
        <Text style={styles.sectionTitle}>Market Statistics</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Open', value: quote.o },
            { label: 'Prev Close', value: quote.pc },
            { label: 'Day High', value: quote.h },
            { label: 'Day Low', value: quote.l },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>${stat.value.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  companyName: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  currentPrice: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#888',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#FFF',
  },
  chartLoader: {
    height: 220,
    justifyContent: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartError: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#1A1A1A',
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default StockDetails;
