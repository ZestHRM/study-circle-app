import * as React from 'react';
import { View, Text } from 'react-native';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function StepProgressBar({ currentStep, totalSteps, stepTitle }: StepProgressBarProps) {
  return (
    <View className="gap-2 pb-1">
      <Text className="text-xs font-semibold text-stone-600 dark:text-stone-300">
        Step {currentStep} of {totalSteps} · {stepTitle}
      </Text>

      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;

          return (
            <View
              key={index}
              className={`h-2 flex-1 rounded-full ${
                isActive ? 'bg-[#8B5CF6]' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
}
