import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_COLORS } from '@/constants/colors';
import { formatShortDate } from '@/lib/utils/formatters';
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

function isNotesReady(material: StudyMaterial): boolean {
  return Boolean(
    material.notesId ||
      (material.notes && material.notes.length > 0) ||
      material.processedNotes ||
      material.status === 'PROCESSED' ||
      material.status === 'NOTES_GENERATED' ||
      material.files?.some((f) => f.status === 'NOTES_GENERATED' || f.status === 'PROCESSED')
  );
}

function isQuizReady(material: StudyMaterial): boolean {
  return Boolean(
    material.quizId ||
      (material.quizzes && material.quizzes.length > 0) ||
      material.quizStatus === 'GENERATED' ||
      material.files?.some((f) => f.quizStatus === 'GENERATED')
  );
}

export const MaterialCard = React.memo(function MaterialCard({
  material,
  onReadNotes,
  onTakeQuiz,
  onDelete,
  isDeleting = false,
}: MaterialCardProps) {
  const notesReady = isNotesReady(material);
  const quizReady = isQuizReady(material);

  const handleDeletePress = React.useCallback(() => {
    onDelete(material);
  }, [onDelete, material]);

  const handleReadNotesPress = React.useCallback(() => {
    onReadNotes(material);
  }, [onReadNotes, material]);

  const handleTakeQuizPress = React.useCallback(() => {
    onTakeQuiz(material);
  }, [onTakeQuiz, material]);

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
          onPress={handleDeletePress}
          disabled={isDeleting}
          className="p-1 active:opacity-70"
        >
          <Feather name="trash-2" size={15} color={APP_COLORS.iconLight} />
        </Pressable>
      </View>

      {/* Badges & Date Row */}
      <View className="flex-row items-center gap-2 pt-0.5">
        {/* Notes Ready Badge */}
        <Badge
          icon={notesReady ? 'check' : 'clock'}
          label={notesReady ? 'Notes ready' : 'Processing'}
          variant={notesReady ? 'emerald' : 'amber'}
        />

        {/* Quiz Ready Badge */}
        <Badge
          icon="zap"
          label={quizReady ? 'Quiz ready' : 'Quiz pending'}
          variant={quizReady ? 'blue' : 'default'}
        />

        {/* Date */}
        <Text variant="caption" className="font-medium ml-auto">
          {formatShortDate(material.createdAt)}
        </Text>
      </View>

      {/* Action Buttons Row: Read notes & Take quiz */}
      <View className="flex-row items-center gap-2.5 pt-1">
        <Button
          variant="outline"
          icon="book-open"
          iconSize={14}
          onPress={handleReadNotesPress}
          disabled={!notesReady}
          className="flex-1 h-10 rounded-xl justify-center items-center"
        >
          {notesReady ? 'Read notes' : 'Notes pending'}
        </Button>

        <Button
          variant="quiz"
          icon="zap"
          iconSize={14}
          onPress={handleTakeQuizPress}
          disabled={!quizReady}
          className="flex-1 h-10 rounded-xl justify-center items-center"
        >
          {quizReady ? 'Take quiz' : 'Quiz pending'}
        </Button>
      </View>
    </View>
  );
});

