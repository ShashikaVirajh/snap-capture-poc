import { CameraCapturedPicture, CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system/next";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import Capture from "../components/Capture";
import Landing from "../components/Landing";
import Review from "../components/Review";
import { TCompressedPhoto } from "../helpers/types";

const App = () => {
  // NOTE: Flat states kept intentionally for POC clarity. Group by usage in production.                              
  const [isCompressing, setIsCompressing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<CameraCapturedPicture | null>(null);
  const [originalPhotoSize, setOriginalPhotoSize] = useState<number | null>(null);
  const [compressedPhoto, setCompressedPhoto] = useState<TCompressedPhoto | null>(null);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async (): Promise<void> => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();

      if (!granted) {
        Alert.alert("Permission Required", "Allow camera access to capture images.");
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setIsCompressing(true);

    try {
      const captured = await cameraRef.current?.takePictureAsync({ quality: 1, imageType: "png" });

      if (!captured) {
        Alert.alert("Capture Failed", "Camera did not return an image. Please try again.");
        return;
      }

      setCapturedAt(new Date());

      const capturedSize = new File(captured.uri).size;
      setOriginalPhotoSize(capturedSize);

      const compressedResult = await ImageManipulator.manipulateAsync(captured.uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const compressedSize = new File(compressedResult.uri).size;

      setCompressedPhoto({
        uri: compressedResult.uri,
        width: compressedResult.width,
        height: compressedResult.height,
        size: compressedSize,
      });

      setOriginalPhoto(captured);
      setShowCamera(false);
    } catch {
      Alert.alert("Capture Failed", "Unable to take photo. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();

      if (!granted) {
        Alert.alert("Photos Access Required", "Please allow access to Photos in your device Settings to save images.");
        return;
      }
    }

    const compressedUri = compressedPhoto?.uri;

    if (!compressedUri) {
      Alert.alert("Save Failed", "No image available to save. Please retake the photo.");
      return;
    };

    try {
      await MediaLibrary.saveToLibraryAsync(compressedUri);
      Alert.alert("Save Success", "Compressed image has been saved to your Photos library.");
    } catch {
      Alert.alert("Save Failed", "Unable to save image. Please try again.");
    }
  };

  const handleRetake = (): void => {
    setOriginalPhoto(null);
    setOriginalPhotoSize(null);
    setCompressedPhoto(null);
    setCapturedAt(null);
    setShowCamera(true);
  };

  const handleCancelCamera = (): void => {
    setShowCamera(false);
  };

  const handleClose = (): void => {
    setOriginalPhoto(null);
    setOriginalPhotoSize(null);
    setCompressedPhoto(null);
    setCapturedAt(null);
    setShowCamera(false);
  };

  // Camera Section
  if (showCamera) {
    return (
      <Capture
        cameraRef={cameraRef}
        isCompressing={isCompressing}
        onCapture={handleCapture}
        onCancel={handleCancelCamera}
      />
    );
  }

  // Review Section
  if (originalPhoto && compressedPhoto && originalPhotoSize !== null) {
    return (
      <Review
        originalPhoto={originalPhoto}
        compressedPhoto={compressedPhoto}
        originalPhotoSize={originalPhotoSize}
        capturedAt={capturedAt}
        onSave={handleSave}
        onRetake={handleRetake}
        onClose={handleClose}
      />
    );
  }

  // Landing Section
  return <Landing onOpenCamera={handleOpenCamera} />;
}

export default App;