import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  onClose: () => void;
}

const CaptureHeader: FC<Props> = ({ onClose }) => {
  return (
    <SafeAreaView edges={["top"]} className="bg-black/55">
      <View className="flex-row items-center px-5 py-3.5">
        <View className="w-[22px]" />

        <View className="flex-1 items-center">
          <Text className="text-white text-[13px] font-bold tracking-[3px]">SURGICAL TRAY</Text>
          <Text className="text-white/45 text-[10px] tracking-[4px] mt-0.5">CAPTURE</Text>
        </View>

        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color="#ffffffbf" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CaptureHeader;
