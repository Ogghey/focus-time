import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FocusScreen from "../screens/FocusScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { colors } from "../theme/colors";

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
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: "Today" , headerTitleAlign: 'left', headerShown: false}}/>
            <Stack.Screen name="Focus" component={FocusScreen} options={{ title: "Focus", headerShown: false }}/>
            <Stack.Screen name="History" component={HistoryScreen} options={{  headerTitle: "History" , headerTitleAlign: 'left', headerShown: false }}/>
      </Stack.Navigator>
  );
}