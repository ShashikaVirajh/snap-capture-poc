import { FC } from "react";
import { Text, View } from "react-native";

interface Props {
  label: string;
}

const Chip: FC<Props> = ({ label }) => {
  return (
    <View className="px-3 py-1.5 rounded-full border border-white/10">
      <Text className="text-white/40 text-[10px] tracking-[1px]">{label}</Text>
    </View>
  );
};

export default Chip;
