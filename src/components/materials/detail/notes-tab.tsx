import { ErrorState, Icon, Spinner, Text } from "@/components/ui";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { getSectionMeta, parseNotesIntoSections } from "./notes-parser";
interface NotesTabProps {
  notesData: any;
  isLoading: boolean;
  isError: boolean;
  notesReady: boolean;
  failed: boolean;
  title: string;
  subject: string;
  onReadNotes: () => void;
  onRetry: () => void;
}

export const NotesTab = React.memo(function NotesTab({
  notesData,
  isLoading,
  isError,
  notesReady,
  failed,
  title,
  subject,
  onReadNotes,
  onRetry,
}: NotesTabProps) {
  const sections = React.useMemo(() => {
    const parsed = parseNotesIntoSections(notesData?.content ?? "");
    if (parsed.length > 0) return parsed;
    const t = title?.trim() || "Study Material";
    return [
      {
        id: "s-1",
        heading: `Overview of ${t}`,
        bullets: [`Key concepts and summary for ${t}`],
      },
      {
        id: "s-2",
        heading: "Core Topics & Principles",
        bullets: [`Main formulas, rules and structure of ${t}`],
      },
      {
        id: "s-3",
        heading: "Important Exam Points",
        bullets: ["Revision notes and key takeaways"],
      },
    ];
  }, [notesData?.content, title]);

  const statsItems = React.useMemo(
    () => [
      { icon: "layers", value: `${sections.length}`, label: "Topics" },
      {
        icon: "clock",
        value: `${Math.max(3, sections.length * 2)}m`,
        label: "Read time",
      },
    ],
    [sections.length],
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
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

  if (failed) {
    return (
      <ErrorState
        icon="alert-triangle"
        title="Notes Generation Failed"
        description={
          notesData?.errorMessage ||
          "AI couldn't process this file. Please delete and re-upload the document."
        }
      />
    );
  }

  if (!notesReady) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8 gap-5"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
          <Icon name="cpu" size={28} color="primary" />
        </View>
        <Text variant="h3" className="text-center font-bold">
          AI is generating your notes…
        </Text>
        <Text variant="muted" className="text-center leading-6">
          Our AI is reading and structuring your material into smart notes. This
          usually takes 1–2 minutes.
        </Text>
        <View
          className="w-full bg-muted rounded-full overflow-hidden"
          style={{ height: 8 }}
        >
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: "70%" }}
          />
        </View>
        <Text variant="primary" className="text-xs font-bold">
          Processing…
        </Text>
      </View>
    );
  }

  if (isError && !notesData?.content?.trim()) {
    return (
      <ErrorState
        variant="neutral"
        icon="wifi-off"
        title="Unable to Load Notes"
        description="Please check your connection and try again."
        actionLabel="Retry"
        actionIcon="rotate-ccw"
        actionVariant="outline"
        onAction={onRetry}
      />
    );
  }

  // ── Notes Ready — Creative Real Data View ──
  return (
    <View className="flex-1 bg-background" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View className="mx-4 mt-4 mb-3 rounded-3xl overflow-hidden bg-primary shadow-xs">
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
                <Icon name="star" size={12} color="warning" />
                <Text variant="caption" className="text-white font-bold">
                  AI Generated
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text
                  variant="caption"
                  className="text-emerald-300 font-semibold"
                >
                  Ready
                </Text>
              </View>
            </View>

            {/* Title */}
            <View>
              <Text
                variant="h2"
                className="text-white leading-tight font-extrabold"
                numberOfLines={2}
              >
                {notesData?.title || title}
              </Text>
              <Text variant="subhead" className="text-white/80 mt-1">
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
                  <Icon name={s.icon as any} size={13} color="white" />
                  <Text variant="h4" className="text-white">
                    {s.value}
                  </Text>
                  <Text variant="caption" className="text-white/70 text-[9px]">
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Read Notes Button */}
            <Pressable
              onPress={onReadNotes}
              className="bg-card rounded-2xl h-12 flex-row items-center justify-center gap-2 mt-1 active:opacity-85"
            >
              <Icon name="book-open" size={16} color="primary" />
              <Text variant="primary" className="font-bold">
                Read Full Notes
              </Text>
              <Icon name="arrow-right" size={14} color="primary" />
            </Pressable>
          </View>
        </View>

        {/* ── Section Preview Label ── */}
        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text
            variant="caption"
            className="font-bold uppercase tracking-wider"
          >
            Topics Covered
          </Text>
          <Pressable onPress={onReadNotes} className="active:opacity-70">
            <Text variant="primary" className="text-xs font-bold">
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
                className="bg-card rounded-2xl border border-border flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
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
                    <Text
                      variant="caption"
                      numberOfLines={1}
                      className="mt-0.5"
                    >
                      {section.bullets[0]}
                    </Text>
                  ) : null}
                </View>

                <View className="flex-row items-center gap-1">
                  <Text variant="caption">{section.bullets.length} points</Text>
                  <Icon name="chevron-right" size={14} color="muted" />
                </View>
              </Pressable>
            );
          })}

          {sections.length > 8 && (
            <Pressable
              onPress={onReadNotes}
              className="bg-primary/10 border border-primary/20 rounded-2xl py-3.5 items-center active:opacity-70"
            >
              <Text variant="primary" className="text-sm font-bold">
                +{sections.length - 8} more topics · Read Full Notes
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
});
