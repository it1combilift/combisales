import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/context";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CombiSales",
  description: "Combilift Sales Management App",
  icons: {
    icon: [
      {
        url: "https://www.combilift.es/wp-content/uploads/2025/10/images.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://www.combilift.es/wp-content/uploads/2025/10/images.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "https://www.combilift.es/wp-content/uploads/2025/10/images.png",
        type: "image/svg+xml",
      },
    ],
    apple: "https://www.combilift.es/wp-content/uploads/2025/10/images.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased p-0`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>{children}</I18nProvider>
            <Toaster richColors position="bottom-right" />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
