import { Text } from "@/components/ui/text";
import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";

export interface AppLogoProps {
  size?: number;
  source?: ImageSourcePropType;
  className?: string;
  style?: StyleProp<ImageStyle>;
}

export const AppLogo = React.memo(function AppLogo({
  size = 42,
  source,
  className = "",
  style,
}: AppLogoProps) {
  return (
    <View
      className={`items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        source={source ?? require("../../../assets/images/icon.png")}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    </View>
  );
});

export interface AppHeaderBrandProps {
  logoSize?: number;
  textSize?: string;
  className?: string;
}

export const AppHeaderBrand = React.memo(function AppHeaderBrand({
  logoSize = 42,
  className = "",
}: AppHeaderBrandProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <AppLogo size={logoSize} />
      <Text variant="h2" className="font-extrabold">
        StudyCircle
        <Text variant="primary" className="font-black">
          AI
        </Text>
      </Text>
    </View>
  );
});
