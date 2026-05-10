import { CameraCapturedPicture } from "expo-camera";
import { FC } from "react";
import { Text, View } from "react-native";
import { TCompressedPhoto } from "../../../helpers/types";
import { formatFileSize, getImageFormat } from "../../../helpers/utils";

interface Props {
  originalPhoto: CameraCapturedPicture;
  compressedPhoto: TCompressedPhoto;
  originalPhotoSize: number;
  capturedAt: Date | null;
}

const CaptureDetails: FC<Props> = ({ originalPhoto, compressedPhoto, originalPhotoSize, capturedAt }) => {
  return (
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
  );
};

export default CaptureDetails;
