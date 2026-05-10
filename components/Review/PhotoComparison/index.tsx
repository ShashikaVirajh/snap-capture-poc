import { FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { TImageType } from "../../../helpers/types";

interface Props {
  originalUri: string;
  compressedUri: string;
  aspectRatio: number;
  onPress: (type: TImageType) => void;
}

const PhotoComparison: FC<Props> = ({ originalUri, compressedUri, aspectRatio, onPress }) => {
  return (
    <>
      <View className="flex-row gap-3 px-4 mt-3">
        <TouchableOpacity
          style={{ flex: 1, aspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }}
          activeOpacity={0.85}
          onPress={() => onPress("original")}
        >
          <Image source={{ uri: originalUri }} style={{ flex: 1 }} resizeMode="cover" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, aspectRatio, borderRadius: 12, overflow: "hidden", backgroundColor: "#0d0d0d" }}
          activeOpacity={0.85}
          onPress={() => onPress("compressed")}
        >
          <Image source={{ uri: compressedUri }} style={{ flex: 1 }} resizeMode="cover" />
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 pt-3 pb-3 gap-3">
        <View className="flex-1 items-center">
          <Text className="text-blue-300/80 text-xs font-bold tracking-[2px]">ORIGINAL</Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-blue-300/80 text-xs font-bold tracking-[2px]">COMPRESSED</Text>
        </View>
      </View>
    </>
  );
};

export default PhotoComparison;
