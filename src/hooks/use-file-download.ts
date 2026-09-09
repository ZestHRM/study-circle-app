import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Alert, Linking, Platform, Share } from "react-native";

export type DownloadSource = {
  url?: string | null;
  title?: string;
  subjectName?: string;
  content?: string | null;
};

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const downloadFile = React.useCallback(
    async (source: DownloadSource): Promise<boolean> => {
      const { url, title, subjectName = "General", content } = source;
      setIsDownloading(true);
      setDownloadError(null);

      try {
        if (url) {
          if (url.startsWith("http")) {
            await WebBrowser.openBrowserAsync(url);
            return true;
          }

          if (Platform.OS === "web") {
            window.open(url, "_blank");
            return true;
          }

          await Linking.openURL(url);
          return true;
        }

        // Fallback: Share raw notes content if no direct PDF URL is available
        if (content && content.trim()) {
          const plainText = content
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "");

          await Share.share({
            title: title || "AI Study Notes",
            message: `${title || "AI Study Notes"}\nSubject: ${subjectName}\n\n${plainText}`,
          });
          return true;
        }

        const msg = "No PDF file link or notes content available for download.";
        setDownloadError(msg);
        Alert.alert("Download Unavailable", msg);
        return false;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unable to download or share file.";
        setDownloadError(msg);
        Alert.alert("Download Error", msg);
        return false;
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  return {
    isDownloading,
    downloadError,
    downloadFile,
  };
}
