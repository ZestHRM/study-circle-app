import { CreateSubjectScreen } from "@/components/subjects";
import { View } from "react-native";

export default function CreateSubjectRoute() {
  return (
    <View style={{ flex: 1 }} className="flex-1 bg-stone-50 dark:bg-stone-950">
      <CreateSubjectScreen />
    </View>
  );
}
