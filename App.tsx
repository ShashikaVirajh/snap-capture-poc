import "./global.css";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity } from "react-native";
import { DeviceMotion } from "expo-sensors";

// -9.3 => 18° of tilt
const TOP_DOWN_THRESHOLD = -9.3;

  export default function App() {
  const [isTopDown, setIsTopDown] = useState(false);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(200);
    const subscription = DeviceMotion.addListener((data) => {
      const z = data.accelerationIncludingGravity?.z ?? 0;
      setIsTopDown(z < TOP_DOWN_THRESHOLD);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 gap-8">
      <StatusBar style="auto" />

      {/* Orientation indicator */}
      <View
        className={`w-36 h-36 rounded-full items-center justify-center ${
          isTopDown ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <Text className="text-white text-4xl">{isTopDown ? "✓" : "✕"}</Text>
      </View>

      {/* Status label */}
      <View className="items-center gap-1">
        <Text className="text-lg font-semibold text-gray-800">
          {isTopDown ? "Top-down detected" : "Wrong orientation"}
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          {isTopDown
            ? "You can now open the camera"
            : "Hold the phone flat with the camera facing down"}
        </Text>
      </View>

      {/* Camera button — enabled only when top-down */}
      <TouchableOpacity
        disabled={!isTopDown}
        className={`px-10 py-4 rounded-2xl ${
          isTopDown ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            isTopDown ? "text-white" : "text-gray-400"
          }`}
        >
          Open Camera
        </Text>
      </TouchableOpacity>
    </View>
  );
}
