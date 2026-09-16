import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/lib/utils/toast";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { marked } from "marked";
import * as React from "react";
import { Linking, Platform } from "react-native";

// Configure marked once for performance (breaks: true preserves single newlines)
marked.setOptions({
  gfm: true,
  breaks: true,
});

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
        // 1. If AI Generated Notes content is available, generate PDF from AI notes
        if (content && content.trim()) {
          const formattedTitle = title || "AI Study Notes";

          // Parse markdown / plain text / HTML into clean, optimized HTML5
          const parsedBodyHtml = await marked.parse(content);

          const fullHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${formattedTitle}</title>
                <style>
                  @page {
                    margin: 20mm;
                  }
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    padding: 32px;
                    color: #1c1917;
                    background-color: #ffffff;
                    line-height: 1.7;
                  }
                  .header {
                    border-bottom: 2px solid #ea580c;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                  }
                  h1 {
                    color: #0c0a09;
                    font-size: 24px;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                  }
                  .meta {
                    color: #78716c;
                    font-size: 13px;
                    font-weight: 500;
                  }
                  .notes-content {
                    font-size: 15px;
                    color: #292524;
                  }
                  .notes-content h1, .notes-content h2, .notes-content h3, .notes-content h4 {
                    page-break-after: avoid;
                    break-after: avoid;
                  }
                  .notes-content h1 {
                    font-size: 20px;
                    color: #ea580c;
                    border-bottom: 1px solid #e7e5e4;
                    padding-bottom: 6px;
                    margin-top: 28px;
                    margin-bottom: 14px;
                  }
                  .notes-content h2 {
                    font-size: 18px;
                    color: #ea580c;
                    border-bottom: 1px solid #f5f5f4;
                    padding-bottom: 4px;
                    margin-top: 24px;
                    margin-bottom: 12px;
                  }
                  .notes-content h3 {
                    font-size: 16px;
                    color: #0c0a09;
                    margin-top: 20px;
                    margin-bottom: 8px;
                  }
                  .notes-content p {
                    margin-top: 0;
                    margin-bottom: 14px;
                    line-height: 1.7;
                  }
                  .notes-content ul, .notes-content ol {
                    padding-left: 22px;
                    margin-top: 4px;
                    margin-bottom: 16px;
                  }
                  .notes-content li {
                    margin-bottom: 6px;
                    line-height: 1.6;
                  }
                  .notes-content strong, .notes-content b {
                    color: #0c0a09;
                    font-weight: 700;
                  }
                  .notes-content blockquote {
                    border-left: 4px solid #ea580c;
                    background-color: #fff7ed;
                    margin: 16px 0;
                    padding: 12px 16px;
                    color: #9a3412;
                    border-radius: 0 8px 8px 0;
                  }
                  .notes-content code {
                    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                    background-color: #f5f5f4;
                    color: #ea580c;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 13px;
                  }
                  .notes-content pre {
                    background-color: #1c1917;
                    color: #f5f5f4;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 16px 0;
                  }
                  .notes-content pre code {
                    background-color: transparent;
                    color: #f5f5f4;
                    padding: 0;
                  }
                  .notes-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                  }
                  .notes-content th, .notes-content td {
                    border: 1px solid #e7e5e4;
                    padding: 10px 14px;
                    text-align: left;
                  }
                  .notes-content th {
                    background-color: #fff7ed;
                    color: #9a3412;
                    font-weight: 600;
                  }
                  .footer {
                    margin-top: 40px;
                    border-top: 1px solid #e7e5e4;
                    padding-top: 12px;
                    font-size: 12px;
                    color: #a8a29e;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${formattedTitle}</h1>
                  <div class="meta">Subject: ${subjectName} • Generated by StudyCircle AI</div>
                </div>
                <div class="notes-content">
                  ${parsedBodyHtml}
                </div>
                <div class="footer">
                  Generated with StudyCircle AI App
                </div>
              </body>
            </html>
          `;

          if (Platform.OS === "web" && typeof document !== "undefined") {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              printWindow.document.write(fullHtml);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => {
                printWindow.print();
              }, 250);
              return true;
            }
          }

          // Use expo-print to generate PDF file on native
          const { uri } = await Print.printToFileAsync({
            html: fullHtml,
            base64: false,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              UTI: ".pdf",
              mimeType: "application/pdf",
              dialogTitle: `Download ${formattedTitle} PDF`,
            });
            showSuccessToast("Success", "Notes PDF exported successfully!");
            return true;
          }
        }

        // 2. Otherwise if direct PDF/file URL is provided for AI Notes
        if (url) {
          if (url.startsWith("http")) {
            await WebBrowser.openBrowserAsync(url);
            return true;
          }

          if (Platform.OS === "web" && typeof window !== "undefined") {
            window.open(url, "_blank");
            return true;
          }

          await Linking.openURL(url);
          return true;
        }

        const msg = "No AI notes content available to export as PDF.";
        setDownloadError(msg);
        showInfoToast("Download Unavailable", msg);
        return false;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unable to export AI notes PDF.";
        setDownloadError(msg);
        showErrorToast("Download Error", msg);
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
