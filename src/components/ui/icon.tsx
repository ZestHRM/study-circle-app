import { TextClassContext } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
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
  name?: string;
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

function getLucideIcon(name?: string): LucideIcon {
  if (!name) return LucideIcons.HelpCircle;

  const customMap: Record<string, LucideIcon> = {
    "flask-outline": LucideIcons.FlaskConical,
    flask: LucideIcons.FlaskConical,
    "book-open-variant": LucideIcons.BookOpen,
    "book-variant": LucideIcons.Book,
    "cog-outline": LucideIcons.Settings,
    cog: LucideIcons.Settings,
    leaf: LucideIcons.Leaf,
    "upload-cloud": LucideIcons.UploadCloud,
    "check-square": LucideIcons.CheckSquare,
    "help-circle": LucideIcons.HelpCircle,
    "bar-chart-2": LucideIcons.BarChart2,
    "arrow-right": LucideIcons.ArrowRight,
    "arrow-left": LucideIcons.ArrowLeft,
    "chevron-down": LucideIcons.ChevronDown,
    "chevron-right": LucideIcons.ChevronRight,
    "chevron-left": LucideIcons.ChevronLeft,
    plus: LucideIcons.Plus,
    check: LucideIcons.Check,
    calendar: LucideIcons.Calendar,
    file: LucideIcons.FileText,
    "file-text": LucideIcons.FileText,
    book: LucideIcons.Book,
    feather: LucideIcons.Feather,
    zap: LucideIcons.Zap,
    lock: LucideIcons.Lock,
    mail: LucideIcons.Mail,
    user: LucideIcons.User,
    eye: LucideIcons.Eye,
    "eye-off": LucideIcons.EyeOff,
    search: LucideIcons.Search,
    filter: LucideIcons.Filter,
    trash: LucideIcons.Trash2,
    "trash-2": LucideIcons.Trash2,
    edit: LucideIcons.Edit3,
    share: LucideIcons.Share2,
  };

  if (customMap[name]) return customMap[name];

  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const foundIcon = (LucideIcons as Record<string, any>)[pascalName];
  if (foundIcon) return foundIcon;

  return LucideIcons.HelpCircle;
}

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

  const TargetIcon = IconComponent || getLucideIcon(name);

  const iconSize = typeof size === "number" ? size : SIZE_MAP[size] ?? 20;
  const iconColor = color
    ? COLOR_MAP[color as IconColorPreset] ?? color
    : APP_COLORS.stone900;

  return (
    <StyledLucideIcon
      as={TargetIcon}
      size={iconSize}
      color={iconColor}
      style={style}
      className={cn("text-foreground", textClass, className)}
      {...props}
    />
  );
});
