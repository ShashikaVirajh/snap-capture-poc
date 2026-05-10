import { CameraCapturedPicture } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC, useState } from "react";
import { View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { TCompressedPhoto, TImageType } from "../../helpers/types";
import { formatFileSize } from "../../helpers/utils";
import FullscreenImageModal from "../shared/FullscreenImageModal";
import CaptureDetails from "./CaptureDetails";
import PhotoComparison from "./PhotoComparison";
import ReviewActions from "./ReviewActions";
import ReviewHeader from "./ReviewHeader";
import StorageSavedCard from "./StorageSavedCard";

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
  const [fullscreen, setFullscreen] = useState<TImageType | null>(null);

  const storageSavedPercent = ((1 - compressedPhoto.size / originalPhotoSize) * 100).toFixed(1);
  const photoAspectRatio = originalPhoto.width / originalPhoto.height;
  const savedBytes = originalPhotoSize - compressedPhoto.size;

  const handleFullscreenOpen = (type: TImageType): void => {
    setFullscreen(type);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      <ReviewHeader onClose={onClose} />

      <PhotoComparison
        originalUri={originalPhoto.uri}
        compressedUri={compressedPhoto.uri}
        aspectRatio={photoAspectRatio}
        onPress={handleFullscreenOpen}
      />

      <View className="px-5 py-0 flex-1 justify-center gap-6">
        <CaptureDetails
          originalPhoto={originalPhoto}
          compressedPhoto={compressedPhoto}
          originalPhotoSize={originalPhotoSize}
          capturedAt={capturedAt}
        />

        <StorageSavedCard savedBytes={savedBytes} storageSavedPercent={storageSavedPercent} />
      </View>

      <ReviewActions onRetake={onRetake} onSave={onSave} />

      {fullscreen !== null && (
        <FullscreenImageModal
          uri={fullscreen === "original" ? originalPhoto.uri : compressedPhoto.uri}
          label={fullscreen}
          fileSize={fullscreen === "original" ? formatFileSize(originalPhotoSize) : formatFileSize(compressedPhoto.size)}
          onClose={() => setFullscreen(null)}
        />
      )}

    </SafeAreaView>
  );
};

export default Review;
