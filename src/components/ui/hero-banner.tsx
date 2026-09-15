import { Text } from "@/components/ui/text";
import * as React from "react";
import { Image, ImageSourcePropType, View } from "react-native";

export type HeroBannerPreset = "subjects" | "materials" | "notes";

export interface HeroBannerProps {
  /** Preset configuration for standard tab screens */
  preset?: HeroBannerPreset;
  /** Title text or custom React node */
  title?: React.ReactNode;
  /** Title highlighted suffix text */
  titleHighlight?: string;
  /** Subtitle text or custom React node */
  subtitle?: React.ReactNode;
  /** Image source override */
  image?: ImageSourcePropType;
  imageSource?: ImageSourcePropType;
  imageWidth?: number;
  imageHeight?: number;
  illustration?: React.ReactNode | null;
  hideIllustration?: boolean;
  /** Primary action element to render below header row (e.g. CTA Button) */
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const PRESET_CONFIGS: Record<
  HeroBannerPreset,
  { title: string; subtitle: string; imageSource: ImageSourcePropType }
> = {
  subjects: {
    title: "Your subjects",
    subtitle: "Organise your learning. Everything in one place.",
    imageSource: require("../../../assets/images/subjects-doodle.png"),
  },
  materials: {
    title: "Study materials",
    subtitle: "Upload your notes & PDFs to generate AI summaries and practice quizzes.",
    imageSource: require("../../../assets/images/student-study-hero.png"),
  },
  notes: {
    title: "Study notes",
    subtitle: "Review smart AI summaries & key concepts generated from your materials.",
    imageSource: require("../../../assets/images/subjects-doodle.png"),
  },
};

export const HeroBanner = React.memo(function HeroBanner({
  preset,
  title: propTitle,
  titleHighlight,
  subtitle: propSubtitle,
  image,
  imageSource: propImageSource,
  imageWidth = 135,
  imageHeight = 115,
  illustration,
  hideIllustration = false,
  action,
  children,
  className = "",
}: HeroBannerProps) {
  const presetConfig = preset ? PRESET_CONFIGS[preset] : null;

  const title = propTitle ?? presetConfig?.title ?? "";
  const subtitle = propSubtitle ?? presetConfig?.subtitle ?? "";
  const resolvedImage =
    image ??
    propImageSource ??
    presetConfig?.imageSource ??
    require("../../../assets/images/subjects-doodle.png");

  const shouldRenderIllustration = !hideIllustration && illustration !== null;

  return (
    <View className={`gap-3 py-1 ${className}`}>
      {/* Header Row: Title & Subtitle + Illustration */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2 gap-1 justify-center">
          {typeof title === "string" ? (
            <Text variant="h1">
              {title}
              {titleHighlight ? (
                <Text variant="primary">{titleHighlight}</Text>
              ) : null}
            </Text>
          ) : (
            title
          )}

          {typeof subtitle === "string" ? (
            <Text variant="muted" className="mt-0.5 leading-relaxed text-xs">
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

      {/* Optional Action Button Slot */}
      {action ? <View className="pt-0.5">{action}</View> : null}

      {/* Optional Children */}
      {children}
    </View>
  );
});
