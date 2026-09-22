import { AppScreen } from "@/components/ui/app-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommonHeader } from "@/components/ui/common-header";
import { FormInput } from "@/components/ui/form-input";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useUpdateProfileMutation } from "@/hooks/queries/use-profile";
import { useAuth } from "@/lib/auth";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/schemas/profile.schema";
import type { EducationLevel } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

const EDUCATION_LEVEL_OPTIONS: { label: string; value: EducationLevel }[] = [
  { label: "School", value: "School" },
  { label: "College", value: "College" },
  { label: "Coaching", value: "Coaching" },
  { label: "Competitive Exams", value: "CompetitiveExams" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  const initialValues = React.useMemo<UpdateProfileValues>(
    () => ({
      name: user?.name || "",
      phone: user?.phone || "",
      institute: user?.institute || "",
      level: (user?.level as EducationLevel) || "College",
      classOrStandard: user?.classOrStandard || "",
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
      zipcode: user?.zipcode || "",
    }),
    [user],
  );

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initialValues,
  });

  const onSubmit = React.useCallback(
    async (values: UpdateProfileValues) => {
      // Send ONLY changed/dirty fields to backend (optimized payload)
      const dirtyPayload: Partial<UpdateProfileValues> = {};

      (Object.keys(values) as (keyof UpdateProfileValues)[]).forEach((key) => {
        const newVal = values[key]?.trim();
        const oldVal = (initialValues[key] || "").trim();

        if (newVal !== undefined && newVal !== oldVal) {
          (dirtyPayload as any)[key] = newVal;
        }
      });

      // If user level was changed specifically
      if (values.level !== initialValues.level && values.level) {
        dirtyPayload.level = values.level;
      }

      if (Object.keys(dirtyPayload).length === 0) {
        router.back();
        return;
      }

      try {
        await updateProfileMutation.mutateAsync(dirtyPayload as any);
        router.back();
      } catch {
        // Error toast handled inside mutation onError
      }
    },
    [initialValues, updateProfileMutation, router],
  );

  return (
    <AppScreen
      header={
        <CommonHeader
          title="Edit Profile"
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/profile");
            }
          }}
        />
      }
      scrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 48,
      }}
    >
      <View className="mx-auto w-full max-w-md gap-5">
        {/* Personal Details Section */}
        <Card className="rounded-3xl p-5 gap-4">
          <View className="flex-row items-center gap-2.5 border-b border-border pb-3">
            <View className="w-8 h-8 rounded-xl bg-blue-500/15 items-center justify-center">
              <Icon name="user" size="sm" color="primary" />
            </View>
            <Text variant="h3">Personal Information</Text>
          </View>

          <View className="gap-3.5">
            <FormInput
              control={control}
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
            />
            <FormInput
              control={control}
              name="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
        </Card>

        {/* Academic Details Section */}
        <Card className="rounded-3xl p-5 gap-4">
          <View className="flex-row items-center gap-2.5 border-b border-border pb-3">
            <View className="w-8 h-8 rounded-xl bg-orange-500/15 items-center justify-center">
              <Icon name="book-open" size="sm" color="terracotta" />
            </View>
            <Text variant="h3">Academic Information</Text>
          </View>

          <View className="gap-3.5">
            <FormInput
              control={control}
              name="institute"
              label="Institute / University"
              placeholder="e.g. XYZ College"
            />

            {/* Education Level Selector */}
            <View className="gap-1.5">
              <Text variant="caption" className="font-semibold text-foreground">
                Education Level
              </Text>
              <Controller
                control={control}
                name="level"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={
                      value
                        ? { label: value, value }
                        : { label: "College", value: "College" }
                    }
                    onValueChange={(option) => {
                      if (option?.value) {
                        onChange(option.value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl bg-card border-border">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollView className="max-h-48">
                        {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                          />
                        ))}
                      </ScrollView>
                    </SelectContent>
                  </Select>
                )}
              />
            </View>

            <FormInput
              control={control}
              name="classOrStandard"
              label="Class / Standard / Year"
              placeholder="e.g. 2nd Year, 12th Grade"
            />
          </View>
        </Card>

        {/* Location Details Section */}
        <Card className="rounded-3xl p-5 gap-4">
          <View className="flex-row items-center gap-2.5 border-b border-border pb-3">
            <View className="w-8 h-8 rounded-xl bg-purple-500/15 items-center justify-center">
              <Icon name="map-pin" size="sm" color="quiz" />
            </View>
            <Text variant="h3">Location Details</Text>
          </View>

          <View className="gap-3.5">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="city"
                  label="City"
                  placeholder="e.g. Bhopal"
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="state"
                  label="State"
                  placeholder="e.g. Madhya Pradesh"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="country"
                  label="Country"
                  placeholder="e.g. India"
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="zipcode"
                  label="Zipcode"
                  placeholder="e.g. 462001"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 pt-2">
          <Button
            title={
              updateProfileMutation.isPending || isSubmitting
                ? "Saving Changes..."
                : "Save Profile Changes"
            }
            variant="default"
            disabled={updateProfileMutation.isPending || isSubmitting}
            loading={updateProfileMutation.isPending || isSubmitting}
            onPress={() => void handleSubmit(onSubmit)()}
            className="w-full h-12 rounded-2xl"
          />
          <Button
            title="Cancel"
            variant="outline"
            disabled={updateProfileMutation.isPending || isSubmitting}
            onPress={() => router.back()}
            className="w-full h-11 rounded-2xl border-border"
          />
        </View>
      </View>
    </AppScreen>
  );
}
