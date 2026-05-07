import { CameraCapturedPicture, CameraView, useCameraPermissions } from "expo-camera";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

// -9.3 => 14° of tilt
const TOP_DOWN_THRESHOLD = -9.3;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function HomeScreen() {
  const [isAligned, setIsAligned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
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
    const captured = await cameraRef.current?.takePictureAsync();
    if (captured) {
      const response = await fetch(captured.uri);
      const blob = await response.blob();
      setPhotoSize(blob.size);
      setPhoto(captured);
      setShowCamera(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoSize(null);
  };

  // ── Camera screen ──────────────────────────────────────────────
  if (showCamera) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
          {/* Top bar */}
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-6 py-4 bg-black/40">
              <TouchableOpacity onPress={() => setShowCamera(false)}>
                <Text className="text-white text-base font-medium">Cancel</Text>
              </TouchableOpacity>
              <Text className="flex-1 text-white text-center font-semibold">
                Surgical Tray Capture
              </Text>
              <View className="w-14" />
            </View>
          </SafeAreaView>

          {/* Alignment pill */}
          <View className="items-center mt-4">
            <View
              className={`px-4 py-1 rounded-full ${isAligned ? "bg-green-500/80" : "bg-red-500/80"}`}
            >
              <Text className="text-white text-sm font-medium">
                {isAligned ? "Aligned" : "Misaligned — adjust angle"}
              </Text>
            </View>
          </View>

          {/* Shutter button */}
          <SafeAreaView
            edges={["bottom"]}
            className="absolute bottom-0 w-full items-center pb-6"
          >
            <TouchableOpacity
              onPress={handleCapture}
              disabled={!isAligned}
              className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${isAligned ? "bg-white/30" : "bg-white/10"}`}
            >
              <View
                className={`w-14 h-14 rounded-full ${isAligned ? "bg-white" : "bg-white/40"}`}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // ── Image details screen ───────────────────────────────────────
  if (photo) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />

        {/* Image preview */}
        <View className="mx-4 mt-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Original
          </Text>
          <View
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            style={{ elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <Image
              source={{ uri: photo.uri }}
              className="w-full"
              style={{ height: 260 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Details card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 gap-3">
          <Text className="text-base font-semibold text-gray-800">Original Image</Text>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Width</Text>
            <Text className="text-sm font-medium text-gray-800">{photo.width} px</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Height</Text>
            <Text className="text-sm font-medium text-gray-800">{photo.height} px</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Resolution</Text>
            <Text className="text-sm font-medium text-gray-800">
              {photo.width} × {photo.height}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">File size</Text>
            <Text className="text-sm font-medium text-gray-800">
              {photoSize !== null ? formatBytes(photoSize) : "—"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRetake}
          className="mx-4 mt-4 py-4 bg-blue-500 rounded-2xl items-center"
        >
          <Text className="text-white text-base font-semibold">Retake</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Home screen ────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="flex-1 items-center justify-center gap-8">
        {/* Orientation indicator */}
        <View
          className={`w-36 h-36 rounded-full items-center justify-center ${
            isAligned ? "bg-green-500" : "bg-red-500"
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
          className={`px-10 py-4 rounded-2xl ${
            isAligned ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isAligned ? "text-white" : "text-gray-400"
            }`}
          >
            Capture Tray
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
