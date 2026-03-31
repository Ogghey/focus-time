import { FocusProvider } from "./src/context/FocusContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./src/theme/colors";

export default function App() {
  return(
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <FocusProvider>
        <AppNavigator />
      </FocusProvider>
    </SafeAreaProvider>
  );

}