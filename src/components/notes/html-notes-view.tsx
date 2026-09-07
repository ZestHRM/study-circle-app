import RenderHtml from 'react-native-render-html';
import * as React from 'react';
import { useColorScheme, useWindowDimensions, View } from 'react-native';
import { APP_COLORS } from '@/constants/colors';

interface HtmlNotesViewProps {
  content?: string | null;
  contentWidth?: number;
}

export function HtmlNotesView({ content, contentWidth }: HtmlNotesViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const htmlSource = React.useMemo(() => {
    if (!content || !content.trim()) {
      return { html: '<div>No content available.</div>' };
    }

    // Convert newlines to HTML breaks if needed
    const formatted = content
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '<br />');

    return { html: `<div class="notes-container">${formatted}</div>` };
  }, [content]);

  const tagsStyles = React.useMemo(
    () => ({
      body: {
        color: isDark ? '#E7E5E4' : '#1C1917',
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'System',
      },
      div: {
        color: isDark ? '#E7E5E4' : '#1C1917',
      },
      b: {
        color: APP_COLORS.primary,
        fontSize: 15,
        fontWeight: '700' as const,
        marginTop: 12,
        marginBottom: 4,
      },
      strong: {
        color: APP_COLORS.primary,
        fontWeight: '700' as const,
      },
      p: {
        marginTop: 4,
        marginBottom: 8,
      },
    }),
    [isDark]
  );

  return (
    <View className="w-full">
      <RenderHtml
        contentWidth={contentWidth ?? windowWidth - 48}
        source={htmlSource}
        tagsStyles={tagsStyles}
      />
    </View>
  );
}
