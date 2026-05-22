import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BasicInfoScreen from './screens/BasicInfoScreen';
import DietScreen from './screens/DietScreen';
import GoalSelectScreen from './screens/GoalSelectScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import PhotoAssessScreen from './screens/PhotoAssessScreen';
import ProgressScreen from './screens/ProgressScreen';
import TrainingScreen from './screens/TrainingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { Colors } from './theme';
import type { RootStackParamList } from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bg,
    card: Colors.bg,
    border: Colors.goldBorder,
    notification: Colors.goldButton,
    primary: Colors.gold,
    text: Colors.textPrimary,
  },
};

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.bg },
  animation: 'slide_from_right' as const,
  animationDuration: 200,
} as const;

export default function App() {
  // ── 加载 Noto Serif SC 宋体（Web 端：注入 Google Fonts CSS）──
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&display=swap';
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
            <Stack.Screen name="GoalSelect" component={GoalSelectScreen} />
            <Stack.Screen name="PhotoAssess" component={PhotoAssessScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Training" component={TrainingScreen} />
            <Stack.Screen name="Diet" component={DietScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
