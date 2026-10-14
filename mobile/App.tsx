import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "./src/store/authStore";
import LoginScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const user = useAuth((s) => s.currentUser); // use the same field name as HomeScreen

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {user ? <HomeScreen /> : <LoginScreen />}
    </SafeAreaProvider>
  );
}
