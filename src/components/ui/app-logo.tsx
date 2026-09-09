import * as React from "react";
import { Image, View, type ImageStyle, type StyleProp } from "react-native";

export interface AppLogoProps {
  size?: number;
  className?: string;
  style?: StyleProp<ImageStyle>;
}

export const AppLogo = React.memo(function AppLogo({
  size = 40,
  className = "",
  style,
}: AppLogoProps) {
  return (
    <View
      className={`items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        source={require("../../../assets/images/logo.png")}
        style={[{ width: size * 0.85, height: size * 0.85 }, style]}
        resizeMode="contain"
      />
    </View>
  );
});
