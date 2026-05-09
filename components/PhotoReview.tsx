import { Ionicons } from "@expo/vector-icons";
import { CameraCapturedPicture } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { CompressedPhoto } from "../helpers/types";
import { formatBytes, getFormat } from "../helpers/utils";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  photo: CameraCapturedPicture;
  compressed: CompressedPhoto;
  photoSize: number;
  capturedAt: Date | null;
  onSave: (type: "original" | "compressed") => void;
  onRetake: () => void;
  onClose: () => void;
}

const PhotoReviewScreen: FC<Props> = ({
  photo,
  compressed,
  photoSize,
  capturedAt,
  onSave,
  onRetake,
  onClose,
}) => {
  const [fullscreen, setFullscreen] = useState<"original" | "compressed" | null>(null);
  const compressionRatio = ((1 - compressed.size / photoSize) * 100).toFixed(1);
  const imageAspectRatio = photo.width / photo.height;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <View className="flex-1" />
        <Text className="text-white text-[13px] font-bold tracking-[3px]">CAPTURE SUMMARY</Text>
        <View className="flex-1 items-end">
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Side by side images ── */}
      <View className="flex-row gap-3 px-4">
        <TouchableOpacity className="flex-1 gap-2" activeOpacity={0.85} onPress={() => setFullscreen("original")}>
          <View style={{ aspectRatio: imageAspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }}>
            <Image source={{ uri: photo.uri }} style={{ flex: 1 }} resizeMode="cover" />
          </View>
          <View className="gap-0.5">
            <Text className="text-white/40 text-[10px] tracking-[1px]">ORIGINAL</Text>
            <Text className="text-white text-sm font-medium">{formatBytes(photoSize)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 gap-2" activeOpacity={0.85} onPress={() => setFullscreen("compressed")}>
          <View style={{ aspectRatio: imageAspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }}>
            <Image source={{ uri: compressed.uri }} style={{ flex: 1 }} resizeMode="cover" />
          </View>
          <View className="gap-0.5">
            <Text className="text-white/40 text-[10px] tracking-[1px]">COMPRESSED</Text>
            <Text className="text-white text-sm font-medium">{formatBytes(compressed.size)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Details + saved ── */}
      <View className="px-5 py-4 gap-3">
        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[11px] tracking-[1px]">RESOLUTION</Text>
            <Text className="text-white/70 text-base">{photo.width} × {photo.height}</Text>
          </View>
          <View className="flex-1 gap-1 items-end">
            <Text className="text-white/40 text-[11px] tracking-[1px]">FORMAT</Text>
            <Text className="text-white/70 text-base">{getFormat(compressed.uri)}</Text>
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-white/40 text-[11px] tracking-[1px]">CAPTURED</Text>
            <Text className="text-white/70 text-base">
              {capturedAt
                ? `${capturedAt.toLocaleDateString([], { day: "2-digit", month: "short" })} ${capturedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "—"}
            </Text>
          </View>
          <View className="flex-1 gap-1 items-end">
            <Text className="text-white/40 text-[11px] tracking-[1px]">STORAGE SAVED</Text>
            <Text className="text-green-400 text-base font-bold">
              {formatBytes(photoSize - compressed.size)} · {compressionRatio}%
            </Text>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View className="px-5 pb-6 pt-2 border-t border-white/8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onRetake}
            className="w-36 py-4 rounded-2xl border border-white/15 items-center"
            activeOpacity={0.75}
          >
            <Text className="text-white/70 font-bold tracking-[2px] text-[12px]">RETAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSave("compressed")}
            className="flex-1 py-4 rounded-2xl bg-white items-center"
            activeOpacity={0.85}
          >
            <Text className="text-black font-bold tracking-[2px] text-[12px]">SAVE COMPRESSED</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Fullscreen modal ── */}
      <Modal visible={fullscreen !== null} transparent animationType="fade">
        <View className="flex-1 bg-black">
          <Image
            source={{ uri: fullscreen === "original" ? photo.uri : compressed.uri }}
            style={{ flex: 1, width: "100%" }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setFullscreen(null)}
            className="absolute top-14 right-5"
            hitSlop={12}
          >
            <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View className="absolute bottom-12 left-0 right-0 items-center gap-1">
            <Text className="text-white/50 text-[11px] tracking-[2px]">
              {fullscreen === "original" ? "ORIGINAL" : "COMPRESSED"}
            </Text>
            <Text className="text-white text-base font-medium">
              {fullscreen === "original" ? formatBytes(photoSize) : formatBytes(compressed.size)}
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default PhotoReviewScreen;
