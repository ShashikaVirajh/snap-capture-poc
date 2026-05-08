import { CameraCapturedPicture, CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system/next";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

// Valid range: within ±10° of flat
const PITCH_THRESHOLD = 10;

const getPitch = (y: number, z: number): number => {
  if (Math.abs(z) < 0.5) return 90;
  return Math.atan2(y, Math.abs(z)) * (180 / Math.PI);
};

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
  const [pitch, setPitch] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressed, setCompressed] = useState<CompressedPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<"original" | "compressed">("original");
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);
  const wasAligned = useRef(false);

  const isAligned = Math.abs(pitch) <= PITCH_THRESHOLD;

  useEffect(() => {
    DeviceMotion.setUpdateInterval(200);
    const subscription = DeviceMotion.addListener((data) => {
      const y = data.accelerationIncludingGravity?.y ?? 0;
      const z = data.accelerationIncludingGravity?.z ?? 0;
      const newPitch = getPitch(y, z);
      const aligned = Math.abs(newPitch) <= PITCH_THRESHOLD;
      if (aligned && !wasAligned.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      wasAligned.current = aligned;
      setPitch(newPitch);
    });

    return () => subscription.remove();
  }, []);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    wasAligned.current = false;
    setShowCamera(true);
  };

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsProcessing(true);
    try {
      const captured = await cameraRef.current?.takePictureAsync();
      setCapturedAt(new Date());
      if (!captured) return;

      const [compressedResult] = await Promise.all([
        ImageManipulator.manipulateAsync(captured.uri, [], {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        }),
      ]);

      const originalSize = new File(captured.uri).size;
      const compressedSize = new File(compressedResult.uri).size;

      setPhotoSize(originalSize);
      setCompressed({
        uri: compressedResult.uri,
        width: compressedResult.width,
        height: compressedResult.height,
        size: compressedSize,
      });
      setPhoto(captured);
      setActiveTab("original");
      setShowCamera(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert("Permission required", "Allow access to Photos to save images.");
        return;
      }
    }
    const uriToSave = activeTab === "original" ? photo?.uri : compressed?.uri;
    if (!uriToSave) return;
    await MediaLibrary.saveToLibraryAsync(uriToSave);
    Alert.alert("Saved", "Image saved to Photos.");
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setCapturedAt(null);
    setActiveTab("original");
    setShowCamera(true);
  };

  const compressionRatio =
    photoSize && compressed
      ? ((1 - compressed.size / photoSize) * 100).toFixed(1)
      : null;

  const activeUri = activeTab === "original" ? photo?.uri : compressed?.uri;
  const activeWidth = activeTab === "original" ? photo?.width : compressed?.width;
  const activeHeight = activeTab === "original" ? photo?.height : compressed?.height;
  const activeSize = activeTab === "original" ? photoSize : (compressed?.size ?? null);

  // ── Camera screen ──────────────────────────────────────────────
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

          {/* Alignment pill with pitch */}
          <View className="items-center mt-4">
            <View
              className={`px-4 py-1 rounded-full flex-row gap-2 items-center ${isAligned ? "bg-green-500/80" : "bg-red-500/80"}`}
            >
              <Text className="text-white text-sm font-medium">
                {isAligned ? "Aligned" : "Misaligned"}
              </Text>
              <Text className="text-white/80 text-sm">
                {Math.round(Math.abs(pitch))}°
              </Text>
            </View>
          </View>

          {/* Shutter / processing */}
          <SafeAreaView
            edges={["bottom"]}
            className="absolute bottom-0 w-full items-center pb-6"
          >
            {isProcessing ? (
              <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
                <ActivityIndicator color="white" size="large" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCapture}
                disabled={!isAligned}
                className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${isAligned ? "bg-white/30" : "bg-white/10"}`}
              >
                <View
                  className={`w-14 h-14 rounded-full ${isAligned ? "bg-white" : "bg-white/40"}`}
                />
              </TouchableOpacity>
            )}
            {isProcessing && (
              <Text className="text-white/80 text-xs mt-2">Processing...</Text>
            )}
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // ── Image details screen ───────────────────────────────────────
  if (photo && compressed) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />

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

        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4 gap-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Captured</Text>
            <Text className="text-sm font-medium text-gray-800">
              {capturedAt
                ? capturedAt.toLocaleString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })
                : "—"}
            </Text>
          </View>
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

        <View className="mx-4 mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={handleRetake}
            className="flex-1 py-4 bg-gray-200 rounded-2xl items-center"
          >
            <Text className="text-base font-semibold text-gray-700">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            className="flex-1 py-4 bg-blue-500 rounded-2xl items-center"
          >
            <Text className="text-base font-semibold text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Home screen ────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="flex-1 items-center justify-center gap-8">
        <Text className="text-2xl font-bold text-gray-800">Surgical Tray Capture</Text>
        <Text className="text-sm text-gray-500 text-center px-8">
          Open the camera and position it directly above the tray to capture.
        </Text>

        <TouchableOpacity
          onPress={handleOpenCamera}
          className="px-10 py-4 rounded-2xl bg-blue-500"
        >
          <Text className="text-base font-semibold text-white">Open Camera</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}