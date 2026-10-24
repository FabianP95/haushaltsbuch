import type { Metadata } from "next";
import "./globals.scss";


export const metadata: Metadata = {
  title: {
    template: "%s | Haushaltsbuch",
    default: "Haushaltsbuch",
  },
  description: "Digitales Haushaltsbuch zum Erfassen und Auswerten von Einnahmen und Ausgaben",
  // bar chart icon from public/ is shown as favicon in the browser tab
  icons: {
    icon: { url: "/assets/icons/bar_chart.svg", type: "image/svg+xml" },
    // iOS needs a PNG for the icon when the page is added to the iPad home screen
    apple: { url: "/assets/icons/bar_chart.png", sizes: "180x180", type: "image/png" },
  },
};

/**
 * Root layout that wraps every page in the html and body tags.
 * @param props - The page content as `children`
 * @returns The HTML document shell
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
