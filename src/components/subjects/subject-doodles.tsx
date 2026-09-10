import { Text, View } from "react-native";

import { Image } from "react-native";

/**
 * Stack of books doodle PNG graphic
 * "DIFFERENT SUBJECTS BRIGHTER YOU"
 */
export function BooksDoodle() {
  return (
    <View className="items-center justify-center">
      <Image
        source={require("../../../assets/images/subjects-doodle.png")}
        style={{ width: 110, height: 110 }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Plant in a pot doodle PNG image
 * "ANOTHER SUBJECT ANOTHER STEP FORWARD"
 */
export function PlantDoodle() {
  return (
    <View className="items-center justify-center py-2">
      <Image
        source={require("../../../assets/images/create-subject-doodle.png")}
        style={{ width: 220, height: 110 }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Hand-drawn quote doodle for subject detail
 * "IDEAS EXPLAIN REALITY"
 */
export function IdeasDoodle() {
  return (
    <View className="bg-[#DCFCE7] px-2.5 py-1 rounded-lg rotate-2 border border-[#86EFAC]">
      <Text className="text-[10px] font-extrabold text-[#15803D] uppercase tracking-wider text-center">
        IDEAS{"\n"}EXPLAIN{"\n"}REALITY
      </Text>
    </View>
  );
}
