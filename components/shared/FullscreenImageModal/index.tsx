import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { TImageType } from "../../helpers/types";

interface Props {
  uri: string;
  label: TImageType;
  fileSize: string;
  onClose: () => void;
}

const FullscreenImageModal: FC<Props> = ({ uri, label, fileSize, onClose }) => {
  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 bg-black">
        <Image source={{ uri }} style={{ flex: 1, width: "100%" }} resizeMode="contain" />

        <TouchableOpacity onPress={onClose} className="absolute top-14 right-5" hitSlop={12}>
          <Ionicons name="close-circle" size={32} color="#ffffffcc" />
        </TouchableOpacity>

        <View className="absolute bottom-12 left-0 right-0 items-center gap-1">
          <Text className="text-white/50 text-[11px] tracking-[2px]">{label.toUpperCase()}</Text>
          <Text className="text-white text-base font-medium">{fileSize}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default FullscreenImageModal;
