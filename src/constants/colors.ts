export const APP_COLORS = {
  // Primary Brand Purple Colors
  primary: '#8B5CF6',
  primaryHover: '#7C3AED',
  primaryLight: '#F3E8FF',
  primaryDark: '#6D28D9',

  // Terracotta / Upload Action Colors
  terracotta: '#D95B38',
  terracottaHover: '#C24E2E',
  terracottaLight: '#FEEAE3',

  // Quiz / Secondary Action Colors
  quizBlue: '#2563EB',
  quizBlueHover: '#1D4ED8',
  quizBlueLight: '#DBEAFE',

  // Status Colors
  success: '#10B981',
  successDark: '#047857',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningDark: '#C2410C',
  warningLight: '#FFEDD5',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Background & Surfaces
  backgroundLight: '#FAF8F5',
  backgroundDark: '#0C0A09',
  cardLight: '#FFFFFF',
  cardDark: '#1C1917',

  // Text Colors
  textDark: '#1C1917',
  textMuted: '#78716C',
  textLight: '#F5F5F4',

  // Subject Chip Pastel Palette
  subjectPalette: [
    { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', border: 'border-[#8B5CF6]', hex: '#8B5CF6', bgHex: '#EDE9FE' },
    { bg: 'bg-[#D1FAE5]', text: 'text-[#047857]', border: 'border-[#10B981]', hex: '#10B981', bgHex: '#D1FAE5' },
    { bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#F97316]', hex: '#F97316', bgHex: '#FFEDD5' },
    { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#0EA5E9]', hex: '#0EA5E9', bgHex: '#E0F2FE' },
    { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]', border: 'border-[#EC4899]', hex: '#EC4899', bgHex: '#FCE7F3' },
  ],
} as const;

export type AppColorToken = typeof APP_COLORS;
