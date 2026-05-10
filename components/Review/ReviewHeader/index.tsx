import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onClose: () => void;
}

const ReviewHeader: FC<Props> = ({ onClose }) => {
  return (
    <View className="flex-row items-center px-5 pt-4 pb-3">
      <View className="flex-1" />
      <Text className="text-white text-[13px] font-bold tracking-[3px]">CAPTURE SUMMARY</Text>

      <View className="flex-1 items-end">
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color="#ffffffbf" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewHeader;
