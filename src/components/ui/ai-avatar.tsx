import { cn } from "@/lib/utils";
import LottieView from "lottie-react-native";
import * as React from "react";
import { View } from "react-native";

export interface AIAvatarProps {
  isSpeaking: boolean;
  size?: number;
  className?: string;
}

export function AIAvatar({ isSpeaking, size = 64, className }: AIAvatarProps) {
  const lottieRef = React.useRef<LottieView>(null);

  React.useEffect(() => {
    if (isSpeaking) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.pause();
    }
  }, [isSpeaking]);

  return (
    <View
      className={cn(
        "rounded-full bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-200 dark:border-blue-800 items-center justify-center overflow-hidden shadow-xs",
        className
      )}
      style={{ width: size, height: size }}
    >
      <LottieView
        ref={lottieRef}
        source={require("../../../assets/animations/ai-avatar.json")}
        style={{ width: size * 0.8, height: size * 0.8 }}
        loop
        autoPlay={isSpeaking}
      />
    </View>
  );
}
