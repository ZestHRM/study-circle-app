import { APP_COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export interface SubjectSelectOption {
  value: string;
  label: string;
}

export interface SubjectSelectDropdownProps {
  /** Currently selected subject ID (string, or empty string "" for none/all) */
  value: string;
  /** Callback fired when a subject option is selected */
  onValueChange: (value: string) => void;
  /** Array of subjects (Subject[]) or option items ({ value: string, label: string }[]) */
  subjects?: Array<any>;
  /** Custom options override */
  options?: SubjectSelectOption[];
  /** Placeholder text displayed when no option is selected */
  placeholder?: string;
  /** Include an "All Subjects" option at top of list (default: false) */
  showAllOption?: boolean;
  /** Label for the all option (default: "All Subjects") */
  allOptionLabel?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Trigger class overrides */
  triggerClassName?: string;
}

/**
 * Reusable Subject Select Dropdown primitive.
 * Displays a clean trigger input and opens a Modal overlay for options selection.
 * Works seamlessly inside Screens, Modals, Dialogs, and Bottom Sheets.
 */
export const SubjectSelectDropdown = React.memo(
  function SubjectSelectDropdown({
    value,
    onValueChange,
    subjects = [],
    options,
    placeholder = 'Select subject...',
    showAllOption = false,
    allOptionLabel = 'All Subjects',
    isLoading = false,
    disabled = false,
    triggerClassName,
  }: SubjectSelectDropdownProps) {
    const [modalVisible, setModalVisible] = React.useState(false);

    const parsedOptions = React.useMemo<SubjectSelectOption[]>(() => {
      if (options && options.length > 0) return options;

      const items: SubjectSelectOption[] = [];

      if (showAllOption) {
        items.push({ value: '', label: allOptionLabel });
      }

      for (const item of subjects) {
        if (!item) continue;
        if ('id' in item && 'name' in item && item.id != null) {
          items.push({ value: String(item.id), label: String(item.name) });
        } else if ('value' in item && 'label' in item && item.value != null) {
          items.push({ value: String(item.value), label: String(item.label) });
        }
      }

      return items;
    }, [subjects, options, showAllOption, allOptionLabel]);

    const selectedOption = React.useMemo(() => {
      const match = parsedOptions.find((opt) => opt.value === String(value));
      if (match) return match;
      if (value === '' && showAllOption) {
        return { value: '', label: allOptionLabel };
      }
      return null;
    }, [parsedOptions, value, showAllOption, allOptionLabel]);

    const handleSelectOption = React.useCallback(
      (optValue: string) => {
        onValueChange(optValue);
        setModalVisible(false);
      },
      [onValueChange]
    );

    const handleOpen = React.useCallback(() => {
      if (disabled || isLoading) return;
      setModalVisible(true);
    }, [disabled, isLoading]);

    const handleClose = React.useCallback(() => {
      setModalVisible(false);
    }, []);

    const displayText = selectedOption
      ? selectedOption.label
      : isLoading
      ? 'Loading subjects...'
      : placeholder;

    return (
      <>
        {/* Trigger Button */}
        <Pressable
          onPress={handleOpen}
          disabled={disabled || isLoading}
          className={cn(
            'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl h-14 px-5 flex-row items-center justify-between shadow-2xs active:opacity-80',
            triggerClassName
          )}
        >
          <Text
            numberOfLines={1}
            className={`text-base flex-1 pr-2 ${
              selectedOption
                ? 'text-stone-900 dark:text-stone-100 font-medium'
                : 'text-stone-400 dark:text-stone-500 font-medium'
            }`}
          >
            {displayText}
          </Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={APP_COLORS.primary} />
          ) : (
            <Feather name="chevron-down" size={18} color={APP_COLORS.stone500} />
          )}
        </Pressable>

        {/* Modal Overlay for Dropdown Options List */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleClose}
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View className="flex-1 bg-black/50 justify-center items-center p-5">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[70vh] gap-4">
                  {/* Modal Header */}
                  <View className="flex-row items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                    <Text className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Select Subject
                    </Text>
                    <Pressable
                      onPress={handleClose}
                      className="p-1 rounded-full bg-stone-100 dark:bg-stone-800 active:opacity-70"
                    >
                      <Feather name="x" size={16} color={APP_COLORS.stone500} />
                    </Pressable>
                  </View>

                  {/* Options List */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={{ gap: 6 }}
                  >
                    {parsedOptions.length === 0 ? (
                      <View className="py-8 items-center justify-center">
                        <Text className="text-xs text-stone-400 dark:text-stone-500">
                          No subjects available
                        </Text>
                      </View>
                    ) : (
                      parsedOptions.map((opt) => {
                        const isSelected = String(value) === opt.value;
                        return (
                          <Pressable
                            key={opt.value || '__all__'}
                            onPress={() => handleSelectOption(opt.value)}
                            className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500/40'
                                : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-100 dark:border-stone-800 active:bg-stone-100 dark:active:bg-stone-800'
                            }`}
                          >
                            <Text
                              className={`text-sm flex-1 pr-2 ${
                                isSelected
                                  ? 'font-bold text-purple-700 dark:text-purple-300'
                                  : 'font-medium text-stone-800 dark:text-stone-200'
                              }`}
                              numberOfLines={1}
                            >
                              {opt.label}
                            </Text>
                            {isSelected ? (
                              <Feather
                                name="check-circle"
                                size={18}
                                color={APP_COLORS.primary}
                              />
                            ) : null}
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }
);
