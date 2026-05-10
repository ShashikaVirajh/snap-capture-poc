import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isPitchAligned, isRollAligned } from "../../../helpers/utils";

interface Props {
  pitch: number;
  roll: number;
  deviceAligned: boolean;
}

const AlignmentControls: FC<Props> = ({ pitch, roll, deviceAligned }) => {
  const bracketColor = deviceAligned ? "border-green-500" : "border-red-500";

  return (
    <>
      <View className="flex-row items-center justify-between px-10 mt-1">
        <View className="items-center w-14">
          <Text className="text-white/45 text-[11px] font-bold tracking-[1.5px] mb-1">PITCH</Text>
          <Text className={`text-2xl font-light ${isPitchAligned(pitch) ? "text-green-400" : "text-red-400"}`}>
            {Math.round(Math.abs(pitch))}°
          </Text>
        </View>

        <View className={`px-4 py-2 rounded-full ${deviceAligned ? "bg-green-500/85" : "bg-red-500/85"}`}>
          <Text className="text-white text-[11px] font-bold tracking-[1.5px]">
            {deviceAligned ? "READY TO CAPTURE" : "ALIGN CAMERA"}
          </Text>
        </View>

        <View className="items-center w-14">
          <Text className="text-white/45 text-[11px] font-bold tracking-[1.5px] mb-1">ROLL</Text>
          <Text className={`text-2xl font-light ${isRollAligned(roll) ? "text-green-400" : "text-red-400"}`}>
            {Math.round(Math.abs(roll))}°
          </Text>
        </View>
      </View>

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View className={`absolute w-8 h-8 top-[22%] left-[12%] border-t-[3px] border-l-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 top-[22%] right-[12%] border-t-[3px] border-r-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 bottom-[15%] left-[12%] border-b-[3px] border-l-[3px] ${bracketColor}`} />
        <View className={`absolute w-8 h-8 bottom-[15%] right-[12%] border-b-[3px] border-r-[3px] ${bracketColor}`} />
        <View style={{ position: "absolute", top: "50%", left: "50%", width: 18, height: StyleSheet.hairlineWidth, marginLeft: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
        <View style={{ position: "absolute", top: "50%", left: "50%", width: StyleSheet.hairlineWidth, height: 18, marginTop: -9, backgroundColor: "rgba(255,255,255,0.4)" }} />
      </View>
    </>
  );
};

export default AlignmentControls;
