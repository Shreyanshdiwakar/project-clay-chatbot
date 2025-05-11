import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academic Counselor AI | Plan Your College Activities",
  description: "Get personalized guidance on extracurricular activities to enhance your college applications",
  keywords: ["academic counseling", "college prep", "extracurricular planning", "AI advisor"],
  authors: [{ name: "Project Clay" }],
  icons: {
    icon: [
      { url: '/projectclay-logo.svg', sizes: '32x32' },
      { url: '/projectclay-logo.svg', sizes: '64x64' },
      { url: '/projectclay-logo.svg', sizes: '96x96' }
    ],
    apple: [
      { url: '/projectclay.jpg', sizes: '180x180' }
    ],
    shortcut: [{ url: '/projectclay-logo.svg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        {/* Primary favicon */}
        <link rel="icon" href="/projectclay-logo.svg" sizes="32x32" />
        
        {/* Fallback for older browsers */}
        <link rel="alternate icon" href="/favicon.ico" sizes="48x48" />
        
        {/* Apple Touch Icon for iOS devices */}
        <link rel="apple-touch-icon" href="/projectclay.jpg" sizes="180x180" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-black text-white`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
