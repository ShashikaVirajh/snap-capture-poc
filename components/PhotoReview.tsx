import { CameraCapturedPicture } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { CompressedPhoto } from "../helpers/types";
import { formatBytes } from "../helpers/utils";

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
  const activeWidth = activeTab === "original" ? photo.width : compressed.width;
  const activeHeight = activeTab === "original" ? photo.height : compressed.height;
  const activeSize = activeTab === "original" ? photoSize : compressed.size;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      <View className="flex-row items-center px-5 py-4 border-b border-white/8">
        <View className="flex-1 items-center">
          <Text className="text-white text-[13px] font-bold tracking-[3px]">CAPTURE REVIEW</Text>
          {capturedAt && (
            <Text className="text-white/40 text-[12px] tracking-[1px] mt-1">
              {capturedAt.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Text>
          )}
        </View>
      </View>

      <Image
        source={{ uri: activeUri }}
        style={{ width: "100%", height: 300 }}
        resizeMode="cover"
      />

      <View className="flex-row border-b border-white/8">
        <TouchableOpacity
          onPress={() => onTabChange("original")}
          className="flex-1 items-center py-3"
        >
          <Text className={`text-[11px] font-bold tracking-[2px] ${activeTab === "original" ? "text-white" : "text-white/30"}`}>
            ORIGINAL
          </Text>

          {activeTab === "original" && (
            <View className="absolute bottom-0 left-6 right-6 h-[2px] bg-white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTabChange("compressed")}
          className="flex-1 items-center py-3"
        >
          <Text className={`text-[11px] font-bold tracking-[2px] ${activeTab === "compressed" ? "text-white" : "text-white/30"}`}>
            COMPRESSED
          </Text>

          {activeTab === "compressed" && (
            <View className="absolute bottom-0 left-6 right-6 h-[2px] bg-white" />
          )}
        </TouchableOpacity>
      </View>

      <View className="px-5 py-5 gap-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white/40 text-[11px] tracking-[1.5px]">RESOLUTION</Text>
          <Text className="text-white text-sm font-medium">{activeWidth} × {activeHeight} px</Text>
        </View>

        <View className="h-px bg-white/8" />

        <View className="flex-row justify-between items-center">
          <Text className="text-white/40 text-[11px] tracking-[1.5px]">FILE SIZE</Text>
          <Text className="text-white text-sm font-medium">{formatBytes(activeSize)}</Text>
        </View>

        {activeTab === "compressed" && (
          <>
            <View className="h-px bg-white/8" />
            <View className="flex-row justify-between items-center">
              <Text className="text-white/40 text-[11px] tracking-[1.5px]">SAVED</Text>
              <Text className="text-green-400 text-sm font-semibold">
                {formatBytes(photoSize - compressed.size)} · {compressionRatio}%
              </Text>
            </View>
          </>
        )}
      </View>

      <View className="flex-1 justify-end px-5 pb-6">
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
            <Text className="text-black font-bold tracking-[2px] text-[12px]">SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default PhotoReviewScreen;
