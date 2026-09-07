import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_COLORS } from '@/constants/colors';
import type { StudyMaterial } from '@/services';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, View } from 'react-native';

interface MaterialCardProps {
  material: StudyMaterial;
  onReadNotes: (material: StudyMaterial) => void;
  onTakeQuiz: (material: StudyMaterial) => void;
  onDelete: (material: StudyMaterial) => void;
  isDeleting?: boolean;
}

function formatShortDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function isNotesReady(material: StudyMaterial): boolean {
  return (
    material.status === 'PROCESSED' ||
    material.status === 'NOTES_GENERATED' ||
    material.files?.some((f) => f.status === 'NOTES_GENERATED' || f.status === 'PROCESSED')
  );
}

function isQuizReady(material: StudyMaterial): boolean {
  return (
    material.quizStatus === 'GENERATED' ||
    material.files?.some((f) => f.quizStatus === 'GENERATED')
  );
}

export function MaterialCard({
  material,
  onReadNotes,
  onTakeQuiz,
  onDelete,
  isDeleting = false,
}: MaterialCardProps) {
  const notesReady = isNotesReady(material);
  const quizReady = isQuizReady(material);

  return (
    <View className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4.5 gap-3 shadow-2xs">
      {/* Title & Delete Header */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 pr-1">
          <Text variant="h4" numberOfLines={1}>
            {material.title}
          </Text>
          <Text variant="muted" className="mt-0.5" numberOfLines={1}>
            {material.subject?.name ?? 'General'}
          </Text>
        </View>

        <Pressable
          onPress={() => onDelete(material)}
          disabled={isDeleting}
          className="p-1 active:opacity-70"
        >
          <Feather name="trash-2" size={15} color="#A8A29E" />
        </Pressable>
      </View>

      {/* Badges & Date Row */}
      <View className="flex-row items-center gap-2 pt-0.5">
        {/* Notes Ready Badge */}
        <View
          className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md ${
            notesReady ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-amber-50 dark:bg-amber-950/50'
          }`}
        >
          <Feather
            name={notesReady ? 'check' : 'clock'}
            size={12}
            color={notesReady ? APP_COLORS.successDark : APP_COLORS.warningDark}
          />
          <Text
            className={`text-xs font-medium ${
              notesReady ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {notesReady ? 'Notes ready' : 'Processing'}
          </Text>
        </View>

        {/* Quiz Ready Badge */}
        <View
          className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md ${
            quizReady ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-stone-100 dark:bg-stone-800'
          }`}
        >
          <Feather
            name="zap"
            size={12}
            color={quizReady ? APP_COLORS.quizBlue : APP_COLORS.textMuted}
          />
          <Text
            className={`text-xs font-medium ${
              quizReady ? 'text-blue-700 dark:text-blue-400' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {quizReady ? 'Quiz ready' : 'Quiz pending'}
          </Text>
        </View>

        {/* Date */}
        <Text variant="caption" className="font-medium ml-auto">
          {formatShortDate(material.createdAt)}
        </Text>
      </View>

      {/* Action Buttons Row: Read notes & Take quiz */}
      <View className="flex-row items-center gap-2.5 pt-1">
        <Button
          variant="outline"
          onPress={() => onReadNotes(material)}
          className="flex-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl h-10 flex-row items-center justify-center gap-1.5"
        >
          <Feather name="book-open" size={14} color="#57534E" />
          <Text variant="subhead">
            Read notes
          </Text>
        </Button>

        <Button
          onPress={() => onTakeQuiz(material)}
          style={{ backgroundColor: APP_COLORS.quizBlue }}
          className="flex-1 rounded-xl h-10 flex-row items-center justify-center gap-1.5 shadow-2xs border-0"
        >
          <Feather name="zap" size={14} color="#FFFFFF" />
          <Text className="text-xs font-bold text-white">
            Take quiz
          </Text>
        </Button>
      </View>
    </View>
  );
}
