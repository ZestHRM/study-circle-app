/**
 * Shared Tailwind Style Presets & Class Utilities
 * Consolidates repeated class strings into reusable design system constants
 * to prevent repeated ad-hoc class strings across components.
 */

export const UI_STYLES = {
  // Card Container Styles
  card: "bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 gap-3 shadow-2xs",
  cardPadded: "bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-4.5 gap-3.5 shadow-xs",
  cardInteractive: "bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 gap-3 shadow-2xs active:opacity-95",

  // Layout & Alignment Helpers
  rowBetween: "flex-row items-center justify-between",
  rowStart: "flex-row items-start justify-between",
  rowCenter: "flex-row items-center",

  // Section Headers
  sectionHeaderTitle: "text-xl font-extrabold text-stone-900 dark:text-stone-100",

  // Screen Container Base
  screenSafeArea: "bg-background flex-1",
} as const;
