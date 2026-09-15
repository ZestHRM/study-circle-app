import { Text, TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View, type ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  className?: string;
  onPress?: (e?: any) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Universal Card Primitive Component.
 * Supports static containers and interactive touch feedback when onPress is passed.
 * Enforces uniform background, border radius, borders, and shadows across all app cards.
 */
export function Card({
  className,
  onPress,
  disabled = false,
  children,
  ...props
}: CardProps) {
  const baseCardStyles = cn(
    "bg-card text-card-foreground border border-border rounded-2xl p-4 shadow-2xs",
    onPress && "active:opacity-95",
    className,
  );

  return (
    <TextClassContext.Provider value="text-foreground">
      {onPress ? (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          className={baseCardStyles}
          {...(props as any)}
        >
          {children}
        </Pressable>
      ) : (
        <View className={baseCardStyles} {...props}>
          {children}
        </View>
      )}
    </TextClassContext.Provider>
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn("flex-col gap-1.5 pb-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="h3"
      className={cn("font-bold text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="muted"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn("flex-col gap-2", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn("flex-row items-center justify-between pt-2 border-t border-border", className)}
      {...props}
    />
  );
}
