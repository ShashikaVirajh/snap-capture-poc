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
};

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
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />

      <View className="mx-4 mt-4 flex-row bg-gray-200 rounded-2xl p-1 gap-1">
        <TouchableOpacity
          onPress={() => onTabChange("original")}
          className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === "original" ? "bg-blue-500" : ""}`}
        >
          <Text
            className={`text-sm font-semibold ${activeTab === "original" ? "text-white" : "text-gray-500"}`}
          >
            Original
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onTabChange("compressed")}
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
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
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
            {formatBytes(activeSize)}
          </Text>
        </View>
        {activeTab === "compressed" && (
          <>
            <View className="h-px bg-gray-100" />
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Saved</Text>
              <Text className="text-sm font-semibold text-green-600">
                {formatBytes(photoSize - compressed.size)} ({compressionRatio}%)
              </Text>
            </View>
          </>
        )}
      </View>

      <View className="mx-4 mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onRetake}
          className="flex-1 py-4 bg-gray-200 rounded-2xl items-center"
        >
          <Text className="text-base font-semibold text-gray-700">Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          className="flex-1 py-4 bg-blue-500 rounded-2xl items-center"
        >
          <Text className="text-base font-semibold text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default PhotoReviewScreen;