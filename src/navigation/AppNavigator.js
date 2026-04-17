import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useEffect } from 'react';

import HomeStack from "./HomeStack";
import HistoryScreen from "../screens/HistoryScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SettingsScreen from "../screens/SettingsScreen";

import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const navigationRef = useRef();

  const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';
    if (routeName === 'DataManagementScreen' || routeName === 'FocusScreen') {
      return { display: 'none' };
    }
    return {
      bottom: insets.bottom,
      left: 16,
      right: 16,
      elevation: 5,
      height: 50,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderTopWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: getTabBarVisibility(route),
          tabBarItemStyle: {
            paddingVertical: 5,
            borderRadius: 20,
            marginHorizontal: 8,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          lazy: true, // Load screen hanya saat diperlukan
          detachInactiveScreens: true, // Detach screen yang tidak aktif
          
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home";
            } else if (route.name === "History") {
              iconName = focused ? "history" : "history";
            } else if (route.name === "Progress") {
              iconName = focused ? "bar-chart" : "bar-chart";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings";
            }
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Reset stack navigator saat tab Home ditekan
              navigation.navigate('Home', { screen: 'HomeScreen' });
            }
          })}
        />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}