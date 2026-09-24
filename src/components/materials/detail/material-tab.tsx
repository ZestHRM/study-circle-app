import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  isFailed,
  isNotesReady,
  isQuizReady,
} from "@/lib/utils/material-status";
import { showErrorToast, showInfoToast } from "@/lib/utils/toast";
import type { StudyMaterial } from "@/services";
import * as React from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";

interface MaterialTabProps {
  material: StudyMaterial | null;
}

function MRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
        <Icon name={icon as any} size={14} color="muted" />
      </View>
      <Text variant="caption" style={{ width: 72 }}>
        {label}
      </Text>
      <Text variant="subhead" className="flex-1">
        {value}
      </Text>
    </View>
  );
}

function AiStatusRow({
  icon,
  label,
  ready,
  failed,
}: {
  icon: string;
  label: string;
  ready: boolean;
  failed: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <View className="flex-row items-center gap-2.5">
        <Icon name={icon as any} size={15} color="muted" />
        <Text variant="h4">{label}</Text>
      </View>
      {failed ? (
        <Badge label="Failed" variant="destructive" icon="alert-circle" />
      ) : ready ? (
        <Badge label="Generated ✓" variant="emerald" icon="check" />
      ) : (
        <Badge label="Processing..." variant="amber" icon="clock" />
      )}
    </View>
  );
}

export const MaterialTab = React.memo(function MaterialTab({
  material,
}: MaterialTabProps) {
  if (!material) return null;
  const file = material.files?.[0];
  const fileLabel = file?.fileName
    ? decodeURIComponent(file.fileName)
    : material.title;
  const fileUrl = file?.url;
  const extractedContent = file?.content?.trim();

  const fileExt = fileLabel.split(".").pop()?.toUpperCase() ?? "FILE";
  const isPdf = fileExt === "PDF";
  const isImage = ["PNG", "JPG", "JPEG", "WEBP"].includes(fileExt);

  const handleOpenFile = React.useCallback(async () => {
    if (!fileUrl) {
      showInfoToast("No Link", "File URL is not available.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        await Linking.openURL(fileUrl);
      }
    } catch {
      showErrorToast("Error", "Could not open uploaded file.");
    }
  }, [fileUrl]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Main Uploaded File Card ── */}
      <View className="bg-card rounded-2xl border border-border p-4 gap-4 shadow-xs">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center ${
              isPdf
                ? "bg-red-50 dark:bg-red-950/40"
                : isImage
                  ? "bg-primary/10"
                  : "bg-warning-bg"
            }`}
          >
            <Text
              variant="caption"
              className={`font-black tracking-wider ${
                isPdf
                  ? "text-destructive"
                  : isImage
                    ? "text-primary"
                    : "text-warning-dark"
              }`}
            >
              {fileExt}
            </Text>
          </View>
          <View className="flex-1">
            <Text variant="h3" numberOfLines={2}>
              {material.title}
            </Text>
            <Text variant="caption" className="mt-0.5" numberOfLines={1}>
              {fileLabel}
            </Text>
          </View>
        </View>

        <View className="h-px bg-border" />

        {/* Details Rows */}
        <View className="gap-3">
          <MRow
            icon="tag"
            label="Subject"
            value={material.subject?.name ?? "General"}
          />
          <MRow
            icon="calendar"
            label="Uploaded On"
            value={new Date(material.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          {file?.size ? (
            <MRow
              icon="hard-drive"
              label="File Size"
              value={`${(file.size / (1024 * 1024)).toFixed(1)} MB`}
            />
          ) : null}
          {file ? (
            <MRow
              icon="file-text"
              label="Format"
              value={(file as any).mimeType ?? fileExt}
            />
          ) : null}
        </View>

        {/* View / Download Action Button */}
        {fileUrl ? (
          <Pressable
            onPress={handleOpenFile}
            className="w-full bg-primary rounded-xl py-3 flex-row items-center justify-center gap-2 active:opacity-85 mt-1"
          >
            <Icon name="file-text" size={16} color="white" />
            <Text variant="subhead" className="text-white font-bold">
              Open Uploaded File →
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ── Extracted Document Content Preview ── */}
      {extractedContent ? (
        <View className="bg-card rounded-2xl border border-border p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="align-left" size={15} color="muted" />
              <Text
                variant="caption"
                className="font-bold uppercase tracking-wider"
              >
                Extracted Document Text
              </Text>
            </View>
          </View>
          <View className="bg-background rounded-xl p-3.5 border border-border max-h-60">
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
              <Text variant="caption" className="leading-relaxed">
                {extractedContent}
              </Text>
            </ScrollView>
          </View>
        </View>
      ) : null}

      {/* ── AI Generation Status ── */}
      <View className="bg-card rounded-2xl border border-border overflow-hidden">
        <View className="px-4 pt-4 pb-2">
          <Text
            variant="caption"
            className="font-bold uppercase tracking-wider"
          >
            AI Processing Status
          </Text>
        </View>
        <AiStatusRow
          icon="file-text"
          label="AI Notes"
          ready={isNotesReady(material)}
          failed={isFailed(material)}
        />
        <View className="h-px bg-border mx-4" />
        <AiStatusRow
          icon="zap"
          label="Practice Quiz"
          ready={isQuizReady(material)}
          failed={
            material.quizStatus === "GENERATION_FAILED" ||
            material.files?.[0]?.quizStatus === "GENERATION_FAILED"
          }
        />
      </View>
    </ScrollView>
  );
});
