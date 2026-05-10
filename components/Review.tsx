import { Ionicons } from "@expo/vector-icons";
import { CameraCapturedPicture } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { TCompressedPhoto } from "../helpers/types";
import { formatFileSize, getImageFormat } from "../helpers/utils";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  originalPhoto: CameraCapturedPicture;
  compressedPhoto: TCompressedPhoto;
  originalPhotoSize: number;
  capturedAt: Date | null;
  onSave: () => void;
  onRetake: () => void;
  onClose: () => void;
}

const Review: FC<Props> = ({
  originalPhoto,
  compressedPhoto,
  originalPhotoSize,
  capturedAt,
  onSave,
  onRetake,
  onClose,
}) => {
  const [fullscreen, setFullscreen] = useState<"original" | "compressed" | null>(null);

  const storageSavedPercent = ((1 - compressedPhoto.size / originalPhotoSize) * 100).toFixed(1);
  const photoAspectRatio = originalPhoto.width / originalPhoto.height;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      <View className="flex-row items-center px-5 pt-4 pb-3">
        <View className="flex-1" />
        <Text className="text-white text-[13px] font-bold tracking-[3px]">CAPTURE SUMMARY</Text>
        <View className="flex-1 items-end">
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="#ffffffbf" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-3 px-4 mt-3">
        <TouchableOpacity style={{ flex: 1, aspectRatio: photoAspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }} activeOpacity={0.85} onPress={() => setFullscreen("original")}>
          <Image source={{ uri: originalPhoto.uri }} style={{ flex: 1 }} resizeMode="cover" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, aspectRatio: photoAspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }} activeOpacity={0.85} onPress={() => setFullscreen("compressed")}>
          <Image source={{ uri: compressedPhoto.uri }} style={{ flex: 1 }} resizeMode="cover" />
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 pt-3 pb-3 gap-3">
        <View className="flex-1 items-center">
          <Text className="text-blue-300/80 text-xs font-bold tracking-[2px]">ORIGINAL</Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-blue-300/80 text-xs font-bold tracking-[2px]">COMPRESSED</Text>
        </View>
      </View>

      <View className="px-5 py-0 flex-1 justify-center gap-6">
        <View className="gap-3">
          <View className="flex-row gap-4">
            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">ORIGINAL</Text>
              <Text className="text-white/60 text-sm">{formatFileSize(originalPhotoSize)}</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">COMPRESSED</Text>
              <Text className="text-white/60 text-sm">{formatFileSize(compressedPhoto.size)}</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">SAVED</Text>
              <Text className="text-green-400 text-sm font-semibold">{formatFileSize(originalPhotoSize - compressedPhoto.size)}</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">RESOLUTION</Text>
              <Text className="text-white/60 text-sm">{originalPhoto.width} × {originalPhoto.height}</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">FORMAT</Text>
              <Text className="text-white/60 text-sm">{getImageFormat(originalPhoto.uri)} → {getImageFormat(compressedPhoto.uri)}</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-white/30 text-[10px] tracking-[1px]">CAPTURED</Text>
              <Text className="text-white/60 text-sm">
                {capturedAt
                  ? `${capturedAt.toLocaleDateString([], { day: "2-digit", month: "short" })} ${capturedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-4 flex-row items-end justify-between">
          <View className="gap-0.5">
            <Text className="text-green-400/60 text-[10px] font-bold tracking-[1px]">STORAGE SAVED</Text>
            <Text className="text-green-400 text-2xl font-bold">{formatFileSize(originalPhotoSize - compressedPhoto.size)}</Text>
          </View>

          <View className="gap-0.5 items-end">
            <Text className="text-green-400/60 text-[10px] font-bold tracking-[1px]">REDUCTION</Text>
            <Text className="text-green-400 text-2xl font-bold">{storageSavedPercent}%</Text>
          </View>
        </View>
      </View>

      <View className="px-5 pb-6 pt-2">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onRetake}
            style={{ flex: 2 }}
            className="py-4 rounded-2xl border border-white/15 items-center"
            activeOpacity={0.75}
          >
            <Text className="text-white/70 font-bold tracking-[2px] text-[12px]">RETAKE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSave()}
            style={{ flex: 3 }}
            className="py-4 rounded-2xl bg-white items-center"
            activeOpacity={0.85}
          >
            <Text className="text-black font-bold tracking-[2px] text-[12px]">SAVE COMPRESSED</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={fullscreen !== null} transparent animationType="fade">
        <View className="flex-1 bg-black">
          <Image
            source={{ uri: fullscreen === "original" ? originalPhoto.uri : compressedPhoto.uri }}
            style={{ flex: 1, width: "100%" }}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => setFullscreen(null)}
            className="absolute top-14 right-5"
            hitSlop={12}
          >
            <Ionicons name="close-circle" size={32} color="#ffffffcc" />
          </TouchableOpacity>

          <View className="absolute bottom-12 left-0 right-0 items-center gap-1">
            <Text className="text-white/50 text-[11px] tracking-[2px]">
              {fullscreen === "original" ? "ORIGINAL" : "COMPRESSED"}
            </Text>

            <Text className="text-white text-base font-medium">
              {fullscreen === "original" ? formatFileSize(originalPhotoSize) : formatFileSize(compressedPhoto.size)}
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Review;
