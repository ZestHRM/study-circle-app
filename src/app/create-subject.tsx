import { CreateSubjectScreen } from "@/components/subjects";
import { View } from "react-native";

export default function CreateSubjectRoute() {
  return (
    <View style={{ flex: 1 }} className="flex-1 bg-background">
      <CreateSubjectScreen />
    </View>
  );
}
