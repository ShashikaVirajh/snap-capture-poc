import { styled } from "nativewind";
import { FC } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  deviceAligned: boolean;
  isCompressing: boolean;
  onCapture: () => void;
}

const CaptureButton: FC<Props> = ({ deviceAligned, isCompressing, onCapture }) => {
  return (
    <SafeAreaView edges={["bottom"]} className="absolute bottom-0 w-full bg-black/55">
      <View className="flex-row items-center justify-center px-10 pt-6 pb-3">
        <TouchableOpacity onPress={onCapture} disabled={!deviceAligned || isCompressing} activeOpacity={0.75}>
          <View className={`w-[78px] h-[78px] rounded-full border-[3px] items-center justify-center ${deviceAligned ? "border-white" : "border-white/25"}`}>
            <View className={`w-[62px] h-[62px] rounded-full ${deviceAligned ? "bg-white" : "bg-white/20"}`} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CaptureButton;
