import SmartImage from "@/components/SmartImage";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/utils/file-path";
import { useEffect, useState } from "react";
import { View } from "react-native";

export interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  className?: string; // used for outer sizing (e.g., w-8 h-8, etc.)
  fallbackClassName?: string;
  textClassName?: string;
}

export function Avatar({
  uri,
  name,
  className,
  fallbackClassName,
  textClassName,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [uri]);

  const initials = name
    ? name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  const resolvedUri =
    uri && uri.trim() !== "" && uri !== "null" ? getFileUrl(uri) : null;

  const showImage = resolvedUri && !imageError;

  if (showImage) {
    return (
      <View
        className={cn(
          "rounded-full overflow-hidden items-center justify-center bg-green-100",
          className,
        )}
      >
        <SmartImage
          uri={resolvedUri}
          style={{ width: "100%", height: "100%" }}
          containerStyle={{ width: "100%", height: "100%" }}
          loaderSize="small"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Otherwise, show initials
  return (
    <View
      className={cn(
        "items-center justify-center rounded-full bg-green-100",
        className,
        fallbackClassName,
      )}
    >
      <Text className={cn("font-semibold text-green-700", textClassName)}>
        {initials}
      </Text>
    </View>
  );
}

export default Avatar;
