import { Ionicons } from "@expo/vector-icons";
import { CameraCapturedPicture, CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system/next";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import CameraScreen from "../components/Camera";
import PhotoReview from "../components/PhotoReview";
import { CompressedPhoto } from "../helpers/types";

const SafeAreaView = styled(RNSafeAreaView);

const HomeScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressed, setCompressed] = useState<CompressedPhoto | null>(null);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission required", "Allow camera access to capture images.");
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsProcessing(true);
    try {
      const captured = await cameraRef.current?.takePictureAsync({ quality: 1, imageType: "png" });
      setCapturedAt(new Date());
      if (!captured) return;

      const compressedResult = await ImageManipulator.manipulateAsync(captured.uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      });

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
      setShowCamera(false);
    } catch {
      Alert.alert("Capture Failed", "Unable to take photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (type: "original" | "compressed") => {
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert("Permission required", "Allow access to Photos to save images.");
        return;
      }
    }
    const uriToSave = type === "original" ? photo?.uri : compressed?.uri;
    if (!uriToSave) return;
    await MediaLibrary.saveToLibraryAsync(uriToSave);
    Alert.alert("Saved", "Image saved to Photos.");
  };

  const handleRetake = () => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setCapturedAt(null);
    setShowCamera(true);
  };

  const handleClose = () => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setCapturedAt(null);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraScreen
        cameraRef={cameraRef}
        isProcessing={isProcessing}
        onCapture={handleCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  if (photo && compressed && photoSize !== null) {
    return (
      <PhotoReview
        photo={photo}
        compressed={compressed}
        photoSize={photoSize}
        capturedAt={capturedAt}
        onSave={handleSave}
        onRetake={handleRetake}
        onClose={handleClose}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-6 gap-10">
        <Ionicons name="scan-outline" size={96} color="rgba(255,255,255,0.6)" />

        <View className="items-center gap-1">
          <Text className="text-white text-[32px] font-bold tracking-[6px]">SURGICAL</Text>
          <Text className="text-white text-[32px] font-bold tracking-[6px]">TRAY</Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="h-px w-8 bg-white/20" />
            <Text className="text-white/40 text-[11px] tracking-[6px]">CAPTURE</Text>
            <View className="h-px w-8 bg-white/20" />
          </View>
        </View>

        <Text className="text-white/40 text-sm text-center leading-6 px-4">
          Position the camera directly above the surgical tray for a precise top-down capture.
        </Text>

        <View className="flex-row gap-2">
          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">ALIGNMENT</Text>
          </View>
          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">COMPRESSION</Text>
          </View>
          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">HAPTICS</Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleOpenCamera}
          className="w-full bg-white rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-black font-bold tracking-[3px] text-sm">OPEN CAMERA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


export default HomeScreen;