import { APP_COLORS } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, Text as RNText } from "react-native";
import { Icon } from "./icon";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "group shrink-0 flex-row items-center justify-center gap-2 rounded-xl border-0 active:opacity-90",
  {
    variants: {
      variant: {
        default: "bg-primary active:bg-primary/90 shadow-2xs",
        terracotta: "bg-terracotta active:opacity-90 shadow-2xs",
        quiz: "bg-quiz-blue active:opacity-90 shadow-2xs",
        secondary: "bg-muted active:opacity-80",
        outline: "bg-card border border-border active:bg-muted shadow-2xs",
        ghost: "bg-transparent active:bg-muted shadow-none",
        destructive: "bg-destructive active:opacity-90 shadow-2xs",
        link: "bg-transparent shadow-none underline",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 px-3.5 py-1.5 rounded-lg",
        md: "h-11 px-4 py-2.5",
        lg: "h-13 px-6 py-3.5 rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-full items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-xs font-bold tracking-wide", {
  variants: {
    variant: {
      default: "text-white",
      terracotta: "text-white",
      quiz: "text-white",
      secondary: "text-secondary-foreground",
      outline: "text-foreground font-bold",
      ghost: "text-muted-foreground font-semibold",
      destructive: "text-white",
      link: "text-terracotta underline",
    },
    size: {
      default: "text-xs",
      sm: "text-[11px]",
      md: "text-xs",
      lg: "text-sm font-bold",
      icon: "text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    /** Explicit text label prop (alternative to children) */
    title?: string;
    /** Icon name */
    icon?: string;
    /** Icon position (left or right) */
    iconPosition?: "left" | "right";
    /** Icon size */
    iconSize?: number;
    /** Override icon color */
    iconColor?: string;
    /** Show ActivityIndicator loader spinner */
    loading?: boolean;
    /** Alias for loading */
    isLoading?: boolean;
    /** Optional text to display while loading */
    loadingText?: string;
    /** Extra Tailwind text classes */
    textClassName?: string;
  };

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      className,
      textClassName,
      variant = "default",
      size = "default",
      title,
      icon,
      iconPosition = "left",
      iconSize = 16,
      iconColor,
      loading = false,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const activeLoading = loading || isLoading;

    const resolvedIconColor = React.useMemo(() => {
      if (iconColor) return iconColor;
      if (
        variant === "terracotta" ||
        variant === "default" ||
        variant === "quiz" ||
        variant === "destructive"
      ) {
        return APP_COLORS.white;
      }
      if (variant === "outline" || variant === "secondary") {
        return APP_COLORS.stone500;
      }
      return APP_COLORS.primary;
    }, [iconColor, variant]);

    const labelContent =
      activeLoading && loadingText ? loadingText : title || children;

    const renderIcon = () => (
      <Icon name={icon!} size={iconSize} color={resolvedIconColor} />
    );

    return (
      <Pressable
        ref={ref}
        disabled={disabled || activeLoading}
        className={cn(
          (disabled || activeLoading) && "opacity-50",
          buttonVariants({ variant, size }),
          className,
        )}
        role="button"
        {...props}
      >
        {(state) => (
          <>
            {activeLoading ? (
              <Spinner size="small" color={resolvedIconColor} />
            ) : icon && iconPosition === "left" ? (
              renderIcon()
            ) : null}

            {typeof labelContent === "string" ||
            typeof labelContent === "number" ? (
              <RNText
                className={cn(
                  buttonTextVariants({ variant, size }),
                  textClassName,
                )}
              >
                {labelContent}
              </RNText>
            ) : typeof labelContent === "function" ? (
              (labelContent as any)(state)
            ) : (
              labelContent
            )}

            {!activeLoading && icon && iconPosition === "right"
              ? renderIcon()
              : null}
          </>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
