import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { APP_COLORS } from "@/constants/colors";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { getSectionMeta, parseNotesIntoSections } from "./notes-parser";

interface NotesTabProps {
  notesData: any;
  isLoading: boolean;
  isError: boolean;
  notesReady: boolean;
  failed: boolean;
  quizReady: boolean;
  title: string;
  subject: string;
  onReadNotes: () => void;
  onGoToQuiz: () => void;
  onRetry: () => void;
}

export const NotesTab = React.memo(function NotesTab({
  notesData,
  isLoading,
  isError,
  notesReady,
  failed,
  quizReady,
  title,
  subject,
  onReadNotes,
  onGoToQuiz,
  onRetry,
}: NotesTabProps) {
  const sections = React.useMemo(
    () => parseNotesIntoSections(notesData?.content ?? ""),
    [notesData?.content],
  );

  const statsItems = React.useMemo(
    () => [
      { icon: "layers", value: `${sections.length}`, label: "Topics" },
      { icon: "clock", value: `${Math.max(3, sections.length * 2)}m`, label: "Read time" },
      { icon: "check-circle", value: "100%", label: "Complete" },
    ],
    [sections.length],
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-white dark:bg-stone-950 items-center justify-center"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Spinner
          variant="primary"
          size="large"
          message="Loading AI Notes..."
          center
        />
      </View>
    );
  }

  if (failed && !notesReady) {
    return (
      <View
        className="flex-1 bg-white dark:bg-stone-950 items-center justify-center px-8 gap-5"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 items-center justify-center">
          <Icon name="alert-triangle" size={28} color={APP_COLORS.error} />
        </View>
        <Text variant="h3" className="text-center">
          Notes Generation Failed
        </Text>
        <Text variant="muted" className="text-center leading-6">
          AI couldn't process this file. Please delete and re-upload the
          document.
        </Text>
      </View>
    );
  }

  if (!notesReady) {
    return (
      <View
        className="flex-1 bg-white dark:bg-stone-950 items-center justify-center px-8 gap-5"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/40 items-center justify-center">
          <Icon name="cpu" size={28} color={APP_COLORS.quizBlue} />
        </View>
        <Text variant="h3" className="text-center">
          AI is generating your notes…
        </Text>
        <Text variant="muted" className="text-center leading-6">
          Our AI is reading and structuring your material into smart notes. This
          usually takes 1–2 minutes.
        </Text>
        <View
          className="w-full bg-blue-100 dark:bg-blue-950/40 rounded-full overflow-hidden"
          style={{ height: 8 }}
        >
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: "70%" }}
          />
        </View>
        <Text variant="primary" className="text-xs">
          Processing…
        </Text>
      </View>
    );
  }

  if (isError || !notesData?.content?.trim()) {
    return (
      <View
        className="flex-1 bg-white dark:bg-stone-950 items-center justify-center px-8 gap-4"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Icon name="wifi-off" size={32} color={APP_COLORS.stone400} />
        <Text variant="h3" className="text-center">
          Unable to Load Notes
        </Text>
        <Pressable
          onPress={onRetry}
          className="bg-stone-100 dark:bg-stone-800 rounded-2xl px-8 py-3 active:opacity-70"
        >
          <Text variant="subhead">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // ── Notes Ready — Creative Real Data View ──
  return (
    <View className="flex-1 bg-slate-50 dark:bg-stone-950" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View
          className="mx-4 mt-4 mb-3 rounded-3xl overflow-hidden"
          style={{ backgroundColor: APP_COLORS.quizBlueHover }}
        >
          {/* Decorative circles */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: 60,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          />

          <View className="p-5 gap-3">
            {/* Top row: badge + sparkle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                <Icon name="star" size={12} color="#FCD34D" />
                <Text variant="caption" className="text-white font-bold">
                  AI Generated
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text variant="caption" className="text-emerald-300 font-semibold">
                  Ready
                </Text>
              </View>
            </View>

            {/* Title */}
            <View>
              <Text
                variant="h2"
                className="text-white leading-tight"
                numberOfLines={2}
              >
                {notesData?.title || title}
              </Text>
              <Text variant="subhead" className="text-blue-200 mt-1">
                {notesData?.subjectName || subject} • {sections.length} topics
                covered
              </Text>
            </View>

            {/* Stats row */}
            <View className="flex-row gap-2 mt-1">
              {statsItems.map((s) => (
                <View
                  key={s.label}
                  className="flex-1 bg-white/10 rounded-2xl p-2.5 items-center gap-0.5"
                >
                  <Icon
                    name={s.icon as any}
                    size={13}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text variant="h4" className="text-white">
                    {s.value}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Read Notes Button */}
            <Pressable
              onPress={onReadNotes}
              className="bg-white rounded-2xl h-12 flex-row items-center justify-center gap-2 mt-1 active:opacity-85"
            >
              <Icon name="book-open" size={16} color="#1D4ED8" />
              <Text variant="primary" style={{ color: "#1D4ED8" }}>
                Read Full Notes
              </Text>
              <Icon name="arrow-right" size={14} color="#1D4ED8" />
            </Pressable>
          </View>
        </View>

        {/* ── Section Preview Label ── */}
        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text variant="caption" className="font-bold uppercase tracking-wider">
            Topics Covered
          </Text>
          <Pressable onPress={onReadNotes} className="active:opacity-70">
            <Text variant="primary" className="text-xs">
              Read All →
            </Text>
          </Pressable>
        </View>

        {/* ── Topics Preview Cards ── */}
        <View className="mx-4 gap-2">
          {sections.slice(0, 8).map((section) => {
            const meta = getSectionMeta(section.heading);
            return (
              <Pressable
                key={section.id}
                onPress={onReadNotes}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
              >
                {/* Numbered badge */}
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Icon name={meta.icon as any} size={16} color={meta.color} />
                </View>

                <View className="flex-1">
                  <Text variant="h4" numberOfLines={1}>
                    {section.heading}
                  </Text>
                  {section.bullets[0] ? (
                    <Text variant="caption" numberOfLines={1} className="mt-0.5">
                      {section.bullets[0]}
                    </Text>
                  ) : null}
                </View>

                <View className="flex-row items-center gap-1">
                  <Text variant="caption">
                    {section.bullets.length} points
                  </Text>
                  <Icon
                    name="chevron-right"
                    size={14}
                    color={APP_COLORS.stone300}
                  />
                </View>
              </Pressable>
            );
          })}

          {sections.length > 8 && (
            <Pressable
              onPress={onReadNotes}
              className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl py-3.5 items-center active:opacity-70"
            >
              <Text variant="primary" className="text-sm">
                +{sections.length - 8} more topics · Read Full Notes
              </Text>
            </Pressable>
          )}
        </View>

        {/* ── Quick stats footer ── */}
        {quizReady && (
          <View className="mx-4 mt-3 flex-row items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl px-4 py-3">
            <View className="w-8 h-8 rounded-xl bg-emerald-500 items-center justify-center">
              <Icon name="zap" size={15} color="#fff" />
            </View>
            <View className="flex-1">
              <Text variant="h4" className="text-emerald-800 dark:text-emerald-200">
                Quiz is ready!
              </Text>
              <Text variant="caption" className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                Practice what you just learned →
              </Text>
            </View>
            <Pressable
              onPress={onGoToQuiz}
              className="bg-emerald-500 rounded-xl px-3 py-1.5 active:opacity-80"
            >
              <Text variant="caption" className="text-white font-black">
                Take Quiz
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
});
