import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface Props {
  onOpenCamera: () => void;
}

const Landing: FC<Props> = ({ onOpenCamera }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar style="light" />

      <View className="flex-1 items-center justify-center px-6 gap-10">
        <Ionicons name="scan-outline" size={96} color="#ffffff99" />

        <View className="items-center gap-1">
          <Text className="text-white text-[32px] font-bold tracking-[6px]">SURGICAL</Text>
          <Text className="text-white text-[32px] font-bold tracking-[6px]">TRAY</Text>

          <View className="flex-row items-center gap-3 mt-2">
            <View className="h-px w-8 bg-white/20" />
            <Text className="text-white/40 text-[11px] tracking-[6px]">CAPTURE</Text>
            <View className="h-px w-8 bg-white/20" />
          </View>
        </View>

        <Text className="text-white/40 text-sm text-center leading-6 px-4">
          Position the camera directly above the surgical tray for a precise top-down capture.
        </Text>

        <View className="flex-row gap-2">
          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">ALIGNMENT</Text>
          </View>

          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">COMPRESSION</Text>
          </View>

          <View className="px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white/40 text-[10px] tracking-[1px]">HAPTICS</Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={onOpenCamera}
          className="w-full bg-white rounded-2xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-black font-bold tracking-[3px] text-sm">OPEN CAMERA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Landing;
