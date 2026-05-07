import { CameraView, useCameraPermissions } from "expo-camera";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "./global.css";

// -9.3 => 14° of tilt
const TOP_DOWN_THRESHOLD = -9.3;

export default function App() {
  const [isAligned, setIsAligned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(200);
    const subscription = DeviceMotion.addListener((data) => {
      const z = data.accelerationIncludingGravity?.z ?? 0;
      setIsAligned(z < TOP_DOWN_THRESHOLD);
    });

    return () => subscription.remove();
  }, []);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }

    setShowCamera(true);
  };

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();

    if (photo) {
      setShowCamera(false);
    }
  };

  if (showCamera) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
          {/* Top bar */}
          <View className="flex-row items-center px-6 pt-16 pb-4 bg-black/40">
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text className="text-white text-base font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="flex-1 text-white text-center font-semibold">
              Surgical Tray Capture
            </Text>
            <View className="w-14" />
          </View>

          {/* Alignment reminder while in camera */}
          <View className="items-center mt-4">
            <View
              className={`px-4 py-1 rounded-full ${isAligned ? "bg-green-500/80" : "bg-red-500/80"}`}
            >
              <Text className="text-white text-sm font-medium">
                {isAligned ? "Aligned" : "Misaligned — adjust angle"}
              </Text>
            </View>
          </View>

          {/* Capture button */}
          <View className="absolute bottom-16 w-full items-center">
            <TouchableOpacity
              onPress={handleCapture}
              disabled={!isAligned}
              className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${isAligned ? "bg-white/30" : "bg-white/10"}`}
            >
              <View
                className={`w-14 h-14 rounded-full ${isAligned ? "bg-white" : "bg-white/40"}`}
              />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 gap-8">
      <StatusBar style="auto" />

      {/* Orientation indicator */}
      <View
        className={`w-36 h-36 rounded-full items-center justify-center ${isAligned ? "bg-green-500" : "bg-red-500"
          }`}
      >
        <Text className="text-white text-4xl">{isAligned ? "✓" : "✕"}</Text>
      </View>

      {/* Status label */}
      <View className="items-center gap-1">
        <Text className="text-lg font-semibold text-gray-800">
          {isAligned ? "Ready" : "Misaligned"}
        </Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          {isAligned
            ? "Tray in capture position"
            : "Position camera directly above the tray"}
        </Text>
      </View>

      {/* Camera button */}
      <TouchableOpacity
        disabled={!isAligned}
        onPress={handleOpenCamera}
        className={`px-10 py-4 rounded-2xl ${isAligned ? "bg-blue-500" : "bg-gray-300"
          }`}
      >
        <Text
          className={`text-base font-semibold ${isAligned ? "text-white" : "text-gray-400"
            }`}
        >
          Capture Tray
        </Text>
      </TouchableOpacity>
    </View>
  );
}
