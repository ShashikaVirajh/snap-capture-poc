import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, RefObject, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { getLargestPictureSize, getPitch, getRoll, isDeviceAligned, isPitchAligned, isRollAligned } from "../helpers/utils";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  cameraRef: RefObject<CameraView | null>;
  isCompressing: boolean;
  onCapture: () => void;
  onCancel: () => void;
}

const Capture: FC<Props> = ({ cameraRef, isCompressing, onCapture, onCancel }) => {
  const [pitch, setPitch] = useState(90);
  const [roll, setRoll] = useState(90);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
  const prevDeviceAligned = useRef(false);

  const deviceAligned = isDeviceAligned(pitch, roll);
  const bracketColor = deviceAligned ? "border-green-500" : "border-red-500";

  useEffect(() => {
    if (isCompressing) return;

    prevDeviceAligned.current = false;
    DeviceMotion.setUpdateInterval(200);

    const subscription = DeviceMotion.addListener((data) => {
      const x = data.accelerationIncludingGravity?.x ?? 0;
      const y = data.accelerationIncludingGravity?.y ?? 0;
      const z = data.accelerationIncludingGravity?.z ?? 0;

      const newPitch = getPitch(y, z);
      const newRoll = getRoll(x, z);

      const isDeviceNowAligned = isDeviceAligned(newPitch, newRoll);

      if (isDeviceNowAligned && !prevDeviceAligned.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      prevDeviceAligned.current = isDeviceNowAligned;

      setPitch(newPitch);
      setRoll(newRoll);
    });

    return () => subscription.remove();
  }, [isCompressing]);

  const handleCameraReady = async () => {
    const imageSizes = await cameraRef.current?.getAvailablePictureSizesAsync();

    if (!imageSizes?.length) return;

    // "Photo" is an Android-only preset. Kept for future Android support
    if (imageSizes.includes("Photo")) {
      setPictureSize("Photo");
      return;
    }

    // iOS returns numeric sizes like "3024x4032" — pick the largest
    const numericSizes = imageSizes.filter((size) => size.includes("x"));
    if (!numericSizes.length) return;

    const largestPictureSize = getLargestPictureSize(numericSizes)
    setPictureSize(largestPictureSize);
  };


  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" pictureSize={pictureSize} onCameraReady={handleCameraReady} />

      <SafeAreaView edges={["top"]} className="bg-black/55">
        <View className="flex-row items-center px-5 py-3.5">
          <View className="w-[22px]" />

          <View className="flex-1 items-center">
            <Text className="text-white text-[13px] font-bold tracking-[3px]">SURGICAL TRAY</Text>
            <Text className="text-white/45 text-[10px] tracking-[4px] mt-0.5">CAPTURE</Text>
          </View>

          <TouchableOpacity onPress={onCancel} hitSlop={12}>
            <Ionicons name="close" size={22} color="#ffffffbf" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {!isCompressing && (
        <>
          <View className="flex-row items-center justify-between px-10 mt-1">
            <View className="items-center w-14">
              <Text className="text-white/45 text-[11px] font-bold tracking-[1.5px] mb-1">PITCH</Text>
              <Text className={`text-2xl font-light ${isPitchAligned(pitch) ? "text-green-400" : "text-red-400"}`}>
                {Math.round(Math.abs(pitch))}°
              </Text>
            </View>

            <View className={`px-4 py-2 rounded-full ${deviceAligned ? "bg-green-500/85" : "bg-red-500/85"}`}>
              <Text className="text-white text-[11px] font-bold tracking-[1.5px]">
                {deviceAligned ? "READY TO CAPTURE" : "ALIGN CAMERA"}
              </Text>
            </View>

            <View className="items-center w-14">
              <Text className="text-white/45 text-[11px] font-bold tracking-[1.5px] mb-1">ROLL</Text>
              <Text className={`text-2xl font-light ${isRollAligned(roll) ? "text-green-400" : "text-red-400"}`}>
                {Math.round(Math.abs(roll))}°
              </Text>
            </View>
          </View>

          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View className={`absolute w-8 h-8 top-[22%] left-[12%] border-t-[3px] border-l-[3px] ${bracketColor}`} />
            <View className={`absolute w-8 h-8 top-[22%] right-[12%] border-t-[3px] border-r-[3px] ${bracketColor}`} />
            <View className={`absolute w-8 h-8 bottom-[15%] left-[12%] border-b-[3px] border-l-[3px] ${bracketColor}`} />
            <View className={`absolute w-8 h-8 bottom-[15%] right-[12%] border-b-[3px] border-r-[3px] ${bracketColor}`} />
            <View style={{ position: "absolute", top: "50%", left: "50%", width: 18, height: StyleSheet.hairlineWidth, marginLeft: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
            <View style={{ position: "absolute", top: "50%", left: "50%", width: StyleSheet.hairlineWidth, height: 18, marginTop: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
          </View>
        </>
      )}

      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 w-full bg-black/55">
        <View className="flex-row items-center justify-center px-10 pt-6 pb-3">
          <TouchableOpacity onPress={onCapture} disabled={!deviceAligned || isCompressing} activeOpacity={0.75}>
            <View className={`w-[78px] h-[78px] rounded-full border-[3px] items-center justify-center ${deviceAligned ? "border-white" : "border-white/25"}`}>
              <View className={`w-[62px] h-[62px] rounded-full ${deviceAligned ? "bg-white" : "bg-white/20"}`} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isCompressing && (
        <View style={StyleSheet.absoluteFillObject} className="bg-black items-center justify-center gap-5">
          <View className="w-[72px] h-[72px] rounded-full border-[3px] border-green-500/50 items-center justify-center">
            <ActivityIndicator color="#22c55e" size="large" />
          </View>

          <Text className="text-green-400 text-sm font-semibold tracking-[1.5px]">Compressing…</Text>
        </View>
      )}

    </View>
  );
};

export default Capture;
