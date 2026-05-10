import { FC } from "react";
import { Text, View } from "react-native";
import { formatFileSize } from "../../../helpers/utils";

interface Props {
  savedBytes: number;
  storageSavedPercent: string;
}

const StorageSavedCard: FC<Props> = ({ savedBytes, storageSavedPercent }) => {
  return (
    <View className="rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-4 flex-row items-end justify-between">
      <View className="gap-0.5">
        <Text className="text-green-400/60 text-[10px] font-bold tracking-[1px]">STORAGE SAVED</Text>
        <Text className="text-green-400 text-2xl font-bold">{formatFileSize(savedBytes)}</Text>
      </View>

      <View className="gap-0.5 items-end">
        <Text className="text-green-400/60 text-[10px] font-bold tracking-[1px]">REDUCTION</Text>
        <Text className="text-green-400 text-2xl font-bold">{storageSavedPercent}%</Text>
      </View>
    </View>
  );
};

export default StorageSavedCard;
