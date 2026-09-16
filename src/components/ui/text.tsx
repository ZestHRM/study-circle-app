import { cn } from "@/lib/utils";
import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Text as RNText, type Role } from "react-native";

const textVariants = cva(
  cn(
    "text-foreground text-base",
    Platform.select({
      web: "select-text",
    }),
  ),
  {
    variants: {
      variant: {
        default: "text-foreground",
        h1: "text-foreground text-3xl font-extrabold",
        h2: "text-foreground text-xl font-bold",
        h3: "text-foreground text-base font-semibold",
        h4: "text-foreground text-sm font-semibold",
        muted: "text-muted-foreground text-xs font-medium",
        subhead: "text-foreground/80 text-xs font-semibold",
        caption: "text-muted-foreground text-xs",
        primary: "text-primary font-bold",
        terracotta: "text-[#D95B38] font-bold",
        success: "text-[#047857] dark:text-[#34D399] font-semibold",
        error: "text-destructive font-medium text-xs",
        p: "text-foreground/90 text-sm leading-6",
        large: "text-lg font-semibold text-foreground",
        small: "text-xs font-medium text-muted-foreground",
        code: "bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps["variant"]>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  code: Platform.select({ web: "code" as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
