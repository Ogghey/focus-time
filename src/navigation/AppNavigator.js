import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeStack from "./HomeStack";
import HistoryScreen from "../screens/HistoryScreen";
import ProgressScreen from "../screens/ProgressScreen";

import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
  
export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {

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
          },
          tabBarItemStyle: {
            paddingVertical: 5,
            borderRadius: 20,
            marginHorizontal: 8,
          },
          tabBarShowLabel: false,


          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,

          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "History") {
              iconName = "history";
            } else if (route.name === "Progress") {
              iconName = "bar-chart";
            }


            return (
              <MaterialIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
        })}
      >

        <Tab.Screen
          name="Home"
          component={HomeStack}
        />

        <Tab.Screen
          name="History"
          component={HistoryScreen}
        />

        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
}