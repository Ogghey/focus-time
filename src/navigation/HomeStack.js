import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FocusScreen from "../screens/FocusScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../theme/colors";
import DataManagementScreen from "../screens/DataManagementScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerTitle: "Today" , headerTitleAlign: 'left', headerShown: false}}/>
            <Stack.Screen name="FocusScreen" component={FocusScreen} options={{ title: "Focus", headerShown: false }}/>
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{  headerTitle: "History" , headerTitleAlign: 'left', headerShown: false }}/>
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{  headerTitle: "Settings" , headerTitleAlign: 'left', headerShown: false }}/>
            <Stack.Screen name="DataManagementScreen" component={DataManagementScreen} options={{  headerTitle: "Data Management" , headerTitleAlign: 'left', headerShown: false }}/>
      </Stack.Navigator>
  );
}