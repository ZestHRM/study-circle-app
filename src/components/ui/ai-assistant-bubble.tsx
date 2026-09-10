import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, View } from "react-native";

export interface AIAssistantBubbleProps {
  currentStep: number;
  totalSteps?: number;
  title?: string;
  prompt: string;
  onBack?: () => void;
  className?: string;
}

export function AIAssistantBubble({
  currentStep,
  totalSteps = 5,
  title = "AI Study Assistant",
  prompt,
  onBack,
  className,
}: AIAssistantBubbleProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStep / totalSteps) * 100)
  );

  return (
    <View className={cn("gap-3 w-full", className)}>
      {/* Top Header Row: Back button & Step progress text */}
      <View className="flex-row items-center justify-between min-h-[32px]">
        {currentStep > 1 && onBack ? (
          <Pressable
            onPress={onBack}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 active:opacity-70"
          >
            <Icon name="chevron-left" size={16} color="muted" />
            <Text className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Back
            </Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
            <Icon name="zap" size={12} color="primary" />
            <Text className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              AI Onboarding
            </Text>
          </View>
        )}

        <View className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <Text className="text-xs font-bold text-stone-600 dark:text-stone-300">
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Animated Step Progress Bar */}
      <View className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* AI Bot Avatar & Conversational Speech Bubble */}
      <View className="flex-row items-start gap-3 mt-1">
        {/* Glowing AI Avatar Badge */}
        <View className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 items-center justify-center shadow-sm shrink-0 mt-0.5">
          <Icon name="cpu" size={20} color="white" />
        </View>

        {/* Speech Bubble Box */}
        <View className="flex-1 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 p-3.5 rounded-2xl rounded-tl-sm gap-1">
          <Text className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            {title}
          </Text>
          <Text className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
            {prompt}
          </Text>
        </View>
      </View>
    </View>
  );
}
