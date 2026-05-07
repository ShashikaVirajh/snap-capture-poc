import { CameraCapturedPicture, CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const TOP_DOWN_THRESHOLD = -9.3;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

type CompressedPhoto = {
  uri: string;
  width: number;
  height: number;
  size: number;
};

export default function HomeScreen() {
  const [isAligned, setIsAligned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressed, setCompressed] = useState<CompressedPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "compressed">("original");
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
    if (!captured) return;

    const [originalBlob, compressedResult] = await Promise.all([
      fetch(captured.uri).then((r) => r.blob()),
      ImageManipulator.manipulateAsync(captured.uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      }),
    ]);

    const compressedBlob = await fetch(compressedResult.uri).then((r) => r.blob());

    setPhotoSize(originalBlob.size);
    setCompressed({
      uri: compressedResult.uri,
      width: compressedResult.width,
      height: compressedResult.height,
      size: compressedBlob.size,
    });
    setPhoto(captured);
    setActiveTab("original");
    setShowCamera(false);
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setActiveTab("original");
  };

  const compressionRatio =
    photoSize && compressed
      ? ((1 - compressed.size / photoSize) * 100).toFixed(1)
      : null;

  const activeUri = activeTab === "original" ? photo?.uri : compressed?.uri;
  const activeWidth = activeTab === "original" ? photo?.width : compressed?.width;
  const activeHeight = activeTab === "original" ? photo?.height : compressed?.height;
  const activeSize = activeTab === "original" ? photoSize : (compressed?.size ?? null);

  if (showCamera) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
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

          <View className="items-center mt-4">
            <View
              className={`px-4 py-1 rounded-full ${isAligned ? "bg-green-500/80" : "bg-red-500/80"}`}
            >
              <Text className="text-white text-sm font-medium">
                {isAligned ? "Aligned" : "Misaligned — adjust angle"}
              </Text>
            </View>
          </View>

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

  if (photo && compressed) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />

        {/* Tab toggle */}
        <View className="mx-4 mt-4 flex-row bg-gray-200 rounded-2xl p-1 gap-1">
          <TouchableOpacity
            onPress={() => setActiveTab("original")}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === "original" ? "bg-blue-500" : ""}`}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === "original" ? "text-white" : "text-gray-500"}`}
            >
              Original
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("compressed")}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === "compressed" ? "bg-blue-500" : ""}`}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === "compressed" ? "text-white" : "text-gray-500"}`}
            >
              Compressed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full-width image */}
        <View
          className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Image
            source={{ uri: activeUri }}
            style={{ width: "100%", height: 300 }}
            resizeMode="cover"
          />
        </View>

        {/* Details card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4 gap-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Resolution</Text>
            <Text className="text-sm font-medium text-gray-800">
              {activeWidth} x {activeHeight} px
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">File size</Text>
            <Text className="text-sm font-medium text-gray-800">
              {activeSize !== null ? formatBytes(activeSize) : "—"}
            </Text>
          </View>
          {activeTab === "compressed" && (
            <>
              <View className="h-px bg-gray-100" />
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Saved</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatBytes(photoSize! - compressed.size)} ({compressionRatio}%)
                </Text>
              </View>
            </>
          )}
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="flex-1 items-center justify-center gap-8">
        <View
          className={`w-36 h-36 rounded-full items-center justify-center ${isAligned ? "bg-green-500" : "bg-red-500"
            }`}
        >
          <Text className="text-white text-4xl">{isAligned ? "✓" : "✕"}</Text>
        </View>

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
    </SafeAreaView>
  );
}
