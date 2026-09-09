import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { NoticeBox } from "@/components/ui/notice-box";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export interface Step4ReadyProps {
  materialTitle: string;
  subjectName: string;
  fileName?: string;
  isNotesReady?: boolean;
  isQuizReady?: boolean;
  onReadNotes: () => void;
  onTakeQuiz: () => void;
  onViewOriginalFile: () => void;
}

export const Step4Ready = React.memo(function Step4Ready({
  materialTitle,
  subjectName,
  fileName,
  isNotesReady = true,
  isQuizReady = false,
  onReadNotes,
  onTakeQuiz,
  onViewOriginalFile,
}: Step4ReadyProps) {
  return (
    <View className="gap-5">
      {/* Title Header */}
      <View className="gap-1">
        <Text variant="h1">Your notes are ready</Text>
        <Text variant="muted">
          Your study material has been processed successfully. Start learning
          now!
        </Text>
      </View>

      {/* Material Summary Card */}
      <Card className="rounded-3xl p-4 gap-3">
        <CardContent className="p-0 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 items-center justify-center border border-purple-200 dark:border-purple-800">
              <Icon name="book-open" size={18} color="primary" />
            </View>
            <View className="flex-1">
              <Text variant="caption">Subject</Text>
              <Text variant="subhead" numberOfLines={1}>
                {subjectName || "--"}
              </Text>
            </View>
            <Badge label={subjectName || "General"} variant="purple" />
          </View>

          <View className="h-px bg-stone-100 dark:bg-stone-800/80" />

          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 items-center justify-center border border-red-200 dark:border-red-900/50">
              <Icon name="file-text" size={18} color="error" />
            </View>
            <View className="flex-1">
              <Text variant="h3" numberOfLines={1}>
                {materialTitle || "Study Material"}
              </Text>
              <Text variant="caption" numberOfLines={1}>
                {fileName || "--"}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Notes Ready Green Banner */}
      <NoticeBox
        variant="success"
        title="Notes ready"
        message="Your notes, summaries and key points are ready to study."
      />

      {/* Read Notes Primary Action */}
      <Button
        variant="quiz"
        icon="book-open"
        title="Read notes"
        disabled={!isNotesReady}
        onPress={onReadNotes}
        className="w-full h-12 rounded-2xl justify-center items-center shadow-2xs"
      />

      {/* Quiz Upsell & Info Card */}
      <Card className="rounded-3xl p-4 gap-3 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
        <CardContent className="p-0 gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 items-center justify-center border border-amber-300 dark:border-amber-700">
                <Icon name="zap" size={18} color="terracotta" />
              </View>
              <View>
                <Text variant="subhead">Practice Quiz</Text>
              </View>
            </View>
            <Badge label="Gold Plan" variant="amber" icon="lock" />
          </View>

          <Text
            variant="caption"
            className="text-stone-600 dark:text-stone-300 leading-snug"
          >
            {isQuizReady
              ? "Your practice quiz is ready to test your knowledge!"
              : "AI practice quiz generated! Subscribe to the Gold plan to unlock the interactive quiz and practice set."}
          </Text>

          <Button
            variant="terracotta"
            icon={isQuizReady ? "arrow-right" : "lock"}
            iconPosition="right"
            title={isQuizReady ? "Take Quiz Now" : "Unlock Quiz (Gold Plan)"}
            onPress={onTakeQuiz}
            className="w-full h-11 rounded-2xl justify-center items-center mt-1"
          />
        </CardContent>
      </Card>

      {/* View Original File Secondary Action */}
      <Button
        variant="outline"
        icon="file"
        title="View original file"
        onPress={onViewOriginalFile}
        className="w-full h-11 rounded-2xl justify-center items-center"
      />
    </View>
  );
});
