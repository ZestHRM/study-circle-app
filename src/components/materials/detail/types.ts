export type TabType = "material" | "notes" | "quiz";

export interface NoteSection {
  id: string;
  heading: string;
  bullets: string[];
}
