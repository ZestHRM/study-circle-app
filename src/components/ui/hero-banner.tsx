import { Text } from "@/components/ui/text";
import * as React from "react";
import { Image, ImageSourcePropType, View } from "react-native";

export interface HeroBannerProps {
  title: React.ReactNode;
  titleHighlight?: string;
  subtitle?: React.ReactNode;
  image?: ImageSourcePropType;
  imageSource?: ImageSourcePropType;
  imageWidth?: number;
  imageHeight?: number;
  illustration?: React.ReactNode | null;
  hideIllustration?: boolean;
  className?: string;
}

export const HeroBanner = React.memo(function HeroBanner({
  title,
  titleHighlight,
  subtitle,
  image,
  imageSource,
  imageWidth = 155,
  imageHeight = 130,
  illustration,
  hideIllustration = false,
  className = "",
}: HeroBannerProps) {
  const resolvedImage =
    image ?? imageSource ?? require("../../../assets/images/subjects-doodle.png");
  const shouldRenderIllustration =
    !hideIllustration && illustration !== null;

  return (
    <View className={`flex-row items-center justify-between py-2 ${className}`}>
      <View className="flex-1 pr-2 gap-1 justify-center">
        {typeof title === "string" ? (
          <Text variant="h1">
            {title}
            {titleHighlight ? (
              <Text variant="primary">
                {titleHighlight}
              </Text>
            ) : null}
          </Text>
        ) : (
          title
        )}

        {typeof subtitle === "string" ? (
          <Text variant="muted" className="mt-1 leading-relaxed">
            {subtitle}
          </Text>
        ) : (
          subtitle
        )}
      </View>

      {shouldRenderIllustration && (
        <View className="items-end justify-center">
          {illustration ?? (
            <Image
              source={resolvedImage}
              style={{ width: imageWidth, height: imageHeight }}
              resizeMode="contain"
            />
          )}
        </View>
      )}
    </View>
  );
});
