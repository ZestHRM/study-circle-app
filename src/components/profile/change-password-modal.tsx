import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/theme-preference";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas";
import { profileApi } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal = React.memo(function ChangePasswordModal({
  open,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const { isDark } = useThemePreference();
  const { token } = useAuth();
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const newPasswordRef = React.useRef<TextInput>(null);
  const confirmPasswordRef = React.useRef<TextInput>(null);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleClose = React.useCallback(() => {
    reset();
    setGeneralError(null);
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: ChangePasswordValues) => {
    setGeneralError(null);
    try {
      await profileApi.changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        token,
      );

      showSuccessToast(
        "Password Changed",
        "Your password has been updated successfully.",
      );
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to change password.");
      setGeneralError(msg);
      showErrorToast("Change Password Error", msg);
    }
  };

  if (!open) return null;

  const sheetBgColor = isDark ? "#0c0a09" : "#ffffff";

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <Animated.View
          style={{
            maxHeight: "85%",
            width: "100%",
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView
            edges={["bottom"]}
            style={{
              width: "100%",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              overflow: "hidden",
              backgroundColor: sheetBgColor,
            }}
            className="bg-card"
          >
            {/* Sheet Header */}
            <View
              {...panResponder.panHandlers}
              style={{ backgroundColor: sheetBgColor }}
              className="px-5 pt-3 pb-3 border-b border-border flex-row items-center justify-between bg-card"
            >
              <View className="flex-1">
                <View className="w-12 h-1.5 bg-border rounded-full self-center mb-2.5" />
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Icon name="lock" size="sm" color="primary" />
                  </View>
                  <Text variant="h3">Change Password</Text>
                </View>
              </View>

              <Pressable
                onPress={handleClose}
                className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-75 ml-2"
                hitSlop={8}
              >
                <Icon name="x" size={18} className="text-muted-foreground" />
              </Pressable>
            </View>

            {/* Form Scroll Area */}
            <ScrollView
              style={{ backgroundColor: sheetBgColor }}
              className="px-5 py-4 bg-card"
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-4 pb-6">
                <Text variant="caption" className="text-muted-foreground">
                  Update your password to keep your StudyCircle account secure.
                </Text>

                {/* Current Password Field */}
                <Controller
                  control={control}
                  name="currentPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Current Password"
                      placeholder="Enter current password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      onSubmitEditing={() => newPasswordRef.current?.focus()}
                      returnKeyType="next"
                      error={errors.currentPassword?.message}
                    />
                  )}
                />

                {/* New Password Field */}
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      ref={newPasswordRef}
                      label="New Password"
                      placeholder="At least 6 characters"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                      returnKeyType="next"
                      error={errors.newPassword?.message}
                    />
                  )}
                />

                {/* Confirm Password Field */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      ref={confirmPasswordRef}
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />

                {generalError ? (
                  <Text variant="error" className="text-sm">
                    {generalError}
                  </Text>
                ) : null}

                {/* Submit Action Button */}
                <View className="pt-2">
                  <Button
                    variant="quiz"
                    size="lg"
                    title={
                      isSubmitting ? "Updating Password..." : "Update Password"
                    }
                    icon="check-circle"
                    loading={isSubmitting}
                    onPress={handleSubmit(onSubmit)}
                    className="w-full h-12 rounded-2xl justify-center items-center"
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
});
