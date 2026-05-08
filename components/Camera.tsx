import { CameraView } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, RefObject } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  cameraRef: RefObject<CameraView | null>;
  isAligned: boolean;
  pitch: number;
  roll: number;
  isProcessing: boolean;
  onCapture: () => void;
  onCancel: () => void;
};

const CameraScreen: FC<Props> = ({
  cameraRef,
  isAligned,
  pitch,
  roll,
  isProcessing,
  onCapture,
  onCancel,
}) => {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center px-6 py-4 bg-black/40">
            <TouchableOpacity onPress={onCancel}>
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
            className={`px-4 py-1 rounded-full flex-row gap-2 items-center ${isAligned ? "bg-green-500/80" : "bg-red-500/80"}`}
          >
            <Text className="text-white text-sm font-medium">
              {isAligned ? "Aligned" : "Misaligned"}
            </Text>
            <Text className="text-white/80 text-sm">
              P {Math.round(Math.abs(pitch))}° R {Math.round(Math.abs(roll))}°
            </Text>
          </View>
        </View>

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
              onPress={onCapture}
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

export default CameraScreen;