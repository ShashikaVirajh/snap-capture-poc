import { CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { FC, RefObject, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getLargestPictureSize, getPitch, getRoll, isDeviceAligned } from "../../helpers/utils";
import LoadingOverlay from "../shared/LoadingOverlay";
import AlignmentControls from "./AlignmentControls";
import CaptureButton from "./CaptureButton";
import CaptureHeader from "./CaptureHeader";
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

      <CaptureHeader onCancel={onCancel} />

      {!isCompressing && <AlignmentControls pitch={pitch} roll={roll} deviceAligned={deviceAligned} />}

      <CaptureButton deviceAligned={deviceAligned} isCompressing={isCompressing} onCapture={onCapture} />

      {isCompressing && <LoadingOverlay message="Compressing image…" />}

    </View>
  );
};

export default Capture;
