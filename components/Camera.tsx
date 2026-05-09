import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, RefObject, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ORIENTATION_THRESHOLD } from "../helpers/constants";
import { getPitch, getRoll } from "../helpers/utils";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  cameraRef: RefObject<CameraView | null>;
  isProcessing: boolean;
  onCapture: () => void;
  onCancel: () => void;
}

const CameraScreen: FC<Props> = ({ cameraRef, isProcessing, onCapture, onCancel }) => {
  const [pitch, setPitch] = useState(90);
  const [roll, setRoll] = useState(90);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
  const wasAligned = useRef(false);

  const handleCameraReady = async () => {
    const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
    console.log("[Camera] Available picture sizes:", JSON.stringify(sizes));

    if (!sizes?.length) return;

    // "Photo" is the native full-sensor photo preset on Android — always prefer it
    if (sizes.includes("Photo")) {
      console.log("[Camera] Selected size: Photo (native full-res)");
      setPictureSize("Photo");
      return;
    }

    const numericSizes = sizes.filter((s) => s.includes("x"));
    if (!numericSizes.length) return;
    const largest = numericSizes.reduce((best, size) => {
      const [w, h] = size.split("x").map(Number);
      const [bw, bh] = best.split("x").map(Number);
      return w * h > bw * bh ? size : best;
    });

    console.log("[Camera] Selected size:", largest);
    setPictureSize(largest);
  };

  const isAligned =
    Math.abs(pitch) <= ORIENTATION_THRESHOLD && Math.abs(roll) <= ORIENTATION_THRESHOLD;

  useEffect(() => {
    wasAligned.current = false;
    DeviceMotion.setUpdateInterval(200);
    const subscription = DeviceMotion.addListener((data) => {
      const x = data.accelerationIncludingGravity?.x ?? 0;
      const y = data.accelerationIncludingGravity?.y ?? 0;
      const z = data.accelerationIncludingGravity?.z ?? 0;
      const newPitch = getPitch(y, z);
      const newRoll = getRoll(x, z);
      const aligned =
        Math.abs(newPitch) <= ORIENTATION_THRESHOLD && Math.abs(newRoll) <= ORIENTATION_THRESHOLD;
      if (aligned && !wasAligned.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      wasAligned.current = aligned;
      setPitch(newPitch);
      setRoll(newRoll);
    });
    return () => subscription.remove();
  }, []);

  const bracketColor = isAligned ? "border-green-500" : "border-red-500";

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
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View className="items-center mt-3.5">
        <View className={`px-4 py-2 rounded-full ${isAligned ? "bg-green-500/85" : "bg-red-500/85"}`}>
          <Text className="text-white text-[11px] font-bold tracking-[1.5px]">
            {isAligned ? "READY TO CAPTURE" : "ALIGN CAMERA"}
          </Text>
        </View>
      </View>

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View className={`absolute w-8 h-8 top-[20%] left-[12%] border-t-[3px] border-l-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 top-[20%] right-[12%] border-t-[3px] border-r-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 bottom-[28%] left-[12%] border-b-[3px] border-l-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 bottom-[28%] right-[12%] border-b-[3px] border-r-[3px] ${bracketColor}`} />
        <View style={{ position: "absolute", top: "50%", left: "50%", width: 18, height: StyleSheet.hairlineWidth, marginLeft: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
        <View style={{ position: "absolute", top: "50%", left: "50%", width: StyleSheet.hairlineWidth, height: 18, marginTop: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
      </View>

      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 w-full bg-black/55">
        <View className="flex-row items-center justify-between px-10 pt-6 pb-3">
          <View className="items-center w-14">
            <Text className="text-white/45 text-[9px] font-bold tracking-[1.5px] mb-1">PITCH</Text>
            <Text className={`text-xl font-light ${Math.abs(pitch) <= ORIENTATION_THRESHOLD ? "text-green-400" : "text-red-400"}`}>
              {Math.round(Math.abs(pitch))}°
            </Text>
          </View>

          {isProcessing ? (
            <View className="w-[78px] h-[78px] rounded-full border-[3px] border-white/25 items-center justify-center">
              <ActivityIndicator color="white" size="large" />
            </View>
          ) : (
            <TouchableOpacity onPress={onCapture} disabled={!isAligned} activeOpacity={0.75}>
              <View className={`w-[78px] h-[78px] rounded-full border-[3px] items-center justify-center ${isAligned ? "border-white" : "border-white/25"}`}>
                <View className={`w-[62px] h-[62px] rounded-full ${isAligned ? "bg-white" : "bg-white/20"}`} />
              </View>
            </TouchableOpacity>
          )}

          <View className="items-center w-14">
            <Text className="text-white/45 text-[9px] font-bold tracking-[1.5px] mb-1">ROLL</Text>
            <Text className={`text-xl font-light ${Math.abs(roll) <= ORIENTATION_THRESHOLD ? "text-green-400" : "text-red-400"}`}>
              {Math.round(Math.abs(roll))}°
            </Text>
          </View>
        </View>
        {isProcessing && (
          <Text className="text-white/50 text-[11px] tracking-[1.5px] text-center pb-2">Processing…</Text>
        )}
      </SafeAreaView>

    </View>
  );
};

export default CameraScreen;
