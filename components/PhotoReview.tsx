import { CameraCapturedPicture } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { CompressedPhoto } from "../helpers/types";
import { formatBytes, getFormat } from "../helpers/utils";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  photo: CameraCapturedPicture;
  compressed: CompressedPhoto;
  photoSize: number;
  capturedAt: Date | null;
  activeTab: "original" | "compressed";
  onTabChange: (tab: "original" | "compressed") => void;
  onSave: () => void;
  onRetake: () => void;
}

const PhotoReviewScreen: FC<Props> = ({
  photo,
  compressed,
  photoSize,
  capturedAt,
  activeTab,
  onTabChange,
  onSave,
  onRetake,
}) => {
  const compressionRatio = ((1 - compressed.size / photoSize) * 100).toFixed(1);
  const activeUri = activeTab === "original" ? photo.uri : compressed.uri;
  const activeSize = activeTab === "original" ? photoSize : compressed.size;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      <View className="items-center px-5 pt-4 pb-3">
        <Text className="text-white text-[13px] font-bold tracking-[3px]">CAPTURE REVIEW</Text>
      </View>

      <View className="flex-row border-t border-b border-white/8">
        <TouchableOpacity onPress={() => onTabChange("original")} className="flex-1 items-center py-3">
          <Text className={`text-[11px] font-bold tracking-[2px] ${activeTab === "original" ? "text-blue-300" : "text-white/30"}`}>
            ORIGINAL
          </Text>
          {activeTab === "original" && (
            <View className="absolute bottom-0 left-6 right-6 h-[2px] bg-blue-300" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTabChange("compressed")} className="flex-1 items-center py-3">
          <Text className={`text-[11px] font-bold tracking-[2px] ${activeTab === "compressed" ? "text-blue-300" : "text-white/30"}`}>
            COMPRESSED
          </Text>
          {activeTab === "compressed" && (
            <View className="absolute bottom-0 left-6 right-6 h-[2px] bg-blue-300" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 mx-4 my-3 rounded-2xl overflow-hidden bg-[#0d0d0d]">
        <Image
          source={{ uri: activeUri }}
          style={{ flex: 1, width: "100%" }}
          resizeMode="contain"
        />
      </View>

      <View className="px-5 pb-3 gap-3">
        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[10px] tracking-[1px]">RESOLUTION</Text>
            <Text className="text-white/70 text-sm">{photo.width} × {photo.height}</Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[10px] tracking-[1px]">FORMAT</Text>
            <Text className="text-white/70 text-sm">{getFormat(compressed.uri)}</Text>
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[10px] tracking-[1px]">CAPTURED</Text>
            <Text className="text-white/70 text-sm">
              {capturedAt ? capturedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[10px] tracking-[1px]">SIZE</Text>
            <Text className="text-white text-sm font-medium">{formatBytes(activeSize)}</Text>
          </View>
        </View>

        <View className="rounded-2xl bg-green-500/10 border border-green-500/25 px-5 py-3 flex-row items-center justify-between">
          <Text className="text-green-400/60 text-[10px] font-bold tracking-[2px]">STORAGE SAVED</Text>
          <Text className="text-green-400 text-base font-bold">
            {formatBytes(photoSize - compressed.size)} · {compressionRatio}% reduction
          </Text>
        </View>
      </View>

      <View className="px-5 pb-6 pt-3 border-t border-white/8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onRetake}
            className="flex-1 py-4 rounded-2xl border border-white/15 items-center"
            activeOpacity={0.75}
          >
            <Text className="text-white/70 font-bold tracking-[2px] text-[12px]">RETAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            className="flex-1 py-4 rounded-2xl bg-white items-center"
            activeOpacity={0.85}
          >
            <Text className="text-black font-bold tracking-[2px] text-[12px]">
              {activeTab === "original" ? "SAVE ORIGINAL" : "SAVE COMPRESSED"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PhotoReviewScreen;
