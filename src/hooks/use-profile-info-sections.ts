import type { ProfileInfoRow } from "@/components/profile";
import type { User } from "@/services";
import type { InfoCardSection } from "@/types/profile";
import * as React from "react";

export function useProfileInfoSections(
  user: User | null | undefined,
): InfoCardSection[] {
  const personalRows = React.useMemo<ProfileInfoRow[]>(
    () => [
      {
        label: "Full Name",
        value: user?.name || "N/A",
        iconName: "user-check",
      },
      {
        label: "Email Address",
        value: user?.email || "N/A",
        iconName: "mail",
        verified: Boolean(user?.email),
      },
      {
        label: "Phone",
        value: user?.phone || "Not provided",
        iconName: "phone",
      },
    ],
    [user?.name, user?.email, user?.phone],
  );

  const academicRows = React.useMemo<ProfileInfoRow[]>(
    () => [
      {
        label: "Institute / University",
        value: user?.institute || "Study Circle",
        iconName: "book-open",
      },
      {
        label: "Target Exam / Field",
        value: (user as any)?.targetExam || "General Learning",
        iconName: "target",
      },
    ],
    [user?.institute, (user as any)?.targetExam],
  );

  const locationRows = React.useMemo<ProfileInfoRow[]>(() => {
    const locParts = [user?.city, user?.state, user?.country].filter(Boolean);
    const regionText =
      locParts.length > 0 ? locParts.join(", ") : "Not provided";

    const rows: ProfileInfoRow[] = [
      { label: "Region", value: regionText, iconName: "map-pin" },
    ];
    if (user?.zipcode) {
      rows.push({ label: "Zipcode", value: user.zipcode, iconName: "hash" });
    }
    return rows;
  }, [user?.city, user?.state, user?.country, user?.zipcode]);

  return React.useMemo<InfoCardSection[]>(
    () => [
      {
        key: "personal",
        title: "Personal Information",
        headerIcon: "user",
        headerIconColor: "primary",
        headerIconBgClass: "bg-blue-500/15",
        rows: personalRows,
      },
      {
        key: "academic",
        title: "Academic Profile",
        headerIcon: "book-open",
        headerIconColor: "terracotta",
        headerIconBgClass: "bg-orange-500/15",
        rows: academicRows,
      },
      {
        key: "location",
        title: "Location Details",
        headerIcon: "map-pin",
        headerIconColor: "quiz",
        headerIconBgClass: "bg-purple-500/15",
        rows: locationRows,
      },
    ],
    [personalRows, academicRows, locationRows],
  );
}
