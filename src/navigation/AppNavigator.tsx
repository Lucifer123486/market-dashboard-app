import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Dashboard from '../features/dashboard/Dashboard';
import StockDetails from '../features/details/StockDetails';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // We'll use custom headers in screens for more control
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ title: 'Market Overview' }}
      />
      <Stack.Screen 
        name="Details" 
        component={StockDetails} 
        options={{ title: 'Stock Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
