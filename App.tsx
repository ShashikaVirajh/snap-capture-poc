import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-xl font-bold text-white">NativeWind works!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
