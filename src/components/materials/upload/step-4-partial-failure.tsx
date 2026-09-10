import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { PickedFileValues } from "@/schemas";
import * as React from "react";
import { View } from "react-native";
import { ScreenFooterBadge } from "./screen-footer-badge";
import { SubjectBannerCard } from "./subject-banner-card";

export interface Step4PartialFailureProps {
  displaySubject: string;
  displayTitle: string;
  displayFileName: string;
  file?: PickedFileValues | null;
  processingError?: string | null;
  onReupload?: () => void;
  onContinue: () => void;
}

export const Step4PartialFailure = React.memo(function Step4PartialFailure({
  displaySubject,
  displayTitle,
  displayFileName,
  file,
  processingError,
  onReupload,
  onContinue,
}: Step4PartialFailureProps) {
  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text variant="h2">We couldn't process one file</Text>
        <Text variant="muted">
          Don't worry — we've processed files and you can continue.
        </Text>
      </View>

      {/* Subject Banner Card */}
      <SubjectBannerCard subject={displaySubject} title={displayTitle} />

      {/* File Status Card List */}
      <View className="gap-3">
        <Card className="rounded-2xl p-4 border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 items-center justify-center">
              <Icon name="file-text" size="sm" color="error" />
            </View>
            <View className="flex-1">
              <Text variant="h4" numberOfLines={1}>
                {displayFileName}
              </Text>
              <Text variant="caption">
                {file?.size
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : "Document"}
              </Text>
            </View>
          </View>

          <Badge label="Failed" variant="destructive" icon="x" />
        </Card>
      </View>

      {/* Error Warning Callout */}
      <Card className="rounded-2xl p-4 border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/40 gap-2 flex-row items-start">
        <View className="w-8 h-8 rounded-xl bg-red-500/15 items-center justify-center mt-0.5">
          <Icon name="alert-triangle" size="sm" color="error" />
        </View>
        <View className="flex-1">
          <Text
            variant="caption"
            className="text-red-900 dark:text-red-200 font-semibold leading-relaxed"
          >
            {processingError ||
              "The document appears damaged or password-protected. Try opening it on your device to confirm it's not corrupted or protected by a password."}
          </Text>
        </View>
      </Card>

      {/* Recovery Action Buttons */}
      <View className="flex-row items-center gap-3">
        <Button
          variant="outline"
          icon="refresh-cw"
          title="Retry file"
          onPress={onReupload || (() => {})}
          className="flex-1 h-12 rounded-2xl justify-center items-center"
        />
        <Button
          variant="outline"
          icon="upload"
          title="Replace file"
          onPress={onReupload || (() => {})}
          className="flex-1 h-12 rounded-2xl justify-center items-center"
        />
      </View>

      {/* Primary Continue Button */}
      <Button
        variant="quiz"
        icon="arrow-right"
        iconPosition="right"
        title="Continue with processed files"
        onPress={onContinue}
        className="w-full h-13 rounded-2xl justify-center items-center shadow-md mt-1"
      />

      {/* Explanatory Caption Text */}
      <Text variant="muted" className="text-center px-2">
        We've saved your progress, and you can continue without this file. You
        can always add a different file later.
      </Text>

      {/* Footer Badge 4 */}
      <ScreenFooterBadge
        stepNum={4}
        title="Partial failure"
        subtitle="Recover and keep going"
      />
    </View>
  );
});
