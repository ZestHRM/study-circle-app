export const APP_COLORS = {
  // Primary Brand Purple Colors
  primary: '#582BE8',
  primaryHover: '#4B22CF',
  primaryLight: '#F4F3FF',
  primaryDark: '#411CA4',
  brandPurple: '#582BE8',
  brandPurpleLight: '#F4F3FF',
  brandPurpleBorder: '#C7C3FF',

  // Terracotta / Primary Action Colors
  terracotta: '#D95B38',
  terracottaHover: '#C04928',
  terracottaLight: '#FEEAE3',

  // Quiz / Secondary Blue Action Colors
  quizBlue: '#2563EB',
  quizBlueHover: '#1D4ED8',
  quizBlueLight: '#DBEAFE',

  // Neutrals & Monochromes
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Stone & Gray Scale Tokens
  stone50: '#FAF8F5',
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone300: '#D6D3D1',
  stone400: '#A8A29E',
  stone500: '#78716C',
  stone600: '#57534E',
  stone700: '#44403C',
  stone800: '#292524',
  stone900: '#1C1917',
  stone950: '#0C0A09',

  // Gray Icon Tokens
  grayMuted: '#A3A3A3',
  grayIcon: '#737373',
  grayDark: '#525252',

  // Status & System Colors
  success: '#10B981',
  successDark: '#047857',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningDark: '#C2410C',
  warningLight: '#FFEDD5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  infoBlue: '#3B82F6',

  // Background & Surface Tokens
  backgroundLight: '#FAF8F5',
  backgroundDark: '#0C0A09',
  cardLight: '#FFFFFF',
  cardDark: '#1C1917',

  // Icon & Text Tokens
  textDark: '#1C1917',
  textMuted: '#78716C',
  textLight: '#F5F5F4',
  iconMuted: '#78716C',
  iconLight: '#A8A29E',

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
