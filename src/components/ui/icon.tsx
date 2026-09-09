import { TextClassContext } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import * as React from "react";
import type { TextStyle, ViewStyle } from "react-native";
import { withUniwind } from "uniwind";

export type IconSizePreset = "xs" | "sm" | "md" | "lg" | "xl";
export type IconColorPreset =
  | "primary"
  | "terracotta"
  | "quiz"
  | "white"
  | "black"
  | "dark"
  | "muted"
  | "success"
  | "warning"
  | "error";

export interface IconProps extends Omit<LucideProps, "size" | "color"> {
  as?: LucideIcon;
  name?: keyof typeof Feather.glyphMap;
  size?: IconSizePreset | number;
  color?: IconColorPreset | string;
  style?: TextStyle | ViewStyle | any;
  className?: string;
}

const SIZE_MAP: Record<IconSizePreset, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const COLOR_MAP: Record<IconColorPreset, string> = {
  primary: APP_COLORS.primary,
  terracotta: APP_COLORS.terracotta,
  quiz: APP_COLORS.quizBlue,
  white: APP_COLORS.white,
  black: APP_COLORS.black,
  dark: APP_COLORS.stone900,
  muted: APP_COLORS.stone500,
  success: APP_COLORS.success,
  warning: APP_COLORS.warning,
  error: APP_COLORS.error,
};

function LucideIconImpl({ as: IconComponent, ...props }: any) {
  return <IconComponent {...props} />;
}

const StyledLucideIcon = withUniwind(LucideIconImpl, {
  size: {
    fromClassName: "className",
    styleProperty: "width",
  },
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
});

export const Icon = React.memo(function Icon({
  as: IconComponent,
  name,
  size = "md",
  color,
  className,
  style,
  ...props
}: IconProps) {
  const textClass = React.useContext(TextClassContext);

  if (IconComponent) {
    return (
      <StyledLucideIcon
        as={IconComponent}
        className={cn("text-foreground size-5", textClass, className)}
        {...props}
      />
    );
  }

  const iconSize = typeof size === "number" ? size : SIZE_MAP[size] ?? 20;
  const iconColor = color
    ? COLOR_MAP[color as IconColorPreset] ?? color
    : APP_COLORS.stone900;

  return (
    <Feather
      name={name || "help-circle"}
      size={iconSize}
      color={iconColor}
      style={style}
      className={className}
    />
  );
});
