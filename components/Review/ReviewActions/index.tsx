import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onRetake: () => void;
  onSave: () => void;
}

const ReviewActions: FC<Props> = ({ onRetake, onSave }) => {
  return (
    <View className="px-5 pb-6 pt-2">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onRetake}
          style={{ flex: 2 }}
          className="py-4 rounded-2xl border border-white/15 items-center"
          activeOpacity={0.75}
        >
          <Text className="text-white/70 font-bold tracking-[2px] text-[12px]">RETAKE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSave}
          style={{ flex: 3 }}
          className="py-4 rounded-2xl bg-white items-center"
          activeOpacity={0.85}
        >
          <Text className="text-black font-bold tracking-[2px] text-[12px]">SAVE COMPRESSED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewActions;
