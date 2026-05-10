import { FC } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Props {
  message: string;
}

const LoadingOverlay: FC<Props> = ({ message }) => {
  return (
    <View style={StyleSheet.absoluteFillObject} className="bg-black items-center justify-center gap-5">
      <View className="w-[72px] h-[72px] rounded-full border-[3px] border-green-500/50 items-center justify-center">
        <ActivityIndicator color="#22c55e" size="large" />
      </View>

      <Text className="text-green-400 text-sm font-semibold tracking-[1.5px]">{message}</Text>
    </View>
  );
};

export default LoadingOverlay;
