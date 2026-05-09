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
import { CompressedPhoto } from "../helpers/types";

const App = () => {
  // NOTE: Flat states kept intentionally for POC clarity. Group by usage in production.                              
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoSize, setPhotoSize] = useState<number | null>(null);
  const [compressed, setCompressed] = useState<CompressedPhoto | null>(null);
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

    setIsProcessing(true);

    try {
      const captured = await cameraRef.current?.takePictureAsync({ quality: 1, imageType: "png" });

      if (!captured) {
        Alert.alert("Capture Failed", "Camera did not return an image. Please try again.");
        return;
      }

      setCapturedAt(new Date());

      const originalSize = new File(captured.uri).size;
      setPhotoSize(originalSize);

      const compressedResult = await ImageManipulator.manipulateAsync(captured.uri, [], {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const compressedSize = new File(compressedResult.uri).size;

      setCompressed({
        uri: compressedResult.uri,
        width: compressedResult.width,
        height: compressedResult.height,
        size: compressedSize,
      });

      setPhoto(captured);
      setShowCamera(false);
    } catch {
      Alert.alert("Capture Failed", "Unable to take photo. Please try again.");
    } finally {
      setIsProcessing(false);
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

    const compressedPhoto = compressed?.uri;

    if (!compressedPhoto) {
      Alert.alert("Save Failed", "No image available to save. Please retake the photo.");
      return;
    };

    await MediaLibrary.saveToLibraryAsync(compressedPhoto);
    Alert.alert("Save Success", "Compressed image has been saved to your Photos library.");
  };

  const handleRetake = (): void => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setCapturedAt(null);
    setShowCamera(true);
  };

  const handleClose = (): void => {
    setPhoto(null);
    setPhotoSize(null);
    setCompressed(null);
    setCapturedAt(null);
    setShowCamera(false);
  };

  // Camera Section
  if (showCamera) {
    return (
      <Capture
        cameraRef={cameraRef}
        isProcessing={isProcessing}
        onCapture={handleCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  // Review Section
  if (photo && compressed && photoSize !== null) {
    return (
      <Review
        photo={photo}
        compressed={compressed}
        photoSize={photoSize}
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