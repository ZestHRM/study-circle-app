import * as React from "react";
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

export interface SmartImageProps extends Omit<ImageProps, "source"> {
  uri?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
  loaderSize?: "small" | "large" | number;
  loaderColor?: string;
  onError?: () => void;
}

export const SmartImage = React.memo(function SmartImage({
  uri,
  style,
  containerStyle,
  loaderSize = "small",
  loaderColor = "#10B981",
  onError,
  onLoadStart,
  onLoadEnd,
  ...props
}: SmartImageProps) {
  const [loading, setLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setHasError(false);
  }, [uri]);

  if (!uri || hasError) {
    return null;
  }

  return (
    <View style={containerStyle} className="relative items-center justify-center overflow-hidden">
      <Image
        source={{ uri }}
        style={style}
        onLoadStart={() => {
          setLoading(true);
          onLoadStart?.();
        }}
        onLoadEnd={() => {
          setLoading(false);
          onLoadEnd?.();
        }}
        onError={() => {
          setLoading(false);
          setHasError(true);
          onError?.();
        }}
        resizeMode="cover"
        {...props}
      />
      {loading ? (
        <View className="absolute inset-0 items-center justify-center bg-black/5">
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      ) : null}
    </View>
  );
});

export default SmartImage;
