import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Alert } from "react-native";

interface MaterialsHeaderProps {
  onUploadPress: () => void;
}

export const MaterialsHeader = React.memo(function MaterialsHeader({
  onUploadPress,
}: MaterialsHeaderProps) {
  return (
    <ScreenHeader
      welcomeText="Welcome back"
      title="Study materials"
      extra={
        <>
          <Button
            variant="terracotta"
            icon="upload"
            title="Upload material"
            onPress={onUploadPress}
            className="flex-1 rounded-xl h-12"
          />
          <Button
            variant="outline"
            icon="book-open"
            title="Library"
            onPress={() =>
              Alert.alert("Coming Soon", "Library will be available soon.")
            }
            className="flex-1 rounded-xl h-12"
          />
        </>
      }
    >
      <Text variant="muted" className="font-semibold mt-1">
        Recent uploads
      </Text>
    </ScreenHeader>
  );
});
