import type { ProfileInfoRow } from "@/components/profile";
import type { IconColorPreset } from "@/components/ui/icon";

export type InfoCardSection = {
  key: string;
  title: string;
  headerIcon: string;
  headerIconColor: IconColorPreset;
  headerIconBgClass: string;
  rows: ProfileInfoRow[];
};
